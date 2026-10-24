/// <reference types="jest" />

import { InternalServerErrorException } from '@nestjs/common';
import { EstadoAlerta, OrigenAlerta } from '@/alertas/dominio/enums/alerta-enums';
import { RolAtencion } from '@/alertas/dominio/enums/atencion-enums';
import { TipoEvento } from '@/alertas/dominio/enums/evento-enums';
import { AgregarFuncionarioUseCase } from './atenciones/agregar-funcionario.use-case';
import { CrearAtencionCompletaUseCase } from './atenciones/crear-atencion-completa.use-case';
import { ObtenerAlertaPorIdUseCase } from './obtener-detalle-alerta.use-case';
import { ObtenerFuncionariosLlegadosUseCase } from './obtener-funcionarios-llegados.use-case';

describe('Flujo de asignación de policías y resiliencia ante caída del servicio de Personal', () => {
  describe('CrearAtencionCompletaUseCase (Asignación inicial manual)', () => {
    it('debe persistir el grado y nombre completo ingresados manualmente', async () => {
      const atencionRepositorio = {
        existePorAlerta: jest.fn().mockResolvedValue(false),
        crearAtencionCompleta: jest.fn().mockResolvedValue(undefined),
      };
      const alertaRepositorio = {
        obtenerAlertaSimple: jest.fn().mockResolvedValue({ id: 'alerta-1', idVictima: 'victima-1' }),
      };
      const eventoDominioService = {
        registrarEventoSemiautomatico: jest.fn().mockResolvedValue(undefined),
      };
      const notificarVictimaAlertaUseCase = {
        ejecutar: jest.fn().mockResolvedValue(undefined),
      };

      const useCase = new CrearAtencionCompletaUseCase(atencionRepositorio as never, alertaRepositorio as never, eventoDominioService as never, notificarVictimaAlertaUseCase as never);

      const entrada = {
        idAlerta: 'alerta-1',
        siglaVehiculo: 'V-10',
        siglaRadio: 'R-05',
        funcionarios: [
          {
            ciFuncionario: '8877665',
            grado: 'SBTTE.',
            nombreCompleto: 'CARLOS MAMANI QUISPE',
            unidad: 'RADIO PATRULLAS 110',
            rolAtencion: RolAtencion.ENCARGADO,
            turnoInicio: '2026-04-14T08:00:00.000Z',
            turnoFin: '2026-04-14T16:00:00.000Z',
          },
        ],
      };

      await useCase.ejecutar(entrada as never, 'operador-uuid');

      expect(atencionRepositorio.crearAtencionCompleta).toHaveBeenCalledWith(
        expect.objectContaining({
          idAlerta: 'alerta-1',
          siglaVehiculo: 'V-10',
          siglaRadio: 'R-05',
          funcionarios: [
            expect.objectContaining({
              ciFuncionario: '8877665',
              grado: 'SBTTE.',
              nombreCompleto: 'CARLOS MAMANI QUISPE',
              unidad: 'RADIO PATRULLAS 110',
              rolAtencion: RolAtencion.ENCARGADO,
            }),
          ],
        }),
      );
      expect(notificarVictimaAlertaUseCase.ejecutar).toHaveBeenCalled();
      expect(eventoDominioService.registrarEventoSemiautomatico).toHaveBeenCalledWith('alerta-1', TipoEvento.ALERTA_ASIGNADA, 'operador-uuid');
    });
  });

  describe('AgregarFuncionarioUseCase (Agregar policía de apoyo manual)', () => {
    it('debe persistir el grado y nombre completo del nuevo funcionario de apoyo', async () => {
      const atencionRepositorio = {
        obtenerAtencionSimple: jest.fn().mockResolvedValue({ id: 'atencion-1', idAlerta: 'alerta-1' }),
      };
      const atencionFuncionarioRepositorio = {
        obtenerPorAtencion: jest.fn().mockResolvedValue([
          {
            id: 'func-existente-1',
            ciFuncionario: '111111',
            rolAtencion: RolAtencion.ENCARGADO,
          },
        ]),
        agregarFuncionario: jest.fn().mockResolvedValue(undefined),
      };

      const useCase = new AgregarFuncionarioUseCase(atencionFuncionarioRepositorio as never, atencionRepositorio as never);

      const entrada = {
        ciFuncionario: '9988776',
        grado: 'SGTO. 1RO.',
        nombreCompleto: 'JUAN PÉREZ LÓPEZ',
        unidad: 'EPI SUR',
        rolAtencion: RolAtencion.APOYO,
        turnoInicio: '2026-04-14T08:00:00.000Z',
        turnoFin: '2026-04-14T16:00:00.000Z',
      };

      await useCase.ejecutar('atencion-1', entrada as never);

      expect(atencionFuncionarioRepositorio.agregarFuncionario).toHaveBeenCalledWith(
        expect.objectContaining({
          idAtencion: 'atencion-1',
          ciFuncionario: '9988776',
          grado: 'SGTO. 1RO.',
          nombreCompleto: 'JUAN PÉREZ LÓPEZ',
          unidad: 'EPI SUR',
          rolAtencion: RolAtencion.APOYO,
        }),
      );
    });
  });

  describe('ObtenerAlertaPorIdUseCase (Resiliencia ante caída del servicio externo de Personal)', () => {
    it('debe responder exitosamente con los datos locales si el servicio de Personal lanza error 500/timeout', async () => {
      const alertaMock = {
        id: 'alerta-123',
        estadoAlerta: EstadoAlerta.ASIGNADA,
        origen: OrigenAlerta.FELCV,
        atencion: {
          id: 'atencion-123',
          atencionFuncionario: [
            {
              id: 'af-1',
              ciFuncionario: '8877665',
              grado: 'SBTTE.',
              nombreCompleto: 'CARLOS MAMANI QUISPE',
              unidad: 'RADIO PATRULLAS 110',
            },
          ],
        },
      };

      const alertaRepositorio = {
        obtenerDetalleAlerta: jest.fn().mockResolvedValue(alertaMock),
      };
      const datosExternosAttRepo = {
        obtenerAlertaATT: jest.fn(),
      };
      const personalPort = {
        buscarFuncionario: jest.fn().mockRejectedValue(new InternalServerErrorException('Error al buscar funcionario en servicio de Personal')),
      };
      const obtenerProvinciaDepartamentoUseCase = {
        ejecutar: jest.fn().mockResolvedValue(null),
      };

      const useCase = new ObtenerAlertaPorIdUseCase(alertaRepositorio as never, datosExternosAttRepo as never, personalPort as never, obtenerProvinciaDepartamentoUseCase as never);

      const resultado = await useCase.ejecutar('alerta-123');

      // Verificamos que no se cayó con 500 y conservó los datos persistidos en la base de datos
      expect(resultado.alerta).toBeDefined();
      const funcionario = resultado.alerta.atencion?.atencionFuncionario?.[0];
      expect(funcionario).toBeDefined();
      expect(funcionario?.grado).toBe('SBTTE.');
      expect(funcionario?.nombreCompleto).toBe('CARLOS MAMANI QUISPE');
    });
  });

  describe('ObtenerFuncionariosLlegadosUseCase (Resiliencia)', () => {
    it('debe conservar grado y nombreCompleto locales si el servicio externo falla al consultar llegados', async () => {
      const atencionRepo = {
        obtenerPorAlerta: jest.fn().mockResolvedValue({ id: 'atencion-123' }),
      };
      const atencionFuncionarioRepo = {
        obtenerPorAtencion: jest.fn().mockResolvedValue([
          {
            ciFuncionario: '8877665',
            grado: 'CAP.',
            nombreCompleto: 'MIGUEL SUÁREZ',
            fechaLlegada: '2026-04-14T10:00:00.000Z',
            confirmacionVictima: false,
            rolAtencion: RolAtencion.ENCARGADO,
          },
        ]),
      };
      const personalPort = {
        buscarFuncionario: jest.fn().mockRejectedValue(new Error('Conexión rehusada con servicio de Personal')),
      };

      const useCase = new ObtenerFuncionariosLlegadosUseCase(atencionRepo as never, atencionFuncionarioRepo as never, personalPort as never);

      const llegados = await useCase.ejecutar('alerta-123');

      expect(llegados).toHaveLength(1);
      expect(llegados[0].ciFuncionario).toBe('8877665');
      expect(llegados[0].grado).toBe('CAP.');
      expect(llegados[0].nombreCompleto).toBe('MIGUEL SUÁREZ');
    });
  });
});

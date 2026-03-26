import { ConflictException, Inject, Injectable } from '@nestjs/common';

import { v4 as uuidv4 } from 'uuid';

import { EstadoAlerta } from '@/alertas/dominio/enums/alerta-enums';
import { RolAtencion } from '@/alertas/dominio/enums/atencion-enums';
import { TipoEvento } from '@/alertas/dominio/enums/evento-enums';
import { AlertaRepositorioPort } from '@/alertas/dominio/puertos/alerta.port';
import { AtencionRepositorioPort, CrearAtencionCompleta } from '@/alertas/dominio/puertos/atencion.port';
import { AtencionValidacionDominioService } from '@/alertas/dominio/servicios/atencion-validacion-dominio.service';
import { EventoDominioService } from '@/alertas/dominio/servicios/evento-dominio.service';
import { ALERTA_REPOSITORIO_TOKEN, ATENCION_REPOSITORIO_TOKEN, EVENTO_DOMINIO_SERVICE_TOKEN } from '@/alertas/dominio/tokens/alerta.tokens';
import { CrearAtencionCompletaRequestDto } from '@/alertas/presentacion/dto/entrada/atenciones-entrada.dto';
import { transformarUbicacionSimpleAUbicacionPoint } from '@/utils/ubicacion.utils';
import { NotificarVictimaAlertaUseCase } from '../notificar-victima-alerta.use-case';

@Injectable()
export class CrearAtencionCompletaUseCase {
  constructor(
    @Inject(ATENCION_REPOSITORIO_TOKEN)
    private readonly atencionRepositorio: AtencionRepositorioPort,
    @Inject(ALERTA_REPOSITORIO_TOKEN)
    private readonly alertaRepositorio: AlertaRepositorioPort,
    @Inject(EVENTO_DOMINIO_SERVICE_TOKEN)
    private readonly eventoDominioService: EventoDominioService,
    private readonly notificarVictimaAlertaUseCase: NotificarVictimaAlertaUseCase,
  ) {}

  async ejecutar(entrada: CrearAtencionCompletaRequestDto, idUsuarioWeb: string): Promise<void> {
    const idAtencion = uuidv4();

    const existeAtencion = await this.atencionRepositorio.existePorAlerta(entrada.idAlerta);
    if (existeAtencion) {
      throw new ConflictException(`La alerta ${entrada.idAlerta} ya tiene personal asignado`);
    }

    AtencionValidacionDominioService.validarListaFuncionarios(entrada.funcionarios);

    const funcionariosPreparados = entrada.funcionarios.map((funcionarioData) => {
      return {
        id: uuidv4(),
        rolAtencion: (funcionarioData.rolAtencion || RolAtencion.ENCARGADO) as string,
        ubicacion: transformarUbicacionSimpleAUbicacionPoint(funcionarioData.ubicacion),
        turnoInicio: funcionarioData.turnoInicio,
        turnoFin: funcionarioData.turnoFin,
        ciFuncionario: funcionarioData.ciFuncionario,
        unidad: funcionarioData.unidad,
      };
    });

    const datosAtencion: CrearAtencionCompleta = {
      idAtencion,
      idAlerta: entrada.idAlerta,
      idUsuarioWeb: idUsuarioWeb,
      siglaVehiculo: entrada.siglaVehiculo,
      siglaRadio: entrada.siglaRadio,
      funcionarios: funcionariosPreparados,
    };

    await this.atencionRepositorio.crearAtencionCompleta(datosAtencion);

    const alerta = await this.alertaRepositorio.obtenerAlertaSimple(entrada.idAlerta);
    if (alerta?.idVictima) {
      await this.notificarVictimaAlertaUseCase.ejecutar({
        idAlerta: entrada.idAlerta,
        idVictima: alerta.idVictima,
        estadoFinal: EstadoAlerta.ASIGNADA,
        tipoNotificacion: 'alerta_asignada',
        titulo: 'Policía asignado',
        cuerpo: 'Tu alerta ha sido asignada y un oficial está en camino',
      });
    }

    await this.eventoDominioService.registrarEventoSemiautomatico(entrada.idAlerta, TipoEvento.ALERTA_ASIGNADA, idUsuarioWeb);
  }
}

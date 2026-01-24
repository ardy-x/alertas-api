import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { v4 as uuidv4 } from 'uuid';

import { AlertaRepositorioPort } from '@/alertas/dominio/puertos/alerta.port';
import { RutaAlertaRepositorioPort } from '@/alertas/dominio/puertos/ruta-alerta.port';
import { ALERTA_REPOSITORIO_TOKEN, RUTA_ALERTA_REPOSITORIO_TOKEN } from '@/alertas/dominio/tokens/alerta.tokens';
import { ObtenerProvinciaDepartamentoUseCase } from '@/integraciones/aplicacion/casos-uso/obtener-provincia-departamento.use-case';
import { RutaLineString } from '@/integraciones/dominio/entidades/ubicacion.types';
import { AlertasGatewayPort } from '@/websockets/dominio/puertos/alertas-gateway.port';
import { ALERTAS_GATEWAY_TOKEN } from '@/websockets/dominio/tokens/websockets.tokens';

import { CrearPuntoRutaRequestDto } from '../../presentacion/dto/entrada/ruta-alerta-entrada.dto';
import { CrearPuntoRutaResponseDto } from '../../presentacion/dto/salida/ruta-alerta-salida.dto';

@Injectable()
export class CrearPuntoRutaUseCase {
  constructor(
    @Inject(RUTA_ALERTA_REPOSITORIO_TOKEN)
    private readonly rutaAlertaRepositorio: RutaAlertaRepositorioPort,
    @Inject(ALERTA_REPOSITORIO_TOKEN)
    private readonly alertaRepositorio: AlertaRepositorioPort,
    @Inject(ALERTAS_GATEWAY_TOKEN)
    private readonly alertasGateway: AlertasGatewayPort,
    private readonly obtenerProvinciaDepartamentoUseCase: ObtenerProvinciaDepartamentoUseCase,
  ) {}

  async ejecutar(entrada: CrearPuntoRutaRequestDto): Promise<CrearPuntoRutaResponseDto> {
    const alerta = await this.alertaRepositorio.obtenerAlertaSimple(entrada.idAlerta);
    if (!alerta) {
      throw new NotFoundException('Alerta no encontrada');
    }

    // Verificar si ya existe una ruta para esta alerta
    const rutaExistente = await this.rutaAlertaRepositorio.obtenerPorIdAlerta(entrada.idAlerta);
    const nuevaCoordenada: [number, number] = [entrada.coordenadas.longitud, entrada.coordenadas.latitud];

    if (rutaExistente) {
      // Agregar punto a ruta existente
      const coordenadasExistentes = rutaExistente.ruta.geometry.coordinates;
      const nuevasCoordenadas = [...coordenadasExistentes, nuevaCoordenada];

      const rutaActualizada: RutaLineString = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: nuevasCoordenadas,
        },
      };

      await this.rutaAlertaRepositorio.actualizarPunto(entrada.idAlerta, { ruta: rutaActualizada });

      // Notificar punto agregado
      await this.notificarPuntoRuta(alerta.idMunicipio!, entrada, nuevaCoordenada);

      return {
        rutaCreada: false,
      };
    } else {
      // Crear nueva ruta con el primer punto
      const nuevaRuta: RutaLineString = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [nuevaCoordenada],
        },
      };

      await this.rutaAlertaRepositorio.crearRutaAlerta({
        id: uuidv4(),
        idAlerta: entrada.idAlerta,
        ruta: nuevaRuta,
      });

      // Notificar primer punto
      await this.notificarPuntoRuta(alerta.idMunicipio!, entrada, nuevaCoordenada);

      return {
        rutaCreada: true,
      };
    }
  }

  private async notificarPuntoRuta(idMunicipio: number, entrada: CrearPuntoRutaRequestDto, coordenada: [number, number]) {
    const datosProvinciaDepartamento = await this.obtenerProvinciaDepartamentoUseCase.ejecutar(idMunicipio);
    if (!datosProvinciaDepartamento) {
      throw new Error('No se pudo obtener información geográfica del municipio');
    }
    const idDepartamento = datosProvinciaDepartamento.departamento.id;

    this.alertasGateway.notificarPuntoRutaAgregado({
      idAlerta: entrada.idAlerta,
      ultimoPunto: {
        latitud: coordenada[1],
        longitud: coordenada[0],
      },
      idDepartamento: idDepartamento,
    });
  }
}

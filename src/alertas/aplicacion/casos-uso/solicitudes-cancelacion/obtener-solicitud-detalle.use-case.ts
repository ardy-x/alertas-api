import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { SolicitudCancelacionRepositorioPort } from '@/alertas/dominio/puertos/solicitud-cancelacion.port';
import { SOLICITUD_CANCELACION_REPOSITORIO_TOKEN } from '@/alertas/dominio/tokens/alerta.tokens';
import { ObtenerSolicitudDetalleResponseDto } from '@/alertas/presentacion/dto/salida/solicitudes-cancelacion-salida.dto';

@Injectable()
export class ObtenerSolicitudDetalleUseCase {
  constructor(
    @Inject(SOLICITUD_CANCELACION_REPOSITORIO_TOKEN)
    private readonly solicitudCancelacionRepositorio: SolicitudCancelacionRepositorioPort,
  ) {}

  async ejecutar(idSolicitud: string): Promise<ObtenerSolicitudDetalleResponseDto> {
    const solicitud = await this.solicitudCancelacionRepositorio.obtenerSolicitud(idSolicitud);

    if (!solicitud) {
      throw new NotFoundException('Solicitud de cancelación no encontrada');
    }

    return {
      solicitud: {
        id: solicitud.id,
        idAlerta: solicitud.idAlerta,
        fechaSolicitud: solicitud.fechaSolicitud.toISOString(),
        estadoSolicitud: solicitud.estadoSolicitud,
        usuarioAprobador: solicitud.usuarioWeb.nombreCompleto,
        gradoUsuarioAprobador: solicitud.usuarioWeb.grado,
        motivoCancelacion: solicitud.motivoCancelacion || '',
        victima: {
          id: solicitud.victima.id,
          nombreCompleto: solicitud.victima.nombreCompleto,
          cedulaIdentidad: solicitud.victima.cedulaIdentidad,
          celular: solicitud.victima.numeroCelular,
        },
        fechaHoraProcesamiento: solicitud.actualizadoEn?.toISOString() || '',
      },
    };
  }
}

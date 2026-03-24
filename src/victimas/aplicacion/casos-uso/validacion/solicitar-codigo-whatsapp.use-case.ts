import { ForbiddenException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { obtenerFechaBoliviaYYYYMMDD } from '@/utils/fecha.utils';
import { CodigoValidacionRepositorioPort } from '@/victimas/dominio/puertos/codigo-validacion.port';
import { MensajePort } from '@/victimas/dominio/puertos/mensaje.port';
import { VictimaRepositorioPort } from '@/victimas/dominio/puertos/victima.port';
import { CODIGO_VALIDACION_REPOSITORIO_TOKEN, MENSAJE_PORT_TOKEN, VICTIMA_REPOSITORIO } from '@/victimas/dominio/tokens/victima.tokens';
import { SolicitarCodigoWhatsappRequestDto } from '@/victimas/presentacion/dto/entrada/validacion/solicitar-codigo-whatsapp-request.dto';

@Injectable()
export class SolicitarCodigoWhatsappUseCase {
  constructor(
    @Inject(VICTIMA_REPOSITORIO)
    private readonly victimaRepositorio: VictimaRepositorioPort,
    @Inject(CODIGO_VALIDACION_REPOSITORIO_TOKEN)
    private readonly codigoValidacionRepositorio: CodigoValidacionRepositorioPort,
    @Inject(MENSAJE_PORT_TOKEN)
    private readonly mensajePort: MensajePort,
  ) {}

  async ejecutar(request: SolicitarCodigoWhatsappRequestDto): Promise<{ codigoEnviado: boolean }> {
    // Buscar víctima por celular
    const victima = await this.victimaRepositorio.obtenerPorCelular(request.celular);

    if (!victima) {
      throw new NotFoundException('No se encontró víctima con ese número de celular');
    }

    const correo = victima.correo?.toLowerCase() ?? '';
    const celular = victima.celular ?? '';

    if (celular) {
      await this.codigoValidacionRepositorio.eliminarCodigoPorCelular(celular);
    }
    if (correo) {
      await this.codigoValidacionRepositorio.eliminarCodigoPorEmail(correo);
    }

    const fechaHoy = obtenerFechaBoliviaYYYYMMDD();
    const intentosWhatsapp = await this.codigoValidacionRepositorio.obtenerIntentosPorCelular(celular, fechaHoy);

    if (intentosWhatsapp >= 1) {
      throw new ForbiddenException('Se alcanzó el límite diario de 1 solicitud de código por WhatsApp');
    }

    // Generar código de 6 dígitos
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();

    // TTL de 10 minutos (600 segundos)
    const ttlSegundos = 10 * 60;

    // Crear código en Redis (se elimina automáticamente con TTL)
    await this.codigoValidacionRepositorio.crear(
      {
        celular,
        codigo,
      },
      ttlSegundos,
    );

    // Enviar código por WhatsApp
    const mensaje = `Tu código de verificación es: ${codigo}`;
    const codigoEnviado = await this.mensajePort.enviarMensajeWhatsapp(victima.celular, mensaje);

    if (!codigoEnviado) {
      await this.codigoValidacionRepositorio.eliminarCodigoPorCelular(victima.celular, codigo);
      throw new InternalServerErrorException('No se pudo enviar el código por WhatsApp');
    }

    await this.codigoValidacionRepositorio.incrementarIntentosPorCelular(celular, fechaHoy, 24 * 60 * 60);

    return {
      codigoEnviado: true,
    };
  }
}

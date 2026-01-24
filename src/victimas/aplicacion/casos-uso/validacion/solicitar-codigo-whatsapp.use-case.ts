import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';

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
    const victima = await this.victimaRepositorio.obtenerPorCelular(request.celular.trim());

    if (!victima) {
      throw new NotFoundException('No se encontró víctima con ese número de celular');
    }

    // Generar código de 6 dígitos
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();

    // TTL de 15 minutos (900 segundos)
    const ttlSegundos = 15 * 60;

    // Crear código en Redis (se elimina automáticamente con TTL)
    await this.codigoValidacionRepositorio.crear(
      {
        celular: victima.celular,
        codigo,
      },
      ttlSegundos,
    );

    // Enviar código por WhatsApp
    const mensaje = `Tu código de verificación es: ${codigo}`;
    const codigoEnviado = await this.mensajePort.enviarMensajeWhatsapp(victima.celular, mensaje);

    if (!codigoEnviado) {
      throw new InternalServerErrorException('No se pudo enviar el código por WhatsApp');
    }

    return {
      codigoEnviado: true,
    };
  }
}

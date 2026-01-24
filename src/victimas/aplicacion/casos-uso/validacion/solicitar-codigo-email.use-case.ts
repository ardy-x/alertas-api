import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';

import { CodigoValidacionRepositorioPort } from '@/victimas/dominio/puertos/codigo-validacion.port';
import { MensajePort } from '@/victimas/dominio/puertos/mensaje.port';
import { VictimaRepositorioPort } from '@/victimas/dominio/puertos/victima.port';
import { CODIGO_VALIDACION_REPOSITORIO_TOKEN, MENSAJE_PORT_TOKEN, VICTIMA_REPOSITORIO } from '@/victimas/dominio/tokens/victima.tokens';
import { SolicitarCodigoEmailRequestDto } from '@/victimas/presentacion/dto/entrada/validacion/solicitar-codigo-email-request.dto';

@Injectable()
export class SolicitarCodigoEmailUseCase {
  constructor(
    @Inject(VICTIMA_REPOSITORIO)
    private readonly victimaRepositorio: VictimaRepositorioPort,
    @Inject(CODIGO_VALIDACION_REPOSITORIO_TOKEN)
    private readonly codigoValidacionRepositorio: CodigoValidacionRepositorioPort,
    @Inject(MENSAJE_PORT_TOKEN)
    private readonly mensajePort: MensajePort,
  ) {}

  async ejecutar(request: SolicitarCodigoEmailRequestDto): Promise<{ codigoEnviado: boolean }> {
    // Buscar víctima por email
    const victima = await this.victimaRepositorio.obtenerPorEmail(request.email.trim());

    if (!victima) {
      throw new NotFoundException('No se encontró víctima con ese correo electrónico');
    }

    if (!victima.correo) {
      throw new InternalServerErrorException('La víctima no tiene correo electrónico registrado');
    }

    // Generar código de 6 dígitos
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();

    // TTL de 15 minutos (900 segundos)
    const ttlSegundos = 15 * 60;

    // Crear código en Redis (se elimina automáticamente con TTL)
    await this.codigoValidacionRepositorio.crear(
      {
        email: victima.correo,
        codigo,
      },
      ttlSegundos,
    );

    // Enviar código por email
    const userName = victima.nombreCompleto;
    const templateData = {
      userName,
      verificationCode: codigo,
      processName: 'registro',
      expirationTime: 15,
      additionalInstructions: 'Por favor, ingresa el código en la aplicación para verificar tu cuenta.',
    };

    const enviado = await this.mensajePort.enviarEmail(victima.correo, 'Código de verificación', 'verification-code', templateData);

    if (!enviado) {
      throw new InternalServerErrorException('No se pudo enviar el código por email');
    }

    return {
      codigoEnviado: true,
    };
  }
}

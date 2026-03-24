import { ForbiddenException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';

import { obtenerFechaBoliviaYYYYMMDD } from '@/utils/fecha.utils';
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

    // Eliminar cualquier código Email activo (mismo canal) para evitar código anterior válido
    await this.codigoValidacionRepositorio.eliminarCodigoPorEmail(victima.correo);

    // Eliminar el código de WhatsApp activo (canal opuesto) también si existe
    if (victima.celular) {
      await this.codigoValidacionRepositorio.eliminarCodigoPorCelular(victima.celular);
    }

    const fechaHoy = obtenerFechaBoliviaYYYYMMDD();
    const intentosEmail = await this.codigoValidacionRepositorio.obtenerIntentosPorEmail(victima.correo, fechaHoy);

    if (intentosEmail >= 3) {
      throw new ForbiddenException('Se alcanzó el límite diario de 3 solicitudes de código por email');
    }

    // Generar código de 6 dígitos
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();

    // TTL de 10 minutos (600 segundos)
    const ttlSegundos = 10 * 60;

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
      expirationTime: 10,
      additionalInstructions: 'Por favor, ingresa el código en la aplicación para verificar tu cuenta.',
    };

    const enviado = await this.mensajePort.enviarEmail(victima.correo, 'Código de verificación', 'verification-code', templateData);

    if (!enviado) {
      await this.codigoValidacionRepositorio.eliminarCodigoPorEmail(victima.correo, codigo);
      throw new InternalServerErrorException('No se pudo enviar el código por email');
    }

    await this.codigoValidacionRepositorio.incrementarIntentosPorEmail(victima.correo, fechaHoy, 24 * 60 * 60);

    return {
      codigoEnviado: true,
    };
  }
}

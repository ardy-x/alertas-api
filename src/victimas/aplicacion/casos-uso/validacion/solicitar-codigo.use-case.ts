import { ForbiddenException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';

import { obtenerFechaBoliviaYYYYMMDD } from '@/utils/fecha.utils';
import { CodigoValidacionRepositorioPort } from '@/victimas/dominio/puertos/codigo-validacion.port';
import { MensajePort } from '@/victimas/dominio/puertos/mensaje.port';
import { VictimaRepositorioPort } from '@/victimas/dominio/puertos/victima.port';
import { CODIGO_VALIDACION_REPOSITORIO_TOKEN, MENSAJE_PORT_TOKEN, VICTIMA_REPOSITORIO } from '@/victimas/dominio/tokens/victima.tokens';
import { CanalSolicitudCodigo, SolicitarCodigoRequestDto } from '@/victimas/presentacion/dto/entrada/validacion/solicitar-codigo-request.dto';
import { SolicitarCodigoResponseDto } from '@/victimas/presentacion/dto/salida/solicitar-codigo-response.dto';

@Injectable()
export class SolicitarCodigoUseCase {
  constructor(
    @Inject(VICTIMA_REPOSITORIO)
    private readonly victimaRepositorio: VictimaRepositorioPort,
    @Inject(CODIGO_VALIDACION_REPOSITORIO_TOKEN)
    private readonly codigoValidacionRepositorio: CodigoValidacionRepositorioPort,
    @Inject(MENSAJE_PORT_TOKEN)
    private readonly mensajePort: MensajePort,
  ) {}

  async ejecutar(request: SolicitarCodigoRequestDto): Promise<SolicitarCodigoResponseDto> {
    const victima = await this.victimaRepositorio.obtenerVictimaConDispositivo(request.idVictima);

    if (!victima) {
      throw new NotFoundException('No se encontró la víctima');
    }

    const correo = victima.correo?.trim().toLowerCase() ?? '';
    const celular = victima.celular?.trim() ?? '';

    if (celular) {
      await this.codigoValidacionRepositorio.eliminarCodigoPorCelular(celular);
    }
    if (correo) {
      await this.codigoValidacionRepositorio.eliminarCodigoPorEmail(correo);
    }

    const fechaHoy = obtenerFechaBoliviaYYYYMMDD();
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    const ttlSegundos = 10 * 60;

    if (request.canal === CanalSolicitudCodigo.WHATSAPP) {
      if (!celular) {
        throw new InternalServerErrorException('No tienes celular registrado, no se puede enviar código por WhatsApp');
      }

      const intentosWhatsapp = await this.codigoValidacionRepositorio.obtenerIntentosPorCelular(celular, fechaHoy);
      if (intentosWhatsapp >= 1) {
        throw new ForbiddenException('Se alcanzó el límite diario de 1 solicitud de código por WhatsApp');
      }

      await this.codigoValidacionRepositorio.crear({ celular, codigo }, ttlSegundos);

      const mensaje = `Tu código de verificación es: ${codigo}`;
      const enviado = await this.mensajePort.enviarMensajeWhatsapp(celular, mensaje);

      if (!enviado) {
        await this.codigoValidacionRepositorio.eliminarCodigoPorCelular(celular, codigo);
        throw new InternalServerErrorException('No se pudo enviar el código por WhatsApp');
      }

      await this.codigoValidacionRepositorio.incrementarIntentosPorCelular(celular, fechaHoy, 24 * 60 * 60);

      return {
        codigoEnviado: true,
        canal: CanalSolicitudCodigo.WHATSAPP,
        enviadoA: this.enmascararCelular(celular),
      };
    }

    if (!correo) {
      throw new InternalServerErrorException('No tienes correo electrónico registrado, no se puede enviar código por email');
    }

    const intentosEmail = await this.codigoValidacionRepositorio.obtenerIntentosPorEmail(correo, fechaHoy);
    if (intentosEmail >= 3) {
      throw new ForbiddenException('Se alcanzó el límite diario de 3 solicitudes de código por email');
    }

    await this.codigoValidacionRepositorio.crear({ email: correo, codigo }, ttlSegundos);

    const templateData = {
      userName: victima.nombreCompleto,
      verificationCode: codigo,
      processName: 'registro',
      expirationTime: 10,
      additionalInstructions: 'Por favor, ingresa el código en la aplicación para verificar tu cuenta.',
    };

    const enviado = await this.mensajePort.enviarEmail(correo, 'Código de verificación', 'verification-code', templateData);

    if (!enviado) {
      await this.codigoValidacionRepositorio.eliminarCodigoPorEmail(correo, codigo);
      throw new InternalServerErrorException('No se pudo enviar el código por email');
    }

    await this.codigoValidacionRepositorio.incrementarIntentosPorEmail(correo, fechaHoy, 24 * 60 * 60);

    return {
      codigoEnviado: true,
      canal: CanalSolicitudCodigo.EMAIL,
      enviadoA: this.enmascararCorreo(correo),
    };
  }

  private enmascararCelular(celular: string): string {
    return this.enmascararSegmento(celular, 1, 3);
  }

  private enmascararCorreo(correo: string): string {
    const [local, dominio] = correo.split('@');
    if (!local || !dominio) {
      return '*'.repeat(Math.max(1, correo.length));
    }

    const localMask = this.enmascararSegmento(local, 2, 0);
    const partesDominio = dominio.split('.');

    if (partesDominio.length < 2) {
      return `${localMask}@${this.enmascararSegmento(dominio, 2, 0)}`;
    }

    const nombreDominio = partesDominio.shift() ?? '';
    const extensiones = partesDominio.join('.');
    const dominioMask = this.enmascararSegmento(nombreDominio, 2, 0);

    return `${localMask}@${dominioMask}.${extensiones}`;
  }

  private enmascararSegmento(valor: string, visiblesInicio: number, visiblesFin: number): string {
    if (!valor) {
      return '';
    }

    const inicioLen = Math.min(visiblesInicio, valor.length);
    const inicio = valor.slice(0, inicioLen);

    const finLenPermitido = Math.min(visiblesFin, Math.max(0, valor.length - inicioLen));
    const fin = finLenPermitido > 0 ? valor.slice(-finLenPermitido) : '';

    const cantidadMascara = Math.max(0, valor.length - inicio.length - fin.length);
    return `${inicio}${'*'.repeat(cantidadMascara)}${fin}`;
  }
}

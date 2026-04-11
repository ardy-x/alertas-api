import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';

import { EnviarNotificacionUseCase } from '@/notificaciones/aplicacion/casos-uso/enviar-notificacion.use-case';
import { TipoDestinatario } from '@/notificaciones/dominio/entidades/notificacion.entity';
import { generarApiKey, hashString } from '@/utils/security.utils';
import { EstadoCuenta } from '@/victimas/dominio/enums/victima-enums';
import { CodigoValidacionRepositorioPort } from '@/victimas/dominio/puertos/codigo-validacion.port';
import { VictimaRepositorioPort } from '@/victimas/dominio/puertos/victima.port';
import { CODIGO_VALIDACION_REPOSITORIO_TOKEN, VICTIMA_REPOSITORIO } from '@/victimas/dominio/tokens/victima.tokens';
import { CanalSolicitudCodigo } from '@/victimas/presentacion/dto/entrada/validacion/solicitar-codigo-request.dto';
import { VerificarCodigoRequestDto } from '@/victimas/presentacion/dto/entrada/validacion/verificar-codigo-request.dto';
import { VerificarCodigoResponseDto } from '@/victimas/presentacion/dto/salida/verificar-codigo-response.dto';

@Injectable()
export class VerificarCodigoUseCase {
  private readonly logger = new Logger(VerificarCodigoUseCase.name);

  constructor(
    @Inject(VICTIMA_REPOSITORIO)
    private readonly victimaRepositorio: VictimaRepositorioPort,
    @Inject(CODIGO_VALIDACION_REPOSITORIO_TOKEN)
    private readonly codigoValidacionRepositorio: CodigoValidacionRepositorioPort,
    private readonly enviarNotificacionUseCase: EnviarNotificacionUseCase,
  ) {}

  async ejecutar(request: VerificarCodigoRequestDto): Promise<VerificarCodigoResponseDto> {
    const victima = await this.victimaRepositorio.obtenerVictimaConDispositivo(request.idVictima);

    if (!victima) {
      throw new NotFoundException('Víctima no encontrada');
    }

    const codigo = request.codigo;

    if (request.canal === CanalSolicitudCodigo.WHATSAPP) {
      const celular = victima.celular?.trim() ?? '';
      if (!celular) {
        throw new BadRequestException('La víctima no tiene celular registrado');
      }

      const codigoValido = await this.codigoValidacionRepositorio.validarCodigoPorCelular(celular, codigo);
      if (!codigoValido) {
        throw new BadRequestException('Código inválido o expirado');
      }

      const apiKeyRaw = generarApiKey();
      const apiKeyHash = hashString(apiKeyRaw);

      await this.victimaRepositorio.actualizarApiKey(victima.id, apiKeyHash);
      await this.codigoValidacionRepositorio.eliminarCodigoPorCelular(celular, codigo);
      await this.notificarCierreSesionSiCorresponde(victima.id, victima.estadoCuenta, victima.apiKey, victima.fcmToken);

      return {
        victima: {
          id: victima.id,
          apiKey: apiKeyRaw,
        },
      };
    }

    const email = victima.correo?.trim().toLowerCase() ?? '';
    if (!email) {
      throw new BadRequestException('La víctima no tiene correo electrónico registrado');
    }

    const codigoValido = await this.codigoValidacionRepositorio.validarCodigoPorEmail(email, codigo);
    if (!codigoValido) {
      throw new BadRequestException('Código inválido o expirado');
    }

    const apiKeyRaw = generarApiKey();
    const apiKeyHash = hashString(apiKeyRaw);

    await this.victimaRepositorio.actualizarApiKey(victima.id, apiKeyHash);
    await this.codigoValidacionRepositorio.eliminarCodigoPorEmail(email, codigo);
    await this.notificarCierreSesionSiCorresponde(victima.id, victima.estadoCuenta, victima.apiKey, victima.fcmToken);

    return {
      victima: {
        id: victima.id,
        apiKey: apiKeyRaw,
      },
    };
  }

  private async notificarCierreSesionSiCorresponde(idVictima: string, estadoCuenta?: EstadoCuenta, apiKey?: string, fcmToken?: string): Promise<void> {
    const tieneSesionActiva = estadoCuenta === EstadoCuenta.ACTIVA && Boolean(apiKey);
    const tieneTokenPush = Boolean(fcmToken && fcmToken.trim().length > 0);

    if (!tieneSesionActiva || !tieneTokenPush) {
      return;
    }

    try {
      await this.enviarNotificacionUseCase.ejecutar({
        fcmToken: fcmToken!.trim(),
        titulo: 'Inicio de sesión detectado',
        cuerpo: 'Detectamos un inicio de sesión en otro dispositivo. Cerraremos esta sesión por seguridad.',
        datos: {
          accion: 'CERRAR_SESION_REMOTA',
          motivo: 'NUEVO_INICIO_SESION',
          idVictima,
        },
        tipoDestinatario: TipoDestinatario.VICTIMA,
      });
    } catch (error) {
      this.logger.warn(`No se pudo enviar push de cierre remoto para la víctima ${idVictima}: ${String(error)}`);
    }
  }
}

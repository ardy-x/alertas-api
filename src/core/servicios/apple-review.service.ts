import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { CrearAlertaResponseDto } from '@/alertas/presentacion/dto/salida/alertas-salida.dto';
import { EnviarNotificacionUseCase } from '@/notificaciones/aplicacion/casos-uso/enviar-notificacion.use-case';
import { TipoDestinatario } from '@/notificaciones/dominio/entidades/notificacion.entity';
import { VictimaDto } from '@/victimas/presentacion/dto/salida/verificar-denuncia.dto';
import { VictimaResponseDto } from '@/victimas/presentacion/dto/salida/victima.dto';

interface AlertaDemo {
  id: string;
  idVictima: string;
  estadoAlerta: string;
  creadoEn: Date;
  cancelacionSolicitada?: boolean;
}

@Injectable()
export class AppleReviewService {
  private readonly logger = new Logger(AppleReviewService.name);

  constructor(
    @Inject(forwardRef(() => EnviarNotificacionUseCase))
    private readonly enviarNotificacionUseCase?: EnviarNotificacionUseCase,
  ) {}

  // Configuración de credenciales de prueba para el revisor de Apple
  private readonly enabled = process.env.APPLE_REVIEW_ENABLE === 'true';
  readonly demoCodigoDenuncia = process.env.APPLE_REVIEW_CODIGO || 'DEMO-FELCV-2026';
  readonly demoCi = process.env.APPLE_REVIEW_CI || '0000000';
  readonly demoOtp = process.env.APPLE_REVIEW_OTP || '123456';
  readonly demoIdVictima = '5dc7317e-2754-4e83-92f5-29b4773475a1';
  readonly demoIdAlerta = 'a3b8c1d2-e4f5-4a6b-8c7d-9e0f1a2b3c4d';
  readonly demoApiKey = 'apple-review-demo-api-key-2026';

  // Almacén en memoria exclusivo para el revisor de Apple (no toca PostgreSQL)
  private alertaDemo: AlertaDemo | null = null;
  private demoFcmToken: string | null = null;

  isEnabled(): boolean {
    return this.enabled;
  }

  guardarFcmToken(fcmToken?: string): void {
    if (fcmToken) {
      this.demoFcmToken = fcmToken;
      this.logger.log(`[Apple Review] FCM token demo registrado: ${fcmToken}`);
    }
  }

  obtenerFcmToken(): string | null {
    return this.demoFcmToken;
  }

  esDenunciaReview(codigoDenuncia?: string, ci?: string): boolean {
    if (!this.enabled) return false;
    // Requiere coincidencia exacta y simultánea de ambos campos
    return Boolean(codigoDenuncia && ci && codigoDenuncia === this.demoCodigoDenuncia && ci === this.demoCi);
  }

  esVictimaReview(idVictima?: string): boolean {
    if (!this.enabled) return false;
    return Boolean(idVictima && idVictima === this.demoIdVictima);
  }

  esCiReview(ci?: string): boolean {
    if (!this.enabled) return false;
    return Boolean(ci && ci === this.demoCi);
  }

  esApiKeyReview(apiKey?: string): boolean {
    if (!this.enabled) return false;
    return Boolean(apiKey && apiKey === this.demoApiKey);
  }

  // 0. Mock de verificación de existencia por CI (permite saltar directo a OTP)
  verificarVictimaDemo() {
    this.logger.log('[Apple Review] Bypass: Verificación de existencia por CI demo');
    return {
      existe: true,
      idVictima: this.demoIdVictima,
      estadoCuenta: 'PENDIENTE_VERIFICACION',
    };
  }

  // 1. Mock de verificación de denuncia
  obtenerDenunciaDemo(): { victima: VictimaDto } {
    this.logger.log('[Apple Review] Bypass: Verificación de denuncia demo');
    return {
      victima: {
        id: this.demoIdVictima,
        cedulaIdentidad: this.demoCi,
        nombreCompleto: 'Usuario Demo Apple',
        celular: '70000000',
        fechaNacimiento: new Date('1995-01-01'),
        correo: 'review@apple.com',
        direccionDomicilio: 'Av. Principal #123, Zona Central',
        puntoReferencia: 'Edificio Central',
        botonPanico: true,
      },
    };
  }

  // 2. Mock de solicitud de código OTP
  solicitarCodigoDemo(canal?: any): { codigoEnviado: boolean; canal: any; enviadoA: string } {
    this.logger.log('[Apple Review] Bypass: Envío de código OTP demo (123456)');
    return {
      codigoEnviado: true,
      canal: canal || 'whatsapp',
      enviadoA: '70000000',
    };
  }

  // 3. Mock de validación de código OTP
  verificarCodigoDemo(codigo: string): { victima: { id: string; apiKey: string } } | null {
    if (codigo !== this.demoOtp) {
      return null;
    }
    this.logger.log('[Apple Review] Bypass: Validación exitosa de código demo');
    return {
      victima: {
        id: this.demoIdVictima,
        apiKey: this.demoApiKey,
      },
    };
  }

  // 4. Mock de perfil de la víctima
  obtenerPerfilDemo(): VictimaResponseDto {
    return {
      id: this.demoIdVictima,
      cedulaIdentidad: this.demoCi,
      nombreCompleto: 'Usuario Demo Apple',
      celular: '70000000',
      correo: 'review@apple.com',
      estadoCuenta: 'ACTIVA',
      creadoEn: new Date(),
      ultimaConexion: new Date(),
      idMunicipio: 1,
      municipio: 'La Paz',
      tieneInvestigadorActivo: false,
      direccionDomicilio: 'Av. Principal #123',
      puntoReferencia: 'Zona Central',
    } as VictimaResponseDto;
  }

  // 5. Mock de creación de alerta (en memoria)
  crearAlertaDemo(): CrearAlertaResponseDto {
    const idAlerta = this.demoIdAlerta;
    this.logger.log('[Apple Review] Bypass: Creación de alerta demo en memoria (sin tocar base de datos ni sockets policiales)');
    this.alertaDemo = {
      id: idAlerta,
      idVictima: this.demoIdVictima,
      estadoAlerta: 'PENDIENTE',
      creadoEn: new Date(),
      cancelacionSolicitada: false,
    };
    return {
      alerta: {
        id: idAlerta,
        estadoAlerta: 'PENDIENTE',
      },
    };
  }

  // 6. Mock de consulta de estado de alerta
  obtenerEstadoAlertaDemo(idAlerta: string): { estadoAlerta: string } {
    this.logger.log(`[Apple Review] Bypass: Consulta estado alerta demo ${idAlerta}`);
    return {
      estadoAlerta: this.alertaDemo?.estadoAlerta || 'PENDIENTE',
    };
  }

  // 7. Mock de solicitud de cancelación de alerta
  solicitarCancelacionDemo(idAlerta: string): void {
    this.logger.log(`[Apple Review] Bypass: Cancelación de alerta demo ${idAlerta}`);
    if (this.alertaDemo && this.alertaDemo.id === idAlerta) {
      this.alertaDemo.cancelacionSolicitada = true;
      this.alertaDemo.estadoAlerta = 'CANCELADA';
    }

    // Simular respuesta policial / cancelación automática enviando push tras 3 segundos
    if (this.demoFcmToken && this.enviarNotificacionUseCase) {
      const fcmToken = this.demoFcmToken;
      setTimeout(async () => {
        try {
          await this.enviarNotificacionUseCase!.ejecutar({
            fcmToken,
            titulo: 'Alerta de prueba cancelada',
            cuerpo: 'Tu solicitud fue aprobada. La alerta de prueba ha sido cancelada.',
            datos: {
              tipo: 'alerta_finalizada',
              idAlerta,
              estadoFinal: 'CANCELADA',
            },
            tipoDestinatario: TipoDestinatario.VICTIMA,
          });
          this.logger.log(`[Apple Review] Push de cancelación enviado exitosamente a ${fcmToken}`);
        } catch (err: any) {
          this.logger.warn(`[Apple Review] No se pudo enviar push demo: ${err?.message}`);
        }
      }, 3000);
    }
  }

  // 8. Mock de funcionarios llegados
  obtenerFuncionariosDemo(): any[] {
    return [];
  }
}

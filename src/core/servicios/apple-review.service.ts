import { Injectable, Logger } from '@nestjs/common';
import { CrearAlertaResponseDto } from '@/alertas/presentacion/dto/salida/alertas-salida.dto';
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

  // Configuración de credenciales de prueba para el revisor de Apple
  private readonly enabled = process.env.APPLE_REVIEW_ENABLE === 'true';
  readonly demoCodigoDenuncia = process.env.APPLE_REVIEW_CODIGO || 'DEMO-FELCV-2026';
  readonly demoCi = process.env.APPLE_REVIEW_CI || '0000000';
  readonly demoOtp = process.env.APPLE_REVIEW_OTP || '123456';
  readonly demoIdVictima = '00000000-0000-0000-0000-000000000001';
  readonly demoApiKey = 'apple-review-demo-api-key-2026';

  // Almacén en memoria exclusivo para el revisor de Apple (no toca PostgreSQL)
  private alertaDemo: AlertaDemo | null = null;

  isEnabled(): boolean {
    return this.enabled;
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

  esApiKeyReview(apiKey?: string): boolean {
    if (!this.enabled) return false;
    return Boolean(apiKey && apiKey === this.demoApiKey);
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
    const idAlerta = '00000000-0000-0000-0000-000000000002';
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
  }

  // 8. Mock de funcionarios llegados
  obtenerFuncionariosDemo(): any[] {
    return [];
  }
}

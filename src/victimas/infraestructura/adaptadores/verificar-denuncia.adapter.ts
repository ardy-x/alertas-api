import { Injectable, Logger } from '@nestjs/common';
import { SERVICIOS_CONFIG } from '@/config/servicios.config';
import { HttpClientPublicoService } from '@/core/utilidades/http-client-publico.service';
import { analizarErrorHttp, esErrorNoEncontrado } from '@/core/utilidades/http-error.util';
import { VerificarDenunciaPort, VictimaVerificada } from '../../dominio/puertos/verificar-denuncia.port';

interface VictimaApi {
  id?: number;
  numero_documento?: string;
  nombres?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  telefono_celular?: string;
  fecha_nacimiento?: string;
  correo_electronico?: string;
  direccion_domicilio?: string;
  puntos_referencia?: string;
  boton_panico?: boolean;
}

interface RespuestaApi {
  error?: boolean;
  message?: string;
  response?: {
    data?: VictimaApi;
  } | null;
  status?: number;
}

@Injectable()
export class VerificarDenunciaAdapter implements VerificarDenunciaPort {
  private readonly logger = new Logger(VerificarDenunciaAdapter.name);
  private readonly jupiterApiBase: string;

  constructor(private readonly httpClientPublico: HttpClientPublicoService) {
    this.jupiterApiBase = SERVICIOS_CONFIG.jupiterApiBase;
  }

  async verificarDenuncia(codigoDenuncia: string, cedulaIdentidad: string): Promise<{ victima: VictimaVerificada | null }> {
    const url = `${this.jupiterApiBase}/denuncias/boton-panico`;
    try {
      const respuesta = await this.httpClientPublico.get<RespuestaApi>(url, {
        params: {
          codigo: codigoDenuncia,
          numero_documento: cedulaIdentidad,
        },
        headers: {
          accept: 'application/json',
        },
      });
      const data = respuesta;

      // Manejar respuesta con error del servicio externo
      if (data.error) {
        if (data.status === 404) {
          return { victima: null };
        }
        throw new Error(data.message || 'Error al verificar denuncia');
      }

      // Validar que haya datos
      if (!data.response?.data) {
        return { victima: null };
      }

      const apiData = data.response.data;

      const nombres = apiData.nombres?.trim() || '';
      const apellidoPaterno = apiData.apellido_paterno?.trim() || '';
      const apellidoMaterno = apiData.apellido_materno?.trim() || '';
      const nombreCompleto = [nombres, apellidoPaterno, apellidoMaterno].filter(Boolean).join(' ').trim();

      const victima: VictimaVerificada = {
        id: apiData.id?.toString() || '',
        cedulaIdentidad: apiData.numero_documento || '',
        nombreCompleto: nombreCompleto,
        celular: apiData.telefono_celular?.trim() || undefined,
        fechaNacimiento: apiData.fecha_nacimiento ? new Date(apiData.fecha_nacimiento) : new Date(),
        correo: apiData.correo_electronico?.trim() || undefined,
        direccionDomicilio: apiData.direccion_domicilio?.trim() || undefined,
        puntoReferencia: apiData.puntos_referencia?.trim() || undefined,
        botonPanico: apiData.boton_panico || false,
      };

      return { victima };
    } catch (error: unknown) {
      // Si es 404, retornar null (no es error del sistema)
      if (esErrorNoEncontrado(error)) {
        return { victima: null };
      }

      // Para otros errores, loggear y lanzar
      const infoError = analizarErrorHttp(error);
      this.logger.error(`Error al verificar denuncia en ${url}: ${infoError.mensaje}`);
      throw new Error('Error al verificar denuncia en Jupiter');
    }
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { SERVICIOS_CONFIG } from '@/config/servicios.config';
import { HttpClientPublicoService } from '@/core/utilidades/http-client-publico.service';
import { analizarErrorHttp, esErrorNoEncontrado } from '@/core/utilidades/http-error.util';
import { FuncionarioEntity } from '../../dominio/entidades/funcionario.entity';
import { PersonalPort } from '../../dominio/puertos/personal.port';

interface Funcionario {
  id?: string;
  nroDocumento?: string;
  nroEscalafon?: string;
  nombres?: string;
  primerApellido?: string;
  segundoApellido?: string;
  grado?: string;
  unidad?: string;
  cargo?: string;
  procesoDisciplinario?: boolean;
  unidadId?: number;
}

interface ServicioPersonal {
  error: boolean;
  message: string;
  response: Funcionario[];
  status: number;
}

@Injectable()
export class PersonalAdapter implements PersonalPort {
  private readonly logger = new Logger(PersonalAdapter.name);
  private readonly urlBase: string;

  constructor(private readonly httpClientPublico: HttpClientPublicoService) {
    this.urlBase = SERVICIOS_CONFIG.personalApiBase;
  }

  async buscarFuncionario(ci: string): Promise<FuncionarioEntity[] | null> {
    if (!ci || ci.trim().length === 0) {
      throw new Error('CI es requerido');
    }

    const url = `${this.urlBase}/personas/buscar-persona?nroDocumento=${encodeURIComponent(ci)}`;
    try {
      const respuesta = await this.httpClientPublico.get<ServicioPersonal>(url, {
        headers: {
          accept: 'application/json',
        },
      });
      const data = respuesta;

      // Manejar respuesta con error del servicio externo
      if (data.error) {
        if (data.status === 404) {
          throw new Error('Funcionario no encontrado');
        }
        throw new Error(data.message || 'Error del servicio externo');
      }

      // Validar que haya resultados
      if (!data.response || data.response.length === 0) {
        return null;
      }

      // Mapear todos los resultados
      const funcionarios = data.response.map((func) => {
        const nombres = func.nombres?.trim() || '';
        const primerApellido = func.primerApellido?.trim() || '';
        const segundoApellido = func.segundoApellido?.trim() || '';
        const nombreCompleto = [nombres, primerApellido, segundoApellido].filter(Boolean).join(' ').trim();

        return {
          cedulaIdentidad: func.nroDocumento || '',
          nroEscalafon: func.nroEscalafon || '',
          grado: func.grado || '',
          nombreCompleto: nombreCompleto,
          unidad: func.unidad || '',
          cargo: func.cargo || '',
          procesoDisciplinario: func.procesoDisciplinario || false,
        };
      });

      return funcionarios;
    } catch (err: unknown) {
      if (esErrorNoEncontrado(err)) {
        throw new Error('Funcionario no encontrado');
      }

      const infoError = analizarErrorHttp(err);
      // Si ya es un error manejado, no lo envolvemos
      if (infoError.mensaje === 'Funcionario no encontrado' || infoError.mensaje.includes('Error del servicio externo')) {
        throw err;
      }

      this.logger.error(`Error al buscar funcionario en ${url}: ${infoError.mensaje}`);
      throw new Error('Error al buscar funcionario en servicio de Personal');
    }
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { SERVICIOS_CONFIG } from '@/config/servicios.config';
import { HttpClientPublicoService } from '@/core/utilidades/http-client-publico.service';
import { analizarErrorHttp, esErrorNoEncontrado } from '@/core/utilidades/http-error.util';
import { FuncionarioEntity } from '../../dominio/entidades/funcionario.entity';
import { PersonalPort } from '../../dominio/puertos/personal.port';

interface Funcionario {
  cedulaIdentidad?: string;
  grado?: string;
  escalafon?: string | null;
  nombreCompleto?: string;
  nombres?: string;
  paterno?: string;
  materno?: string;
  idUnidadPolicial?: number;
  unidadPolicial?: string;
  idCargo?: number;
  cargo?: string;
  estadoPersonal?: string;
  fotografia?: string;
}

interface ServicioPersonal {
  error: boolean;
  message: string;
  response: {
    personalPolicial?: Funcionario | null;
  };
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
    const cedulaIdentidad = ci?.trim();

    if (!cedulaIdentidad) {
      throw new Error('CI es requerido');
    }

    const url = `${this.urlBase}/api/personal-policial`;
    try {
      const respuesta = await this.httpClientPublico.post<ServicioPersonal>(
        url,
        {
          cedulaIdentidad,
        },
        {
          headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      );
      const data = respuesta;

      // Manejar respuesta con error del servicio externo
      if (data.error) {
        if (data.status === 404) {
          throw new Error('Funcionario no encontrado');
        }
        throw new Error(data.message || 'Error del servicio externo');
      }

      // Validar que haya resultados
      if (!data.response?.personalPolicial) {
        return null;
      }

      // Mantener contrato de salida anterior (lista de FuncionarioEntity)
      const func = data.response.personalPolicial;
      const nombres = func.nombres?.trim() || '';
      const paterno = func.paterno?.trim() || '';
      const materno = func.materno?.trim() || '';
      const nombreCompleto = (func.nombreCompleto?.trim() || [nombres, paterno, materno].filter(Boolean).join(' ')).trim();

      const funcionarios: FuncionarioEntity[] = [
        {
          cedulaIdentidad: func.cedulaIdentidad || '',
          nroEscalafon: func.escalafon || '',
          grado: func.grado || '',
          nombreCompleto,
          unidad: func.unidadPolicial || '',
          cargo: func.cargo || '',
          procesoDisciplinario: false,
        },
      ];

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

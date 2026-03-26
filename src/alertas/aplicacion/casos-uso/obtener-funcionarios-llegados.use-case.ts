import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { AtencionRepositorioPort } from '@/alertas/dominio/puertos/atencion.port';
import { AtencionPersonalPort } from '@/alertas/dominio/puertos/atencion-funcionario.port';
import { ATENCION_FUNCIONARIO_REPOSITORIO_TOKEN, ATENCION_REPOSITORIO_TOKEN } from '@/alertas/dominio/tokens/alerta.tokens';
import { FuncionarioLlegadoDto } from '@/alertas/presentacion/dto/salida/alertas-salida.dto';
import { PersonalPort } from '@/integraciones/dominio/puertos/personal.port';
import { PERSONAL_TOKEN } from '@/integraciones/dominio/tokens/integracion.tokens';

@Injectable()
export class ObtenerFuncionariosLlegadosUseCase {
  constructor(
    @Inject(ATENCION_REPOSITORIO_TOKEN)
    private readonly atencionRepo: AtencionRepositorioPort,
    @Inject(ATENCION_FUNCIONARIO_REPOSITORIO_TOKEN)
    private readonly atencionFuncionarioRepo: AtencionPersonalPort,
    @Inject(PERSONAL_TOKEN)
    private readonly personalPort: PersonalPort,
  ) {}

  async ejecutar(idAlerta: string): Promise<FuncionarioLlegadoDto[]> {
    const atencion = await this.atencionRepo.obtenerPorAlerta(idAlerta);
    if (!atencion) {
      throw new NotFoundException('Atención no encontrada');
    }

    const funcionarios = await this.atencionFuncionarioRepo.obtenerPorAtencion(atencion.id);
    const llegados = funcionarios.filter((f) => f.fechaLlegada && !f.confirmacionVictima);

    // enrich personal data
    for (const func of llegados) {
      if (func.ciFuncionario) {
        const ext = await this.personalPort.buscarFuncionario(func.ciFuncionario);
        if (ext && ext.length > 0) {
          func.grado = ext[0].grado ?? func.grado;
          func.nombreCompleto = ext[0].nombreCompleto ?? func.nombreCompleto;
        }
      }
    }

    return llegados.map((f) => ({
      ciFuncionario: f.ciFuncionario || '',
      grado: f.grado || null,
      nombreCompleto: f.nombreCompleto || null,
      rolAtencion: f.rolAtencion,
      fechaLlegada: f.fechaLlegada as string,
    }));
  }
}

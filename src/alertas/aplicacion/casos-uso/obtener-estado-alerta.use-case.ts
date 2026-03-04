import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EstadoAlerta } from '@/alertas/dominio/enums/alerta-enums';
import { AlertaRepositorioPort } from '@/alertas/dominio/puertos/alerta.port';
import { AtencionRepositorioPort } from '@/alertas/dominio/puertos/atencion.port';
import { AtencionPersonalPort } from '@/alertas/dominio/puertos/atencion-funcionario.port';
import { ALERTA_REPOSITORIO_TOKEN, ATENCION_FUNCIONARIO_REPOSITORIO_TOKEN, ATENCION_REPOSITORIO_TOKEN } from '@/alertas/dominio/tokens/alerta.tokens';
import { EstadoAlertaDto } from '@/alertas/presentacion/dto/salida/alertas-salida.dto';
import { PersonalPort } from '@/integraciones/dominio/puertos/personal.port';
import { PERSONAL_TOKEN } from '@/integraciones/dominio/tokens/integracion.tokens';

@Injectable()
export class ObtenerEstadoAlertaUseCase {
  constructor(
    @Inject(ALERTA_REPOSITORIO_TOKEN)
    private readonly alertaRepositorio: AlertaRepositorioPort,
    @Inject(ATENCION_REPOSITORIO_TOKEN)
    private readonly atencionRepositorio: AtencionRepositorioPort,
    @Inject(ATENCION_FUNCIONARIO_REPOSITORIO_TOKEN)
    private readonly atencionFuncionarioRepo: AtencionPersonalPort,
    @Inject(PERSONAL_TOKEN)
    private readonly personalPort: PersonalPort,
  ) {}

  async ejecutar(idAlerta: string): Promise<EstadoAlertaDto> {
    const estadoAlerta = await this.alertaRepositorio.obtenerEstadoAlerta(idAlerta);

    if (!estadoAlerta) {
      throw new NotFoundException('Alerta no encontrada');
    }

    const respuesta: EstadoAlertaDto = { estadoAlerta };

    if (String(estadoAlerta) === String(EstadoAlerta.EN_ATENCION)) {
      const atencion = await this.atencionRepositorio.obtenerPorAlerta(idAlerta);
      if (atencion) {
        const funcionarios = await this.atencionFuncionarioRepo.obtenerPorAtencion(atencion.id);
        const llegados = funcionarios.filter((f) => f.fechaLlegada);
        for (const func of llegados) {
          if (func.ciFuncionario) {
            const ext = await this.personalPort.buscarFuncionario(func.ciFuncionario);
            if (ext && ext.length > 0) {
              func.grado = ext[0].grado ?? func.grado;
              func.nombreCompleto = ext[0].nombreCompleto ?? func.nombreCompleto;
            }
          }
        }
        respuesta.funcionariosLlegados = llegados.map((f) => ({
          ciFuncionario: f.ciFuncionario || '',
          grado: f.grado || null,
          nombreCompleto: f.nombreCompleto || null,
          rolAtencion: f.rolAtencion,
          fechaLlegada: f.fechaLlegada as string,
        }));
      }
    }

    return respuesta;
  }
}

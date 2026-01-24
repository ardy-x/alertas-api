import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { v4 as uuidv4 } from 'uuid';

import { RolAtencion } from '@/alertas/dominio/enums/atencion-enums';
import { AtencionRepositorioPort } from '@/alertas/dominio/puertos/atencion.port';
import { AgregarFuncionarioDatos, AtencionPersonalPort } from '@/alertas/dominio/puertos/atencion-funcionario.port';
import { AtencionValidacionDominioService } from '@/alertas/dominio/servicios/atencion-validacion-dominio.service';
import { ATENCION_FUNCIONARIO_REPOSITORIO_TOKEN, ATENCION_REPOSITORIO_TOKEN } from '@/alertas/dominio/tokens/alerta.tokens';
import { CrearFuncionarioAtencionRequestDto } from '@/alertas/presentacion/dto/entrada/atenciones-entrada.dto';
import { transformarUbicacionSimpleAUbicacionPoint } from '@/utils/ubicacion.utils';

@Injectable()
export class AgregarFuncionarioUseCase {
  constructor(
    @Inject(ATENCION_FUNCIONARIO_REPOSITORIO_TOKEN)
    private readonly atencionFuncionarioRepositorio: AtencionPersonalPort,
    @Inject(ATENCION_REPOSITORIO_TOKEN)
    private readonly atencionRepositorio: AtencionRepositorioPort,
  ) {}

  async ejecutar(idAtencion: string, entrada: CrearFuncionarioAtencionRequestDto): Promise<void> {
    const atencion = await this.atencionRepositorio.obtenerAtencionSimple(idAtencion);
    if (!atencion) {
      throw new NotFoundException('Atención no encontrada');
    }

    const funcionariosExistentes = await this.atencionFuncionarioRepositorio.obtenerPorAtencion(idAtencion);
    entrada.rolAtencion = AtencionValidacionDominioService.validarEncargadoUnico(entrada.rolAtencion, funcionariosExistentes);

    AtencionValidacionDominioService.validarAsignacionFuncionario({
      turnoInicio: entrada.turnoInicio,
      turnoFin: entrada.turnoFin,
    });

    const idFuncionario = uuidv4();
    const datosFuncionario: AgregarFuncionarioDatos = {
      id: idFuncionario,
      idAtencion: idAtencion,
      rolAtencion: entrada.rolAtencion || RolAtencion.APOYO,
      ubicacion: transformarUbicacionSimpleAUbicacionPoint(entrada.ubicacion),
      turnoInicio: entrada.turnoInicio,
      turnoFin: entrada.turnoFin,
      ciFuncionario: entrada.ciFuncionario,
      unidad: entrada.unidad || null,
    };

    await this.atencionFuncionarioRepositorio.agregarFuncionario(datosFuncionario);
  }
}

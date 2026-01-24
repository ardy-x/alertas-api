import { BadRequestException } from '@nestjs/common';

import { RolAtencion } from '../enums/atencion-enums';

export class AtencionValidacionDominioService {
  static validarEncargadoUnico(rolNuevo: RolAtencion | undefined, funcionariosExistentes: Array<{ rolAtencion: string | RolAtencion }>): RolAtencion {
    if (String(rolNuevo) === String(RolAtencion.ENCARGADO) || !rolNuevo) {
      const encargados = funcionariosExistentes.filter((f) => String(f.rolAtencion) === String(RolAtencion.ENCARGADO));
      if (encargados.length > 0) {
        return RolAtencion.APOYO;
      }
      return RolAtencion.ENCARGADO;
    }
    return rolNuevo;
  }

  static validarListaFuncionarios(funcionarios: Array<{ rolAtencion?: RolAtencion }>): void {
    if (!funcionarios || funcionarios.length === 0) {
      throw new BadRequestException('Debe asignar al menos un funcionario a la atención');
    }

    const encargados = funcionarios.filter((f) => (f.rolAtencion || RolAtencion.ENCARGADO) === RolAtencion.ENCARGADO);
    if (encargados.length > 1) {
      throw new BadRequestException(`Se encontraron ${encargados.length} funcionarios con rol ENCARGADO, pero solo puede haber uno por atención`);
    }

    if (encargados.length === 0) {
      funcionarios[0].rolAtencion = RolAtencion.ENCARGADO;
    }
  }

  static validarAsignacionFuncionario(datos: { turnoInicio: string; turnoFin: string }): void {
    if (!AtencionValidacionDominioService.validarTurnoValido(datos.turnoInicio, datos.turnoFin)) {
      throw new BadRequestException('Turno de servicio no válido: la hora de fin debe ser posterior a la hora de inicio');
    }
  }

  private static validarTurnoValido(turnoInicio: string, turnoFin: string): boolean {
    const inicio = new Date(turnoInicio);
    const fin = new Date(turnoFin);
    return fin > inicio;
  }
}

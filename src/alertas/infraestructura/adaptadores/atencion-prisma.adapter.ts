import { Injectable } from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { AtencionEntity } from '@/alertas/dominio/entidades/atencion.entity';

import { EstadoAlerta } from '@/alertas/dominio/enums/alerta-enums';
import { PrismaService } from '@/prisma/prisma.service';
import { RolAtencion } from '../../dominio/enums/atencion-enums';
import { AtencionRepositorioPort, CrearAtencionCompleta } from '../../dominio/puertos/atencion.port';

@Injectable()
export class AtencionPrismaAdapter implements AtencionRepositorioPort {
  constructor(private readonly prisma: PrismaService) {}

  async crearAtencionCompleta(datos: CrearAtencionCompleta): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Crear atención
      await tx.atencion.create({
        data: {
          id: datos.idAtencion,
          idAlerta: datos.idAlerta,
          idUsuarioWeb: datos.idUsuarioWeb,
          siglaVehiculo: datos.siglaVehiculo,
          siglaRadio: datos.siglaRadio,
        },
      });

      // Actualizar estado de la alerta
      await tx.alerta.update({
        where: { id: datos.idAlerta },
        data: { estadoAlerta: EstadoAlerta.ASIGNADA },
      });

      // Crear funcionarios externos
      for (const funcionario of datos.funcionarios) {
        await tx.atencionFuncionario.create({
          data: {
            id: funcionario.id,
            idAtencion: datos.idAtencion,
            rolAtencion: funcionario.rolAtencion as RolAtencion,
            ubicacion: funcionario.ubicacion as unknown as Prisma.InputJsonValue,
            turnoInicio: funcionario.turnoInicio,
            turnoFin: funcionario.turnoFin,
            ciFuncionario: funcionario.ciFuncionario,
            unidad: funcionario.unidad,
          },
        });
      }
    });
  }

  async obtenerAtencionSimple(id: string): Promise<AtencionEntity | null> {
    const atencion = await this.prisma.atencion.findUnique({
      where: { id },
    });

    if (!atencion) return null;

    return {
      id: atencion.id,
      idAlerta: atencion.idAlerta,
      idUsuarioWeb: atencion.idUsuarioWeb,
      siglaVehiculo: atencion.siglaVehiculo,
      siglaRadio: atencion.siglaRadio,
    };
  }

  async existePorAlerta(idAlerta: string): Promise<boolean> {
    const count = await this.prisma.atencion.count({
      where: { idAlerta },
    });
    return count > 0;
  }
}

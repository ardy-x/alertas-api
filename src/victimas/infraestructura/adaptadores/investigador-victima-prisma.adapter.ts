import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { InvestigadorVictimaEntity } from '@/victimas/dominio/entidades/investigador-victima.entity';
import { AsignarInvestigadorDatos, InvestigadorVictimaRepositorioPort } from '@/victimas/dominio/puertos/investigador-victima.port';

@Injectable()
export class InvestigadorVictimaPrismaAdapter implements InvestigadorVictimaRepositorioPort {
  constructor(private readonly prisma: PrismaService) {}

  async asignar(datos: AsignarInvestigadorDatos): Promise<void> {
    // Primero desactivar cualquier investigador activo previo
    await this.prisma.investigadorVictima.updateMany({
      where: {
        idVictima: datos.idVictima,
        activo: true,
      },
      data: {
        activo: false,
      },
    });

    // Crear nueva asignación
    await this.prisma.investigadorVictima.create({
      data: {
        idVictima: datos.idVictima,
        ciInvestigador: datos.ciInvestigador,
        idUsuarioAsignador: datos.idUsuarioAsignador,
        fechaAsignacion: datos.fechaAsignacion,
        observaciones: datos.observaciones || null,
        activo: true,
      },
    });
  }

  async desasignar(idVictima: string): Promise<void> {
    await this.prisma.investigadorVictima.updateMany({
      where: {
        idVictima,
        activo: true,
      },
      data: {
        activo: false,
      },
    });
  }

  async obtenerActivo(idVictima: string): Promise<InvestigadorVictimaEntity | null> {
    const investigador = await this.prisma.investigadorVictima.findFirst({
      where: {
        idVictima,
        activo: true,
      },
      orderBy: {
        fechaAsignacion: 'desc',
      },
    });

    if (!investigador) {
      return null;
    }

    return new InvestigadorVictimaEntity(
      investigador.id,
      investigador.idVictima,
      investigador.ciInvestigador,
      investigador.idUsuarioAsignador,
      investigador.fechaAsignacion,
      investigador.activo,
      investigador.observaciones,
      investigador.creadoEn,
      investigador.actualizadoEn,
    );
  }

  async obtenerHistorial(idVictima: string): Promise<InvestigadorVictimaEntity[]> {
    const investigadores = await this.prisma.investigadorVictima.findMany({
      where: {
        idVictima,
      },
      orderBy: {
        fechaAsignacion: 'desc',
      },
    });

    return investigadores.map(
      (inv) => new InvestigadorVictimaEntity(inv.id, inv.idVictima, inv.ciInvestigador, inv.idUsuarioAsignador, inv.fechaAsignacion, inv.activo, inv.observaciones, inv.creadoEn, inv.actualizadoEn),
    );
  }

  async obtenerVictimasIdsPorInvestigador(ciInvestigador: string): Promise<string[]> {
    const asignaciones = await this.prisma.investigadorVictima.findMany({
      where: {
        ciInvestigador,
        activo: true,
      },
      select: {
        idVictima: true,
      },
    });

    return asignaciones.map((a) => a.idVictima);
  }

  async tieneInvestigadorActivo(idVictima: string): Promise<boolean> {
    const count = await this.prisma.investigadorVictima.count({
      where: {
        idVictima,
        activo: true,
      },
    });

    return count > 0;
  }
}

import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';
import { CrearCierreAlertaDatos } from '../../dominio/entidades/cierre-alerta.entity';
import { CierreAlertaRepositorioPort } from '../../dominio/puertos/cierre-alerta.port';

@Injectable()
export class CierreAlertaPrismaAdapter implements CierreAlertaRepositorioPort {
  constructor(private readonly prisma: PrismaService) {}

  async cerrarAlerta(datos: CrearCierreAlertaDatos): Promise<void> {
    const cierreCreado = await this.prisma.cierreAlerta.create({
      data: {
        id: datos.id,
        idAlerta: datos.idAlerta,
        idUsuarioWeb: datos.idUsuarioWeb,
        fechaHora: datos.fechaHora,
        estadoVictima: datos.estadoVictima,
        motivoCierre: datos.motivoCierre,
        observaciones: datos.observaciones,
      },
    });

    // Crear relaciones con agresores
    if (datos.agresores && datos.agresores.length > 0) {
      const agresoresData = datos.agresores.map((agresor) => ({
        id: crypto.randomUUID(),
        idCierreAlerta: cierreCreado.id,
        cedulaIdentidad: agresor.cedulaIdentidad,
        nombreCompleto: agresor.nombreCompleto,
        parentesco: agresor.parentesco,
      }));

      await this.prisma.cierreAlertaAgresor.createMany({
        data: agresoresData,
      });
    }
  }
}

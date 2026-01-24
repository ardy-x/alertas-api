import { Injectable } from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { PrismaService } from '@/prisma/prisma.service';
import { DatosExternosAttEntity } from '../../dominio/entidades/datos-externos-att.entity';
import { DatosExternosAtt } from '../../dominio/entidades/persona-datos-att.entity';
import { EstadoAlerta, OrigenAlerta } from '../../dominio/enums/alerta-enums';
import { DatosExternosAttRepositorioPort } from '../../dominio/puertos/datos-externos-att.port';

@Injectable()
export class DatosExternosAttPrismaAdapter implements DatosExternosAttRepositorioPort {
  constructor(private readonly prisma: PrismaService) {}

  async crearAlertaATT(datos: DatosExternosAtt, id: string): Promise<DatosExternosAttEntity> {
    // Crear alerta con el ID proporcionado desde el caso de uso
    const alertaCreada = await this.prisma.alerta.create({
      data: {
        id: id, // Usar el ID generado en el caso de uso
        fechaHora: new Date(datos.fechaRegistro),
        estadoAlerta: EstadoAlerta.PENDIENTE,
        origen: OrigenAlerta.ATT,
        datosExternos: datos as unknown as Prisma.InputJsonValue,
      },
    });

    return {
      id: alertaCreada.id,
      idAlerta: datos.idAlerta, // Mantener el ID de ATT en la entidad para referencia
      fechaRegistro: datos.fechaRegistro,
      persona: datos.persona,
      contacto: datos.contacto,
      contactos: datos.contactos,
      creadoEn: alertaCreada.creadoEn,
      actualizadoEn: alertaCreada.actualizadoEn || undefined,
    };
  }

  async obtenerAlertaATT(id: string): Promise<DatosExternosAttEntity | null> {
    const alerta = await this.prisma.alerta.findUnique({
      where: { id },
      select: {
        id: true,
        datosExternos: true,
        creadoEn: true,
        actualizadoEn: true,
      },
    });

    if (!alerta || !alerta.datosExternos) {
      return null;
    }

    const datos = alerta.datosExternos as unknown as DatosExternosAtt;

    return {
      id: alerta.id,
      idAlerta: datos.idAlerta,
      fechaRegistro: datos.fechaRegistro,
      persona: datos.persona,
      contacto: datos.contacto,
      contactos: datos.contactos,
      creadoEn: alerta.creadoEn,
      actualizadoEn: alerta.actualizadoEn || undefined,
    };
  }
}

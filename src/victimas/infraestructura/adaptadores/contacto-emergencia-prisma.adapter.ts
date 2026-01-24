import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { ContactoEmergencia } from '@/victimas/dominio/entidades/contacto-emergencia.entity';
import { ActualizarContactoEmergencia, ContactoEmergenciaRepositorioPort, CrearContactoEmergencia } from '../../dominio/puertos/contacto-emergencia.port';

@Injectable()
export class ContactoEmergenciaPrismaAdapter implements ContactoEmergenciaRepositorioPort {
  constructor(private readonly prisma: PrismaService) {}

  async crearContacto(datos: CrearContactoEmergencia): Promise<ContactoEmergencia> {
    const contactoEmergencia = await this.prisma.contactoEmergencia.create({
      data: {
        id: datos.id,
        idVictima: datos.idVictima,
        nombreCompleto: datos.nombreCompleto,
        celular: datos.celular,
        parentesco: datos.parentesco,
        principal: datos.principal,
      },
    });

    return {
      id: contactoEmergencia.id,
      idVictima: contactoEmergencia.idVictima,
      nombreCompleto: contactoEmergencia.nombreCompleto,
      celular: contactoEmergencia.celular,
      parentesco: contactoEmergencia.parentesco,
      principal: contactoEmergencia.principal,
    };
  }

  async obtenerContactoEmergencia(id: string): Promise<ContactoEmergencia | null> {
    const contactoEmergencia = await this.prisma.contactoEmergencia.findUnique({
      where: { id },
    });

    return contactoEmergencia
      ? {
          id: contactoEmergencia.id,
          idVictima: contactoEmergencia.idVictima,
          nombreCompleto: contactoEmergencia.nombreCompleto,
          celular: contactoEmergencia.celular,
          parentesco: contactoEmergencia.parentesco,
          principal: contactoEmergencia.principal,
        }
      : null;
  }

  async obtenerContactosPorVictima(idVictima: string): Promise<ContactoEmergencia[]> {
    const contactos = await this.prisma.contactoEmergencia.findMany({
      where: { idVictima },
      orderBy: [{ principal: 'desc' }, { creadoEn: 'asc' }],
    });

    return contactos.map((contacto) => ({
      id: contacto.id,
      idVictima: contacto.idVictima,
      nombreCompleto: contacto.nombreCompleto,
      celular: contacto.celular,
      parentesco: contacto.parentesco,
      principal: contacto.principal,
    }));
  }

  async actualizarContacto(id: string, datos: ActualizarContactoEmergencia): Promise<void> {
    await this.prisma.contactoEmergencia.update({
      where: { id },
      data: datos,
    });
  }

  async marcarComoPrincipal(idVictima: string, idContacto: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Desmarcar todos los contactos principales de la víctima
      await tx.contactoEmergencia.updateMany({
        where: { idVictima },
        data: { principal: false },
      });

      await tx.contactoEmergencia.update({
        where: { id: idContacto },
        data: {
          principal: true,
        },
      });
    });
  }

  async eliminarContacto(idContacto: string): Promise<void> {
    await this.prisma.contactoEmergencia.delete({
      where: { id: idContacto },
    });
  }
}

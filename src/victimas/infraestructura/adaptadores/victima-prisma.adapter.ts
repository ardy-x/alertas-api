import { Injectable } from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { PrismaService } from '@/prisma/prisma.service';
import { EstadoCuenta } from '../../dominio/enums/victima-enums';
import {
  ActualizarDatosContacto,
  ActualizarDatosCuenta,
  ActualizarUbicacion,
  CrearVictimaDatos,
  VictimaBase,
  VictimaConDispositivo,
  VictimaDetalle,
  VictimaRepositorioPort,
} from '../../dominio/puertos/victima.port';

@Injectable()
export class VictimaPrismaAdapter implements VictimaRepositorioPort {
  constructor(private readonly prisma: PrismaService) {}

  async crearVictima(datos: CrearVictimaDatos): Promise<{ id: string }> {
    const victima = await this.prisma.victima.create({
      data: {
        id: datos.id,
        cedulaIdentidad: datos.cedulaIdentidad,
        nombreCompleto: datos.nombreCompleto,
        celular: datos.celular,
        idMunicipio: datos.idMunicipio,
        fechaNacimiento: datos.fechaNacimiento,
        correo: datos.correo,
        direccionDomicilio: datos.direccionDomicilio,
        puntoReferencia: datos.puntoReferencia,
        estadoCuenta: EstadoCuenta.PENDIENTE_VERIFICACION,
      },
    });

    return {
      id: victima.id,
    };
  }

  async obtenerVictimaSimple(id: string): Promise<VictimaBase | null> {
    const victima = await this.prisma.victima.findUnique({
      where: { id },
      select: {
        id: true,
        cedulaIdentidad: true,
        nombreCompleto: true,
        celular: true,
        fechaNacimiento: true,
        idMunicipio: true,
        estadoCuenta: true,
        fcmToken: true,
      },
    });

    if (!victima) return null;

    return {
      id: victima.id,
      cedulaIdentidad: victima.cedulaIdentidad,
      nombreCompleto: victima.nombreCompleto,
      celular: victima.celular,
      idMunicipio: victima.idMunicipio,
      estadoCuenta: victima.estadoCuenta as EstadoCuenta,
      fechaNacimiento: victima.fechaNacimiento,
    };
  }

  async obtenerVictimaConDispositivo(id: string): Promise<VictimaConDispositivo | null> {
    const victima = await this.prisma.victima.findUnique({
      where: { id },
    });

    if (!victima) return null;

    return {
      id: victima.id,
      cedulaIdentidad: victima.cedulaIdentidad,
      correo: victima.correo || undefined,
      nombreCompleto: victima.nombreCompleto,
      celular: victima.celular,
      idMunicipio: victima.idMunicipio,
      estadoCuenta: victima.estadoCuenta as EstadoCuenta,
      fechaNacimiento: victima.fechaNacimiento,
      fcmToken: victima.fcmToken || undefined,
      apiKey: victima.apiKey || undefined,
      idDispositivo: victima.idDispositivo || undefined,
      creadoEn: victima.creadoEn || undefined,
    };
  }

  async obtenerDetalleVictima(id: string): Promise<VictimaDetalle | null> {
    const victima = await this.prisma.victima.findUnique({
      where: { id },
      include: {
        contactosEmergencia: {
          orderBy: [{ principal: 'desc' }, { creadoEn: 'asc' }],
        },
      },
    });

    if (!victima) return null;

    return {
      id: victima.id,
      cedulaIdentidad: victima.cedulaIdentidad,
      nombreCompleto: victima.nombreCompleto,
      celular: victima.celular,
      fechaNacimiento: victima.fechaNacimiento,
      estadoCuenta: victima.estadoCuenta as EstadoCuenta,
      idMunicipio: victima.idMunicipio,
      correo: victima.correo || undefined,
      direccionDomicilio: victima.direccionDomicilio,
      puntoReferencia: victima.puntoReferencia,
      creadoEn: victima.creadoEn || undefined,
      contactosEmergencia: victima.contactosEmergencia,
    };
  }

  async obtenerPorCedula(cedulaIdentidad: string): Promise<VictimaConDispositivo | null> {
    const victima = await this.prisma.victima.findFirst({
      where: {
        cedulaIdentidad: cedulaIdentidad,
      },
    });

    if (!victima) return null;

    return {
      id: victima.id,
      cedulaIdentidad: victima.cedulaIdentidad,
      nombreCompleto: victima.nombreCompleto,
      idMunicipio: victima.idMunicipio,
      fechaNacimiento: victima.fechaNacimiento,
      celular: victima.celular,
      estadoCuenta: victima.estadoCuenta as EstadoCuenta,
      correo: victima.correo || undefined,
      creadoEn: victima.creadoEn || undefined,
      idDispositivo: victima.idDispositivo || undefined,
    };
  }

  async obtenerPorCelular(celular: string): Promise<VictimaBase | null> {
    const victima = await this.prisma.victima.findFirst({
      where: {
        celular: celular.trim(),
      },
    });

    if (!victima) return null;

    return {
      id: victima.id,
      cedulaIdentidad: victima.cedulaIdentidad,
      nombreCompleto: victima.nombreCompleto,
      fechaNacimiento: victima.fechaNacimiento,
      celular: victima.celular,
      idMunicipio: victima.idMunicipio,
      estadoCuenta: victima.estadoCuenta as EstadoCuenta,
    };
  }

  async obtenerPorEmail(email: string): Promise<VictimaBase | null> {
    const victima = await this.prisma.victima.findFirst({
      where: {
        correo: email.trim(),
      },
    });

    if (!victima) return null;

    return {
      id: victima.id,
      cedulaIdentidad: victima.cedulaIdentidad,
      nombreCompleto: victima.nombreCompleto,
      fechaNacimiento: victima.fechaNacimiento,
      celular: victima.celular,
      idMunicipio: victima.idMunicipio,
      estadoCuenta: victima.estadoCuenta as EstadoCuenta,
      correo: victima.correo || undefined,
    };
  }

  async actualizarUbicacion(id: string, datos: ActualizarUbicacion): Promise<void> {
    const dataActualizacion: Prisma.VictimaUpdateInput = {};

    if (datos.direccionDomicilio !== undefined) {
      dataActualizacion.direccionDomicilio = datos.direccionDomicilio;
    }
    if (datos.puntoReferencia !== undefined) {
      dataActualizacion.puntoReferencia = datos.puntoReferencia;
    }
    if (datos.idMunicipio !== undefined) {
      dataActualizacion.idMunicipio = datos.idMunicipio;
    }

    if (Object.keys(dataActualizacion).length === 0) {
      return;
    }

    await this.prisma.victima.update({
      where: { id },
      data: dataActualizacion,
    });
  }

  async actualizarDatosContacto(id: string, datos: ActualizarDatosContacto): Promise<void> {
    const dataActualizacion: Prisma.VictimaUpdateInput = {};

    if (datos.celular !== undefined) {
      dataActualizacion.celular = datos.celular;
    }
    if (datos.correo !== undefined) {
      dataActualizacion.correo = datos.correo;
    }

    if (Object.keys(dataActualizacion).length === 0) {
      return;
    }

    await this.prisma.victima.update({
      where: { id },
      data: dataActualizacion,
    });
  }

  async actualizarDatosCuenta(id: string, datos: ActualizarDatosCuenta): Promise<void> {
    const data: Prisma.VictimaUpdateInput = {};

    if (datos.idDispositivo !== undefined) {
      data.idDispositivo = datos.idDispositivo;
    }
    if (datos.fcmToken !== undefined) {
      data.fcmToken = datos.fcmToken;
    }
    if (datos.infoDispositivo !== undefined) {
      data.infoDispositivo = datos.infoDispositivo as unknown as Prisma.InputJsonValue;
    }

    await this.prisma.victima.update({
      where: { id },
      data,
    });
  }

  async actualizarApiKey(id: string, apiKey: string): Promise<void> {
    await this.prisma.victima.update({
      where: { id },
      data: {
        apiKey: apiKey,
        estadoCuenta: EstadoCuenta.ACTIVA,
      },
    });
  }

  async actualizarEstadoCuenta(id: string, estado: EstadoCuenta): Promise<void> {
    await this.prisma.victima.update({
      where: { id },
      data: {
        estadoCuenta: estado,
      },
    });
  }
}

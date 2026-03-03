import { Injectable } from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { RolesPermitidos } from '@/autenticacion/dominio/enums/roles-permitidos.enum';
import { PrismaService } from '@/prisma/prisma.service';
import {
  CrearUsuarioWebKerberosDatos,
  FiltrosUsuarioWeb,
  InfoDispositivo,
  RegistrarTokenFCMDatos,
  UsuarioWebKerberosEntity,
  UsuarioWebSimple,
} from '../../dominio/entidades/usuario-web-kerberos.entity';
import { UsuarioWebKerberosRepositorioPort } from '../../dominio/puertos/usuario-web-repositorio.port';

@Injectable()
export class UsuarioWebKerberosPrismaAdapter implements UsuarioWebKerberosRepositorioPort {
  constructor(private readonly prisma: PrismaService) {}

  async registrarUsuarioWeb(datos: CrearUsuarioWebKerberosDatos): Promise<void> {
    const data = {
      grado: datos.grado,
      nombreCompleto: datos.nombreCompleto,
      unidad: datos.unidad,
      idDepartamento: datos.idDepartamento,
      autorizacion: datos.autorizacion as Prisma.JsonObject,
      estadoSession: datos.estadoSession,
    };

    await this.prisma.usuarioWebKerberos.upsert({
      where: { id: datos.id },
      create: {
        id: datos.id,
        grado: datos.grado,
        nombreCompleto: data.nombreCompleto,
        unidad: data.unidad,
        idDepartamento: data.idDepartamento,
        autorizacion: data.autorizacion,
        estadoSession: data.estadoSession,
      },
      update: data,
    });
  }

  async obtenerUsuarioWeb(id: string): Promise<UsuarioWebKerberosEntity | null> {
    const usuario = await this.prisma.usuarioWebKerberos.findUnique({
      where: { id },
    });

    return usuario ? this.mapearDesdeBaseDatos(usuario) : null;
  }

  async actualizarEstadoSession(id: string, estadoSession: boolean): Promise<void> {
    await this.prisma.usuarioWebKerberos.update({
      where: { id },
      data: { estadoSession },
    });
  }

  async registrarTokenFCM(id: string, datos: RegistrarTokenFCMDatos): Promise<void> {
    const dataToUpdate: Prisma.UsuarioWebKerberosUpdateInput = {
      fcmToken: datos.fcmToken,
    };

    if (datos.infoDispositivo !== undefined) {
      dataToUpdate.infoDispositivo = datos.infoDispositivo ? (datos.infoDispositivo as Prisma.JsonObject) : Prisma.JsonNull;
    }

    await this.prisma.usuarioWebKerberos.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  private mapearDesdeBaseDatos(usuario: Prisma.UsuarioWebKerberosGetPayload<Record<string, never>>): UsuarioWebKerberosEntity {
    const usuarioAny = usuario as Record<string, unknown>;

    return {
      id: usuario.id,
      grado: usuario.grado,
      nombreCompleto: usuario.nombreCompleto,
      unidad: usuario.unidad,
      idDepartamento: usuario.idDepartamento,
      autorizacion: usuario.autorizacion as UsuarioWebKerberosEntity['autorizacion'],
      estadoSession: usuario.estadoSession,
      fcmToken: usuario.fcmToken ?? undefined,
      infoDispositivo: usuarioAny.infoDispositivo ? this.mapearInfoDispositivo(usuarioAny.infoDispositivo as Prisma.JsonValue) : undefined,
      actualizadoEn: usuario.actualizadoEn ?? undefined,
    };
  }

  private mapearInfoDispositivo(info: Prisma.JsonValue): InfoDispositivo {
    if (typeof info === 'object' && info !== null && !Array.isArray(info)) {
      const obj = info as Record<string, unknown>;
      return {
        navegador: typeof obj.navegador === 'string' ? obj.navegador : undefined,
        sistemaOperativo: typeof obj.sistemaOperativo === 'string' || typeof obj.sistema_operativo === 'string' ? (obj.sistemaOperativo as string) || (obj.sistema_operativo as string) : undefined,
        dispositivo: typeof obj.dispositivo === 'string' ? obj.dispositivo : undefined,
      };
    }
    return {};
  }

  async listarUsuariosWeb(filtros: FiltrosUsuarioWeb): Promise<{ usuarios: UsuarioWebSimple[]; total: number }> {
    const where: Prisma.UsuarioWebKerberosWhereInput = {};

    if (filtros.estadoSession !== undefined) where.estadoSession = filtros.estadoSession;

    // Búsqueda por texto en campos relevantes
    if (filtros.busqueda && filtros.busqueda.trim() !== '') {
      const q = filtros.busqueda.trim();
      where.OR = [{ grado: { contains: q, mode: 'insensitive' } }, { nombreCompleto: { contains: q, mode: 'insensitive' } }, { unidad: { contains: q, mode: 'insensitive' } }];
    }

    const pagina = filtros.pagina && filtros.pagina > 0 ? filtros.pagina : 1;
    const limite = filtros.elementosPorPagina && filtros.elementosPorPagina > 0 ? Math.min(filtros.elementosPorPagina, 100) : 10;
    const skip = (pagina - 1) * limite;

    // Configurar ordenamiento
    const campoOrden = filtros.ordenarPor || 'actualizadoEn';
    const direccionOrden = filtros.orden?.toLowerCase() || 'desc';

    const [rows, total] = await Promise.all([
      this.prisma.usuarioWebKerberos.findMany({
        where,
        select: {
          id: true,
          grado: true,
          nombreCompleto: true,
          unidad: true,
          estadoSession: true,
          actualizadoEn: true,
        },
        orderBy: { [campoOrden]: direccionOrden },
        skip,
        take: limite,
      }),
      this.prisma.usuarioWebKerberos.count({ where }),
    ]);

    const usuarios: UsuarioWebSimple[] = rows.map((usuario) => ({
      id: usuario.id,
      grado: usuario.grado,
      nombreCompleto: usuario.nombreCompleto,
      unidad: usuario.unidad,
      estadoSession: usuario.estadoSession,
      actualizadoEn: usuario.actualizadoEn || undefined,
    }));

    return {
      usuarios,
      total,
    };
  }

  async obtenerTokensFCMUsuariosWeb(idDepartamento: number): Promise<string[]> {
    const usuarios = await this.prisma.usuarioWebKerberos.findMany({
      where: {
        estadoSession: true,
        fcmToken: { not: null },
        idDepartamento: idDepartamento,
        autorizacion: {
          path: ['rol'],
          equals: RolesPermitidos.OPERADOR,
        },
      },
      select: {
        fcmToken: true,
      },
    });

    return usuarios.map((u) => u.fcmToken!).filter(Boolean);
  }
}

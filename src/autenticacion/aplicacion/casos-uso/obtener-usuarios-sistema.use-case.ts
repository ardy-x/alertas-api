import { Inject, Injectable } from '@nestjs/common';
import { KerberosUsuarioSistema } from '@/autenticacion/infraestructura/adaptadores/kerberos.adapter';
import { KerberosPort } from '../../dominio/puertos/kerberos.port';
import { KERBEROS_PORT_TOKEN } from '../../dominio/tokens/autenticacion.tokens';
import { ObtenerUsuariosSistemaQueryDto } from '../../presentacion/dtos/entrada/obtener-usuarios-sistema-query.dto';
import { ObtenerUsuariosSistemaDatosDto, UsuarioSistemaDto } from '../../presentacion/dtos/salida/obtener-usuarios-sistema-response.dto';

@Injectable()
export class ObtenerUsuariosSistemaUseCase {
  constructor(
    @Inject(KERBEROS_PORT_TOKEN)
    private readonly kerberosRepositorio: KerberosPort,
  ) {}

  async ejecutar(idSistema: string, query: ObtenerUsuariosSistemaQueryDto, accessToken: string): Promise<ObtenerUsuariosSistemaDatosDto> {
    const busqueda = query.busqueda?.trim() || undefined;
    const pagina = query.pagina && query.pagina > 0 ? query.pagina : 1;
    const elementosPorPagina = query.elementosPorPagina && query.elementosPorPagina > 0 ? query.elementosPorPagina : 10;

    const res = await this.kerberosRepositorio.obtenerUsuariosSistema(idSistema, accessToken, busqueda);

    const rawUsuarios = (res.data ?? []) as KerberosUsuarioSistema[];

    const usuarios: UsuarioSistemaDto[] = rawUsuarios.map((raw) => ({
      id: raw.id ?? '',
      nombreCompleto: raw.nombreCompleto ?? '',
      numeroDocumento: raw.numeroDocumento ?? '',
      fotografiaUrl: raw.fotografiaUrl ?? '',
      grado: raw.grado ?? '',
      unidad: raw.unidad ?? '',
      role: raw.role ?? '',
      estado: raw.estado ?? false,
    }));

    const rol = query.rol;
    const usuariosFiltrados = rol ? usuarios.filter((usuario) => usuario.role?.toLowerCase() === rol.toLowerCase()) : usuarios;

    const totalElementos = usuariosFiltrados.length;
    const totalPaginas = Math.max(1, Math.ceil(totalElementos / elementosPorPagina));
    const usuariosPaginados = usuariosFiltrados.slice((pagina - 1) * elementosPorPagina, pagina * elementosPorPagina);

    return {
      usuarios: usuariosPaginados,
      paginacion: {
        paginaActual: pagina,
        totalPaginas,
        totalElementos,
        elementosPorPagina,
      },
    };
  }
}

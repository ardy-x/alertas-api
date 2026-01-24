import { Inject, Injectable } from '@nestjs/common';

import { FiltrosUsuarioWeb, UsuarioWebKerberosRepositorioPort } from '../../dominio/puertos/usuario-web-repositorio.port';
import { USUARIO_WEB_KERBEROS_REPOSITORIO_TOKEN } from '../../dominio/tokens/usuario-web.tokens';
import { ListarUsuariosWebRequestDto } from '../../presentacion/dto/entrada/listar-usuarios-web-entrada.dto';
import { ListarUsuariosWebResponseDto } from '../../presentacion/dto/salida/usuarios-web-salida.dto';

@Injectable()
export class ListarUsuariosWebUseCase {
  constructor(
    @Inject(USUARIO_WEB_KERBEROS_REPOSITORIO_TOKEN)
    private readonly usuarioWebRepositorio: UsuarioWebKerberosRepositorioPort,
  ) {}

  async ejecutar(entrada: ListarUsuariosWebRequestDto = { pagina: 1, elementosPorPagina: 10 }): Promise<ListarUsuariosWebResponseDto> {
    // Preparar filtros para el repositorio
    const filtros: FiltrosUsuarioWeb = {
      pagina: entrada.pagina,
      elementosPorPagina: entrada.elementosPorPagina,
      busqueda: entrada?.busqueda,
      estadoSession: entrada?.estadoSession,
    };

    const listado = await this.usuarioWebRepositorio.listarUsuariosWeb(filtros);

    const usuarios = listado.usuarios.map((usuario) => ({
      id: usuario.id,
      grado: usuario.grado,
      nombreCompleto: usuario.nombreCompleto,
      unidad: usuario.unidad,
      estadoSession: usuario.estadoSession,
      actualizadoEn: usuario.actualizadoEn || new Date(),
    }));

    const totalElementos = listado.total;

    return {
      usuarios,
      paginacion: {
        paginaActual: entrada.pagina,
        totalPaginas: Math.ceil(totalElementos / entrada.elementosPorPagina),
        totalElementos,
        elementosPorPagina: entrada.elementosPorPagina,
      },
    };
  }
}

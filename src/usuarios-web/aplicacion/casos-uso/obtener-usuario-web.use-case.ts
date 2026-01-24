import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { UsuarioWebKerberosRepositorioPort } from '../../dominio/puertos/usuario-web-repositorio.port';
import { USUARIO_WEB_KERBEROS_REPOSITORIO_TOKEN } from '../../dominio/tokens/usuario-web.tokens';
import { UsuarioWebResponseDto } from '../../presentacion/dto/salida/usuarios-web-salida.dto';

@Injectable()
export class ObtenerUsuarioWebUseCase {
  constructor(
    @Inject(USUARIO_WEB_KERBEROS_REPOSITORIO_TOKEN)
    private readonly usuarioWebRepositorio: UsuarioWebKerberosRepositorioPort,
  ) {}

  async ejecutar(idUsuarioWeb: string): Promise<UsuarioWebResponseDto> {
    const usuario = await this.usuarioWebRepositorio.obtenerUsuarioWeb(idUsuarioWeb);

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${idUsuarioWeb} no encontrado`);
    }

    return {
      grado: usuario.grado,
      nombreCompleto: usuario.nombreCompleto,
      unidad: usuario.unidad,
      estadoSession: usuario.estadoSession,
    };
  }
}

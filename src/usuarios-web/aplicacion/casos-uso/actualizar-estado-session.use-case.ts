import { Inject, Injectable } from '@nestjs/common';

import { UsuarioWebKerberosRepositorioPort } from '../../dominio/puertos/usuario-web-repositorio.port';
import { USUARIO_WEB_KERBEROS_REPOSITORIO_TOKEN } from '../../dominio/tokens/usuario-web.tokens';

@Injectable()
export class ActualizarEstadoSessionUseCase {
  constructor(
    @Inject(USUARIO_WEB_KERBEROS_REPOSITORIO_TOKEN)
    private readonly usuarioWebRepositorio: UsuarioWebKerberosRepositorioPort,
  ) {}

  async ejecutar(idUsuarioWeb: string, estadoSession: boolean): Promise<void> {
    // Verificar que el usuario existe
    const usuario = await this.usuarioWebRepositorio.obtenerUsuarioWeb(idUsuarioWeb);

    if (!usuario) {
      throw new Error(`Usuario con ID ${idUsuarioWeb} no encontrado`);
    }

    // Actualizar estado de sesión
    await this.usuarioWebRepositorio.actualizarEstadoSession(idUsuarioWeb, estadoSession);
  }
}

import { Inject, Injectable } from '@nestjs/common';

import { UsuarioWebKerberosRepositorioPort } from '../../dominio/puertos/usuario-web-repositorio.port';
import { USUARIO_WEB_KERBEROS_REPOSITORIO_TOKEN } from '../../dominio/tokens/usuario-web.tokens';

@Injectable()
export class ObtenerTokensFCMUseCase {
  constructor(
    @Inject(USUARIO_WEB_KERBEROS_REPOSITORIO_TOKEN)
    private readonly usuarioWebRepositorio: UsuarioWebKerberosRepositorioPort,
  ) {}

  async ejecutar(idDepartamento: number): Promise<string[]> {
    return await this.usuarioWebRepositorio.obtenerTokensFCMUsuariosWeb(idDepartamento);
  }
}

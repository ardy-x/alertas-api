import { Inject, Injectable } from '@nestjs/common';

import { CrearUsuarioWebKerberosDatos, UsuarioWebKerberosRepositorioPort } from '../../dominio/puertos/usuario-web-repositorio.port';
import { USUARIO_WEB_KERBEROS_REPOSITORIO_TOKEN } from '../../dominio/tokens/usuario-web.tokens';

@Injectable()
export class RegistrarUsuarioWebUseCase {
  constructor(
    @Inject(USUARIO_WEB_KERBEROS_REPOSITORIO_TOKEN)
    private readonly usuarioWebRepositorio: UsuarioWebKerberosRepositorioPort,
  ) {}

  async ejecutar(entrada: CrearUsuarioWebKerberosDatos): Promise<void> {
    // Registrar o actualizar usuario
    await this.usuarioWebRepositorio.registrarUsuarioWeb({
      id: entrada.id,
      grado: entrada.grado,
      nombreCompleto: entrada.nombreCompleto,
      unidad: entrada.unidad,
      idDepartamento: entrada.idDepartamento,
      autorizacion: entrada.autorizacion,
      estadoSession: entrada.estadoSession,
    });
  }
}

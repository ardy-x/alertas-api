import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { UsuarioWebKerberosRepositorioPort } from '../../dominio/puertos/usuario-web-repositorio.port';
import { USUARIO_WEB_KERBEROS_REPOSITORIO_TOKEN } from '../../dominio/tokens/usuario-web.tokens';
import { RegistrarTokenFCMRequestDto } from '../../presentacion/dto/entrada/usuarios-web-entrada.dto';

@Injectable()
export class RegistrarTokenFCMUseCase {
  constructor(
    @Inject(USUARIO_WEB_KERBEROS_REPOSITORIO_TOKEN)
    private readonly usuarioWebRepositorio: UsuarioWebKerberosRepositorioPort,
  ) {}

  async ejecutar(dto: RegistrarTokenFCMRequestDto, idUsuarioWeb: string): Promise<void> {
    // Buscar usuario
    const usuario = await this.usuarioWebRepositorio.obtenerUsuarioWeb(idUsuarioWeb);

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${idUsuarioWeb} no encontrado`);
    }

    // Registrar token FCM
    await this.usuarioWebRepositorio.registrarTokenFCM(idUsuarioWeb, {
      fcmToken: dto.fcmToken,
      infoDispositivo: dto.infoDispositivo,
    });
  }
}

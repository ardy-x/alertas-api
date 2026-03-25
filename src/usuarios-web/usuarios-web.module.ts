import { Module } from '@nestjs/common';

import { PrismaModule } from '@/prisma/prisma.module';

import { ActualizarEstadoSessionUseCase } from './aplicacion/casos-uso/actualizar-estado-session.use-case';
import { ListarUsuariosWebUseCase } from './aplicacion/casos-uso/listar-usuarios-web.use-case';
import { ObtenerTokensFCMUseCase } from './aplicacion/casos-uso/obtener-tokens-fcm.use-case';
import { ObtenerUsuarioWebUseCase } from './aplicacion/casos-uso/obtener-usuario-web.use-case';
import { RegistrarTokenFCMUseCase } from './aplicacion/casos-uso/registrar-token-fcm.use-case';
import { RegistrarUsuarioWebUseCase } from './aplicacion/casos-uso/registrar-usuario-web.use-case';
import { USUARIO_WEB_KERBEROS_REPOSITORIO_TOKEN } from './dominio/tokens/usuario-web.tokens';
import { UsuarioWebKerberosPrismaAdapter } from './infraestructura/adaptadores/usuario-web-kerberos-prisma.adapter';
import { UsuariosWebController } from './presentacion/controladores/usuarios-web.controller';

@Module({
  imports: [PrismaModule],
  controllers: [UsuariosWebController],
  providers: [
    UsuarioWebKerberosPrismaAdapter,
    {
      provide: USUARIO_WEB_KERBEROS_REPOSITORIO_TOKEN,
      useClass: UsuarioWebKerberosPrismaAdapter,
    },
    RegistrarTokenFCMUseCase,
    ObtenerUsuarioWebUseCase,
    RegistrarUsuarioWebUseCase,
    ActualizarEstadoSessionUseCase,
    ListarUsuariosWebUseCase,
    ObtenerTokensFCMUseCase,
  ],
  exports: [USUARIO_WEB_KERBEROS_REPOSITORIO_TOKEN, RegistrarUsuarioWebUseCase, ObtenerTokensFCMUseCase, ObtenerUsuarioWebUseCase],
})
export class UsuariosWebModule {}

import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { ExcepcionGlobalFilter } from '@/core/filtros/excepcion-global.filter';
import { CoreModule } from '../core/core.module';

import { PrismaModule } from '../prisma/prisma.module';
import { UsuariosWebModule } from '../usuarios-web/usuarios-web.module';
import { CierreSesionSistemaUseCase } from './aplicacion/casos-uso/cierre-sesion-sistema.use-case';
import { DecodificarTokenUseCase } from './aplicacion/casos-uso/decodificar-token.use-case';
import { ObtenerUsuariosSistemaUseCase } from './aplicacion/casos-uso/obtener-usuarios-sistema.use-case';
import { RefreshTokenUseCase } from './aplicacion/casos-uso/refresh-token.use-case';
import { KERBEROS_PORT_TOKEN } from './dominio/tokens/autenticacion.tokens';
import { KerberosAdapter } from './infraestructura/adaptadores/kerberos.adapter';
import { KerberosJwtStrategy } from './infraestructura/estrategias/kerberos-jwt.strategy';
import { KerberosJwtAuthGuard } from './infraestructura/guards/kerberos-jwt-auth.guard';
import { RolesGuard } from './infraestructura/guards/roles.guard';
import { AutenticacionController } from './presentacion/controladores/autenticacion.controller';

@Module({
  imports: [PassportModule, CoreModule, PrismaModule, UsuariosWebModule],
  controllers: [AutenticacionController],
  providers: [
    {
      provide: KERBEROS_PORT_TOKEN,
      useClass: KerberosAdapter,
    },
    DecodificarTokenUseCase,
    RefreshTokenUseCase,
    CierreSesionSistemaUseCase,
    ObtenerUsuariosSistemaUseCase,
    KerberosJwtStrategy,
    KerberosJwtAuthGuard,
    RolesGuard,
    {
      provide: APP_FILTER,
      useClass: ExcepcionGlobalFilter,
    },
  ],
  exports: [KerberosJwtStrategy, KerberosJwtAuthGuard, RolesGuard],
})
export class AutenticacionModule {}

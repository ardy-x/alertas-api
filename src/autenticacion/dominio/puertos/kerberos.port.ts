import { KerberosPaginacion, KerberosUsuarioSistema } from '@/autenticacion/infraestructura/adaptadores/kerberos.adapter';

export interface KerberosPort {
  intercambioCodigo(code: string): Promise<{
    token: string;
  }>;
  cierreSesionSistema(idSistema: string, accessToken: string): Promise<void>;
  refreshToken(refreshToken: string): Promise<{
    access_token: string;
    refresh_token: string;
  }>;
  obtenerUsuariosSistema(
    idSistema: string,
    accessToken: string,
    busqueda?: string,
  ): Promise<{
    data: KerberosUsuarioSistema[];
    meta: KerberosPaginacion;
  }>;
}

export interface KerberosPort {
  intercambioCodigo(code: string): Promise<{
    token: string;
  }>;
  cierreSesionSistema(idSistema: string, accessToken: string): Promise<void>;
  refreshToken(refreshToken: string): Promise<{
    access_token: string;
    refresh_token: string;
  }>;
}

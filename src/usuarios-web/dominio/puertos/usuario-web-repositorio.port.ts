import { CrearUsuarioWebKerberosDatos, FiltrosUsuarioWeb, RegistrarTokenFCMDatos, UsuarioWebKerberosEntity, UsuarioWebSimple } from '../entidades/usuario-web-kerberos.entity';

export { CrearUsuarioWebKerberosDatos, RegistrarTokenFCMDatos, FiltrosUsuarioWeb, UsuarioWebSimple };

export interface UsuarioWebKerberosRepositorioPort {
  registrarUsuarioWeb(datos: CrearUsuarioWebKerberosDatos): Promise<void>;
  obtenerUsuarioWeb(id: string): Promise<UsuarioWebKerberosEntity | null>;
  actualizarEstadoSession(id: string, estadoSession: boolean): Promise<void>;
  registrarTokenFCM(id: string, datos: RegistrarTokenFCMDatos): Promise<void>;
  listarUsuariosWeb(filtros: FiltrosUsuarioWeb): Promise<{ usuarios: UsuarioWebSimple[]; total: number }>;
  obtenerTokensFCMUsuariosWeb(idDepartamento: number): Promise<string[]>;
}

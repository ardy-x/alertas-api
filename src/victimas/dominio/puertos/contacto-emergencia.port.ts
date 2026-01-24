import { ActualizarContactoEmergencia, ContactoEmergencia, CrearContactoEmergencia } from '../entidades/contacto-emergencia.entity';

export { ContactoEmergencia, CrearContactoEmergencia, ActualizarContactoEmergencia };

export interface ContactoEmergenciaRepositorioPort {
  crearContacto(datos: CrearContactoEmergencia): Promise<ContactoEmergencia>;
  obtenerContactoEmergencia(id: string): Promise<ContactoEmergencia | null>;
  obtenerContactosPorVictima(idVictima: string): Promise<ContactoEmergencia[]>;
  actualizarContacto(id: string, datos: ActualizarContactoEmergencia): Promise<void>;
  marcarComoPrincipal(idVictima: string, idContacto: string): Promise<void>;
  eliminarContacto(idContacto: string): Promise<void>;
}

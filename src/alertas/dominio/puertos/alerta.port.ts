import { UbicacionPoint } from '@/integraciones/dominio/entidades/ubicacion.types';

import { AlertaBase, AlertaCreada, DatosVictimaParaAlerta, NuevaAlerta } from '../entidades/alerta.entity';
import { EstadoAlerta } from '../enums/alerta-enums';

export interface AlertaRepositorioPort {
  crearAlerta(datos: NuevaAlerta): Promise<AlertaCreada>;
  obtenerAlertaSimple(id: string): Promise<AlertaBase | null>;
  obtenerEstadoAlerta(id: string): Promise<EstadoAlerta | null>;
  actualizarEstado(id: string, estadoAlerta: EstadoAlerta): Promise<void>;
  actualizarUbicacion(id: string, ubicacion: UbicacionPoint | null): Promise<void>;
  verificarVictimaExiste(idVictima: string): Promise<boolean>;
  verificarAlertaActivaVictima(idVictima: string): Promise<boolean>;
  obtenerDatosVictimaParaAlerta(idVictima: string): Promise<DatosVictimaParaAlerta>;
}

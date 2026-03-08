import { InvestigadorVictimaEntity } from '../entidades/investigador-victima.entity';

export interface AsignarInvestigadorDatos {
  idVictima: string;
  ciInvestigador: string;
  fechaAsignacion: Date;
  observaciones?: string;
}

export interface InvestigadorVictimaRepositorioPort {
  asignar(datos: AsignarInvestigadorDatos): Promise<void>;
  desasignar(idVictima: string): Promise<void>;
  obtenerActivo(idVictima: string): Promise<InvestigadorVictimaEntity | null>;
  obtenerHistorial(idVictima: string): Promise<InvestigadorVictimaEntity[]>;
  obtenerVictimasIdsPorInvestigador(ciInvestigador: string): Promise<string[]>;
  tieneInvestigadorActivo(idVictima: string): Promise<boolean>;
}

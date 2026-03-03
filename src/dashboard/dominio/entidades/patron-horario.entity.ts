export interface IntensidadHoraria {
  dia_semana: string;
  hora: number;
  cantidad: number;
}

export class PatronHorario {
  datos: IntensidadHoraria[];
  total_alertas: number;
  hora_pico: { dia: string; hora: number; cantidad: number };

  constructor(datos: IntensidadHoraria[], totalAlertas: number, horaPico: { dia: string; hora: number; cantidad: number }) {
    this.datos = datos;
    this.total_alertas = totalAlertas;
    this.hora_pico = horaPico;
  }
}

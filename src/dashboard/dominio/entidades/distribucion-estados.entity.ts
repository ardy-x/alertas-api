export interface EstadoAlertaDistribucion {
  estado: string;
  cantidad: number;
  porcentaje: number;
}

export class DistribucionEstados {
  estados: EstadoAlertaDistribucion[];
  total_alertas: number;

  constructor(estados: EstadoAlertaDistribucion[], totalAlertas: number) {
    this.estados = estados;
    this.total_alertas = totalAlertas;
  }
}

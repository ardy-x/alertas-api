export interface VictimaVerificada {
  id: string;
  cedulaIdentidad: string;
  nombreCompleto: string;
  celular?: string;
  fechaNacimiento: Date;
  correo?: string;
  direccionDomicilio?: string;
  puntoReferencia?: string;
  botonPanico: boolean;
}

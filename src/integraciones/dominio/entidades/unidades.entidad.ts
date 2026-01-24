export interface Unidad {
  id: number;
  unidad: string;
  direccion: string;
  ubicacion: {
    latitud: number;
    longitud: number;
  };
  referencia: string;
  departamento: string;
  provincia: string;
  municipio: string;
  organismo?: string;
}

export interface ContactoEmergencia {
  id: string;
  idVictima: string;
  nombreCompleto: string;
  celular: string;
  parentesco: string;
  principal: boolean;
  creadoEn?: Date | null;
  actualizadoEn?: Date | null;
}

export type CrearContactoEmergencia = Omit<ContactoEmergencia, 'creadoEn' | 'actualizadoEn'>;

export interface ActualizarContactoEmergencia {
  nombreCompleto?: string;
  celular?: string;
  parentesco?: string;
}

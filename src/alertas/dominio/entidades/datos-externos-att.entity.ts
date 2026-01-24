import { ContactoAdicionalDatosAtt, ContactoDatosAtt, PersonaDatosAtt } from './persona-datos-att.entity';

export interface DatosExternosAttEntity {
  id: string;
  idAlerta: string;
  fechaRegistro: string;
  persona: PersonaDatosAtt;
  contacto: ContactoDatosAtt;
  contactos?: ContactoAdicionalDatosAtt[];
  creadoEn: Date;
  actualizadoEn?: Date;
}

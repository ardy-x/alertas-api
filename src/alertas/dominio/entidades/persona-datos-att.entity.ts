/**
 * Entidades del dominio - Datos externos ATT
 */

export interface PersonaDatosAtt {
  cedulaIdentidad: string;
  nombres: string;
  apellidos: string;
  celular: string;
  fechaNacimiento?: string;
}

export interface ContactoDatosAtt {
  nombreCompleto: string;
  celular: string;
  correo?: string;
}

export interface ContactoAdicionalDatosAtt {
  nombreCompleto: string;
  celular: string;
  relacion?: string;
  correo?: string;
}

export interface DatosExternosAtt {
  idAlerta: string;
  fechaRegistro: string;
  persona: PersonaDatosAtt;
  contacto: ContactoDatosAtt;
  contactos?: ContactoAdicionalDatosAtt[];
}

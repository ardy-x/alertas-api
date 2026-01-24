export interface Modulo {
  nombre: string;
  ruta: string;
  icono: string;
  orden: number;
}
export interface RolUsuarioWeb {
  rol: string;
  modulos: Modulo[];
  [key: string]: unknown; // Index signature para compatibilidad con Prisma JSON
}

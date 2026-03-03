/**
 * Roles válidos dentro del sistema.
 * Deben coincidir con los valores del campo `systemData.role` del token JWT.
 */
export enum RolesPermitidos {
  ADMIN = 'ADMIN',
  SUPERVISOR = 'SUPERVISOR',
  OPERADOR = 'OPERADOR',
  USUARIO = 'USUARIO',
}

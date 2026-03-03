import { SetMetadata } from '@nestjs/common';

import { RolesPermitidos } from '../../dominio/enums/roles-permitidos.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: RolesPermitidos[]) => SetMetadata(ROLES_KEY, roles);

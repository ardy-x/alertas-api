/**
 * Interfaces para el manejo de tokens JWT en la autenticación
 */

export interface ModuloSubJWT {
  name: string;
  path: string;
  icon: string;
  order: number;
  children?: ModuloSubJWT[];
}

export interface ModuloJWT {
  name: string;
  path: string;
  icon: string;
  order: number;
  children?: ModuloSubJWT[];
}

export interface SystemDataJWT {
  id: string;
  modules: ModuloJWT[];
  permissions: string[];
  role: string;
}

export interface UserDataJWT {
  userId: string;
  username: string;
  email: string;
  active: boolean;
  fullName: string;
  imageUser: string;
  verified: boolean;
  createdAt: string;
  lastAccess: string;
  unidad: string;
  grado: string;
}

export interface TokensJWT {
  access_token: string;
  refresh_token: string;
}

export interface DecodedJWT {
  systemData: SystemDataJWT;
  userData: UserDataJWT;
  tokens: TokensJWT;
  latitude: number;
  longitude: number;
  iat: number;
  exp: number;
}

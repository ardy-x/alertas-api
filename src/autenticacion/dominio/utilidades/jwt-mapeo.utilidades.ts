import { MunicipioProvinciaDepartamento } from '@/integraciones/dominio/entidades/departamentos.entidad';
import { DecodificarTokenRequestDto } from '../../presentacion/dtos/entrada/decodificar-token-request.dto';
import { DecodificarTokenDatosDto, ModuloDto, SubmoduloDto } from '../../presentacion/dtos/salida/decodificar-token-response.dto';
import { DecodedJWT, ModuloSubJWT } from '../entidades/jwt-entity';

/**
 * Utilidades para mapear datos de JWT a DTOs de respuesta
 */
export class JwtMapeoUtilidades {
  static mapearModuloRecursivo(modulo: ModuloSubJWT): SubmoduloDto {
    return {
      nombre: modulo.name,
      ruta: modulo.path,
      icono: modulo.icon,
      orden: modulo.order,
      submodulos: modulo.children?.map((hijo) => JwtMapeoUtilidades.mapearModuloRecursivo(hijo)) ?? [],
    };
  }

  static mapearADecodificarTokenResponse(decoded: DecodedJWT, departamento: MunicipioProvinciaDepartamento, modulos: ModuloDto[], entrada: DecodificarTokenRequestDto): DecodificarTokenDatosDto {
    const sistema = decoded.systemData;
    const usuario = decoded.userData;

    return {
      tokens: {
        accessToken: decoded.tokens?.access_token,
        refreshToken: decoded.tokens?.refresh_token,
      },
      datosSistema: {
        id: sistema.id,
        modulos,
        permisos: sistema.permissions,
        rol: sistema.role,
      },
      datosUsuario: {
        idUsuario: usuario.userId,
        nombreUsuario: usuario.username,
        correo: usuario.email,
        activo: usuario.active,
        nombreCompleto: usuario.fullName,
        imagenUsuario: usuario.imageUser,
        verificado: usuario.verified,
        creadoEn: usuario.createdAt,
        ultimoAcceso: usuario.lastAccess,
        unidad: usuario.unidad,
        grado: usuario.grado,
      },
      ubicacionUsuario: {
        departamento: departamento.departamento.departamento,
        idDepartamento: departamento.departamento.id,
        longitud: entrada.longitud,
        latitud: entrada.latitud,
      },
      iat: decoded.iat,
      exp: decoded.exp,
    };
  }
}

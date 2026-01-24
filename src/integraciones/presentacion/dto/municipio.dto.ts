import { ApiProperty } from '@nestjs/swagger';

// DTO para información de municipio
export class MunicipioDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  nombreMunicipio: string;

  @ApiProperty()
  provincia: {
    id: number;
    nombreProvincia: string;
    departamento: {
      id: number;
      nombreDepartamento: string;
    };
  };
}

// DTO plano para respuesta que contiene solo los nombres (sin IDs ni objetos anidados)
export class MunicipioPlanoDto {
  @ApiProperty()
  municipio: string;

  @ApiProperty()
  provincia: string;

  @ApiProperty()
  departamento: string;
}

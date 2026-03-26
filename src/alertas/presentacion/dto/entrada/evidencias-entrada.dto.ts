import { ApiProperty } from '@nestjs/swagger';

export class SubirEvidenciaDto {
  @ApiProperty({
    description: 'Archivo de evidencia (el tipo se detecta automáticamente)',
    type: 'string',
    format: 'binary',
  })
  declare archivo: unknown;
}

import { ApiProperty } from '@nestjs/swagger';
import { TipoEvidencia } from '@prisma/client';

export class EvidenciaResponseDto {
  @ApiProperty({
    description: 'ID de la evidencia',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  declare id: string;

  @ApiProperty({
    description: 'ID de la alerta',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  declare idAlerta: string;

  @ApiProperty({
    description: 'Tipo de evidencia',
    enum: TipoEvidencia,
    example: TipoEvidencia.FOTO,
  })
  declare tipoEvidencia: TipoEvidencia;

  @ApiProperty({
    description: 'Ruta del archivo',
    example: '/archivos/evidencias/abc123-foto.jpg',
  })
  declare rutaArchivo: string;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2026-03-06T12:00:00Z',
  })
  declare creadoEn: Date;
}

export class ListarEvidenciasResponseDto {
  @ApiProperty({
    description: 'Lista de evidencias',
    type: [EvidenciaResponseDto],
  })
  declare evidencias: EvidenciaResponseDto[];

  @ApiProperty({
    description: 'Total de evidencias',
    example: 5,
  })
  declare total: number;
}

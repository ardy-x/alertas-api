import { ApiProperty } from '@nestjs/swagger';

export class VictimaDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  cedulaIdentidad: string;

  @ApiProperty()
  nombreCompleto: string;

  @ApiProperty({ required: false })
  celular?: string;

  @ApiProperty()
  fechaNacimiento: Date;

  @ApiProperty({ required: false })
  correo?: string;

  @ApiProperty({ required: false })
  direccionDomicilio?: string;

  @ApiProperty({ required: false })
  puntoReferencia?: string;

  @ApiProperty()
  botonPanico: boolean;
}

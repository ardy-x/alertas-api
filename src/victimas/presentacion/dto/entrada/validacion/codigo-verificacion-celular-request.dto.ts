import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString, Length } from 'class-validator';

export class VerificarCodigoCelularRequestDto {
  @ApiProperty({
    description: 'Número de celular de la víctima',
    example: '79550230',
  })
  @IsString()
  @IsNotEmpty()
  @Length(8, 15, { message: 'El celular debe tener entre 8 y 15 caracteres' })
  celular: string;

  @ApiProperty({
    description: 'Código de verificación de 6 dígitos',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'El código debe tener exactamente 6 dígitos' })
  codigo: string;
}

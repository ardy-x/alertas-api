import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString, Length } from 'class-validator';

export class SolicitarCodigoWhatsappRequestDto {
  @ApiProperty({
    description: 'Número de celular de la víctima',
    example: '79550230',
  })
  @IsString()
  @IsNotEmpty()
  @Length(8, 15, { message: 'El celular debe tener entre 8 y 15 caracteres' })
  celular: string;
}

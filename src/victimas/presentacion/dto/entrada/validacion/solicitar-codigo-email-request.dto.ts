import { ApiProperty } from '@nestjs/swagger';

import { IsEmail, IsNotEmpty } from 'class-validator';

export class SolicitarCodigoEmailRequestDto {
  @ApiProperty({
    description: 'Correo electrónico de la víctima',
    example: 'rubendavid.rd21@gmail.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

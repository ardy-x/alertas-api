import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenRequestDto {
  @ApiProperty({
    example: '',
    description: 'Token de refresco para obtener nuevos tokens',
  })
  @IsNotEmpty()
  @IsString()
  declare refreshToken: string;
}

import { ApiProperty } from '@nestjs/swagger';

export class RespuestaBaseDto<T = void> {
  @ApiProperty()
  error: boolean;

  @ApiProperty()
  status: number;

  @ApiProperty()
  message: string;

  @ApiProperty()
  response: T | null;
}

export class PaginacionRespuestaBaseDto<T> {
  @ApiProperty()
  error: boolean;

  @ApiProperty()
  status: number;

  @ApiProperty()
  message: string;

  @ApiProperty()
  response: T | null;
}

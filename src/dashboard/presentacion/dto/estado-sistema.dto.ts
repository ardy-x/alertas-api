import { ApiProperty } from '@nestjs/swagger';

class EstadoProcesoPM2Dto {
  @ApiProperty()
  nombre: string;

  @ApiProperty({ enum: ['online', 'errored', 'stopped', 'unknown'] })
  status: 'online' | 'errored' | 'stopped' | 'unknown';
}

class EstadoBaseDatosDto {
  @ApiProperty({ enum: ['connected', 'disconnected', 'error'] })
  db_status: 'connected' | 'disconnected' | 'error';
}

class RecursosHardwareDto {
  @ApiProperty({ example: '15%' })
  cpu_load: string;

  @ApiProperty({ example: '1.2GB' })
  free_mem: string;

  @ApiProperty({ example: '8GB' })
  total_mem: string;

  @ApiProperty({ example: '6.8GB' })
  used_mem: string;
}

class EstadoWebSocketDto {
  @ApiProperty({ enum: ['active', 'inactive'] })
  status: 'active' | 'inactive';

  @ApiProperty()
  supervisores_conectados: number;
}

class EstadoServicioExternoDto {
  @ApiProperty()
  nombre: string;

  @ApiProperty()
  url: string;

  @ApiProperty({ enum: ['online', 'offline'] })
  status: 'online' | 'offline';

  @ApiProperty({ required: false })
  tiempo_respuesta?: number;
}

export class EstadoSistemaDto {
  @ApiProperty({ type: [EstadoProcesoPM2Dto] })
  procesos: EstadoProcesoPM2Dto[];

  @ApiProperty({ type: EstadoBaseDatosDto })
  base_datos: EstadoBaseDatosDto;

  @ApiProperty({ type: RecursosHardwareDto })
  hardware: RecursosHardwareDto;

  @ApiProperty({ type: EstadoWebSocketDto })
  websocket: EstadoWebSocketDto;

  @ApiProperty({ type: [EstadoServicioExternoDto] })
  servicios_externos: EstadoServicioExternoDto[];

  @ApiProperty()
  timestamp: Date;
}

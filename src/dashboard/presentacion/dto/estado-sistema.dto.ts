import { ApiProperty } from '@nestjs/swagger';

class EstadoProcesoPM2Dto {
  @ApiProperty()
  nombre: string;

  @ApiProperty({ enum: ['online', 'errored', 'stopped', 'unknown'] })
  status: 'online' | 'errored' | 'stopped' | 'unknown';

  @ApiProperty({ example: '2d 5h' })
  uptime: string;

  @ApiProperty({ example: 3 })
  restarts: number;

  @ApiProperty({ example: '0.15GB' })
  memory: string;

  @ApiProperty({ example: '2.5%' })
  cpu: string;
}

class EstadoBaseDatosDto {
  @ApiProperty({ enum: ['connected', 'disconnected', 'error'] })
  db_status: 'connected' | 'disconnected' | 'error';

  @ApiProperty({ example: 'PostgreSQL 14.5' })
  version: string;

  @ApiProperty({ example: 100 })
  max_connections: number;

  @ApiProperty({ example: 5 })
  active_connections: number;
}

class EstadoRedisDto {
  @ApiProperty({ enum: ['connected', 'disconnected'] })
  status: 'connected' | 'disconnected';

  @ApiProperty({ example: '5d 12h' })
  uptime: string;

  @ApiProperty({ example: '2.5M' })
  used_memory: string;

  @ApiProperty({ example: 5 })
  connected_clients: number;
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

  @ApiProperty({ required: false, example: '150.5GB' })
  disk_free?: string;

  @ApiProperty({ required: false, example: '500GB' })
  disk_total?: string;

  @ApiProperty({ required: false, example: '349.5GB' })
  disk_used?: string;

  @ApiProperty({ required: false, example: '70%' })
  disk_usage_percent?: string;
}

class OperadoresPorDepartamentoDto {
  @ApiProperty()
  departamento: string;

  @ApiProperty()
  operadores_conectados: number;
}

class EstadoWebSocketDto {
  @ApiProperty({ enum: ['active', 'inactive'] })
  status: 'active' | 'inactive';

  @ApiProperty()
  operadores_conectados: number;

  @ApiProperty({ type: [OperadoresPorDepartamentoDto] })
  por_departamento: OperadoresPorDepartamentoDto[];
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

  @ApiProperty({ type: EstadoRedisDto })
  redis: EstadoRedisDto;

  @ApiProperty({ type: RecursosHardwareDto })
  hardware: RecursosHardwareDto;

  @ApiProperty({ type: EstadoWebSocketDto })
  websocket: EstadoWebSocketDto;

  @ApiProperty({ type: [EstadoServicioExternoDto] })
  servicios_externos: EstadoServicioExternoDto[];

  @ApiProperty()
  timestamp: Date;
}

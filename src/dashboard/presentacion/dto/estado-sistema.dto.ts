import { ApiProperty } from '@nestjs/swagger';

class EstadoProcesoPM2Dto {
  @ApiProperty()
  declare nombre: string;

  @ApiProperty({ enum: ['online', 'errored', 'stopped', 'unknown'] })
  declare status: 'online' | 'errored' | 'stopped' | 'unknown';

  @ApiProperty({ example: '2d 5h' })
  declare uptime: string;

  @ApiProperty({ example: 3 })
  declare restarts: number;

  @ApiProperty({ example: '0.15GB' })
  declare memory: string;

  @ApiProperty({ example: '2.5%' })
  declare cpu: string;
}

class EstadoBaseDatosDto {
  @ApiProperty({ enum: ['connected', 'disconnected', 'error'] })
  declare db_status: 'connected' | 'disconnected' | 'error';

  @ApiProperty({ example: 'PostgreSQL 14.5' })
  declare version: string;
}

class EstadoRedisDto {
  @ApiProperty({ enum: ['connected', 'disconnected'] })
  declare status: 'connected' | 'disconnected';

  @ApiProperty({ example: '2.5M' })
  declare used_memory: string;
}

class RecursosHardwareDto {
  @ApiProperty({ example: '15%' })
  declare cpu_load: string;

  @ApiProperty({ example: '1.2GB' })
  declare free_mem: string;

  @ApiProperty({ example: '8GB' })
  declare total_mem: string;

  @ApiProperty({ example: '6.8GB' })
  declare used_mem: string;

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
  declare departamento: string;

  @ApiProperty()
  declare operadores_conectados: number;
}

class EstadoWebSocketDto {
  @ApiProperty({ enum: ['active', 'inactive'] })
  declare status: 'active' | 'inactive';

  @ApiProperty()
  declare operadores_conectados: number;

  @ApiProperty({ type: [OperadoresPorDepartamentoDto] })
  declare por_departamento: OperadoresPorDepartamentoDto[];
}

class EstadoServicioExternoDto {
  @ApiProperty()
  declare nombre: string;

  @ApiProperty()
  declare url: string;

  @ApiProperty({ enum: ['online', 'offline'] })
  declare status: 'online' | 'offline';

  @ApiProperty({ required: false })
  tiempo_respuesta?: number;
}

export class EstadoSistemaDto {
  @ApiProperty({ type: [EstadoProcesoPM2Dto] })
  declare procesos: EstadoProcesoPM2Dto[];

  @ApiProperty({ type: EstadoBaseDatosDto })
  declare base_datos: EstadoBaseDatosDto;

  @ApiProperty({ type: EstadoRedisDto })
  declare redis: EstadoRedisDto;

  @ApiProperty({ type: RecursosHardwareDto })
  declare hardware: RecursosHardwareDto;

  @ApiProperty({ type: EstadoWebSocketDto })
  declare websocket: EstadoWebSocketDto;

  @ApiProperty({ type: [EstadoServicioExternoDto] })
  declare servicios_externos: EstadoServicioExternoDto[];

  @ApiProperty()
  declare timestamp: Date;
}

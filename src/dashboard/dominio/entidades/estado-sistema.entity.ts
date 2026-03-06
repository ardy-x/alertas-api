export interface EstadoProcesoPM2 {
  nombre: string;
  status: 'online' | 'errored' | 'stopped' | 'unknown';
  uptime: string;
  restarts: number;
  memory: string;
  cpu: string;
}

export interface EstadoBaseDatos {
  db_status: 'connected' | 'disconnected' | 'error';
  version: string;
  max_connections: number;
  active_connections: number;
}

export interface EstadoRedis {
  status: 'connected' | 'disconnected';
  uptime: string;
  used_memory: string;
  connected_clients: number;
}

export interface RecursosHardware {
  cpu_load: string;
  free_mem: string;
  total_mem: string;
  used_mem: string;
  disk_free?: string;
  disk_total?: string;
  disk_used?: string;
  disk_usage_percent?: string;
}

export interface OperadoresPorDepartamento {
  departamento: string;
  operadores_conectados: number;
}

export interface EstadoWebSocket {
  status: 'active' | 'inactive';
  operadores_conectados: number;
  por_departamento: OperadoresPorDepartamento[];
}

export interface EstadoServicioExterno {
  nombre: string;
  url: string;
  status: 'online' | 'offline';
  tiempo_respuesta?: number;
}

export class EstadoSistema {
  procesos: EstadoProcesoPM2[];
  base_datos: EstadoBaseDatos;
  redis: EstadoRedis;
  hardware: RecursosHardware;
  websocket: EstadoWebSocket;
  servicios_externos: EstadoServicioExterno[];
  timestamp: Date;

  constructor(procesos: EstadoProcesoPM2[], baseDatos: EstadoBaseDatos, redis: EstadoRedis, hardware: RecursosHardware, websocket: EstadoWebSocket, serviciosExternos: EstadoServicioExterno[]) {
    this.procesos = procesos;
    this.base_datos = baseDatos;
    this.redis = redis;
    this.hardware = hardware;
    this.websocket = websocket;
    this.servicios_externos = serviciosExternos;
    this.timestamp = new Date();
  }
}

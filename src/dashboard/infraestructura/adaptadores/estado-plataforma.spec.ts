/// <reference types="jest" />

jest.mock('@/config/servicios.config', () => ({
  SERVICIOS_CONFIG: {
    catalogosApiBase: 'http://catalogos.local',
    geoServerApiBase: 'http://geoserver.local',
    jupiterApiBase: 'http://jupiter.local',
    kerberosApiBase: 'http://kerberos.local',
    whatsappApiBase: 'http://whatsapp.local',
    emailApiBase: 'http://email.local',
    personalApiBase: 'http://personal.local',
  },
}));

jest.mock('pm2', () => ({
  connect: jest.fn(),
  list: jest.fn(),
  disconnect: jest.fn(),
}));

import * as nodeUtil from 'node:util';
import * as pm2 from 'pm2';
import { SERVICIOS_CONFIG } from '@/config/servicios.config';
import { MonitorSistemaAdapter } from './monitor-sistema.adapter';

describe('Estado de la plataforma', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('PM2: mapea estados de procesos', async () => {
    const pm2Mock = pm2 as unknown as {
      connect: jest.Mock;
      list: jest.Mock;
      disconnect: jest.Mock;
    };
    pm2Mock.connect.mockImplementation((cb: (error: null) => void) => cb(null));
    pm2Mock.list.mockImplementation((cb: (error: null, lista: unknown[]) => void) => {
      cb(null, [
        {
          name: 'api',
          pm2_env: { status: 'online', pm_uptime: 100_000, restart_time: 2 },
          monit: { memory: 2 * 1024 * 1024 * 1024, cpu: 30 },
        },
        {
          name: 'worker',
          pm2_env: { status: 'stopping', restart_time: 1 },
          monit: { memory: 0 },
        },
      ]);
    });

    const adapter = new MonitorSistemaAdapter({} as never, {} as never, {} as never, {} as never);
    const estado = await adapter.obtenerEstadoProcesosPM2(['api', 'worker', 'missing']);

    expect(estado[0].status).toBe('online');
    expect(estado[1].status).toBe('stopped');
    expect(estado[2].status).toBe('unknown');
  });

  it('PM2: retorna unknown cuando connect falla', async () => {
    const pm2Mock = pm2 as unknown as { connect: jest.Mock; list: jest.Mock; disconnect: jest.Mock };
    pm2Mock.connect.mockImplementation((cb: (error: Error) => void) => cb(new Error('pm2-down')));

    const adapter = new MonitorSistemaAdapter({} as never, {} as never, {} as never, {} as never);
    const estado = await adapter.obtenerEstadoProcesosPM2(['api']);

    expect(estado[0].status).toBe('unknown');
  });

  it('PM2: retorna unknown cuando list falla', async () => {
    const pm2Mock = pm2 as unknown as { connect: jest.Mock; list: jest.Mock; disconnect: jest.Mock };
    pm2Mock.connect.mockImplementation((cb: (error: null) => void) => cb(null));
    pm2Mock.list.mockImplementation((cb: (error: Error, lista?: unknown[]) => void) => cb(new Error('list-fail')));

    const adapter = new MonitorSistemaAdapter({} as never, {} as never, {} as never, {} as never);
    const estado = await adapter.obtenerEstadoProcesosPM2(['api']);

    expect(estado[0].status).toBe('unknown');
  });

  it('PM2: mapea estados errored y unknown', async () => {
    const pm2Mock = pm2 as unknown as { connect: jest.Mock; list: jest.Mock; disconnect: jest.Mock };
    pm2Mock.connect.mockImplementation((cb: (error: null) => void) => cb(null));
    pm2Mock.list.mockImplementation((cb: (error: null, lista: unknown[]) => void) => {
      cb(null, [
        { name: 'api', pm2_env: { status: 'errored', restart_time: 1 }, monit: { cpu: 5 } },
        { name: 'worker', pm2_env: { status: 'launching', restart_time: 0 }, monit: { memory: 1024 } },
      ]);
    });

    const adapter = new MonitorSistemaAdapter({} as never, {} as never, {} as never, {} as never);
    const estado = await adapter.obtenerEstadoProcesosPM2(['api', 'worker']);

    expect(estado[0].status).toBe('errored');
    expect(estado[1].status).toBe('unknown');
  });

  it('Servidor: calcula operadores y estado websocket', async () => {
    const rooms = new Map<string, Set<string>>([['operadores-2', new Set(['a', 'b'])]]);
    const alertasGateway = {
      servidor: {
        sockets: {
          adapter: { rooms },
        },
      },
    };
    const departamentosUseCase = {
      ejecutar: jest.fn().mockResolvedValue([{ id: 2, departamento: 'La Paz' }]),
    };

    const adapter = new MonitorSistemaAdapter({} as never, {} as never, alertasGateway as never, departamentosUseCase as never);
    const estado = await adapter.obtenerEstadoConexionesWebSocket();

    expect(estado.status).toBe('active');
    expect(estado.operadores_conectados).toBe(2);
  });

  it('Servidor: retorna inactive cuando no existe servidor websocket', async () => {
    const departamentosUseCase = { ejecutar: jest.fn() };
    const adapter = new MonitorSistemaAdapter({} as never, {} as never, { servidor: null } as never, departamentosUseCase as never);

    const estado = await adapter.obtenerEstadoConexionesWebSocket();

    expect(estado).toEqual({ status: 'inactive', operadores_conectados: 0, por_departamento: [] });
    expect(departamentosUseCase.ejecutar).not.toHaveBeenCalled();
  });

  it('Servidor: retorna por_departamento vacio cuando no hay salas de operadores con usuarios', async () => {
    const rooms = new Map<string, Set<string>>([
      ['operadores-1', new Set()],
      ['general', new Set(['a'])],
    ]);
    const departamentosUseCase = { ejecutar: jest.fn() };
    const gateway = { servidor: { sockets: { adapter: { rooms } } } };
    const adapter = new MonitorSistemaAdapter({} as never, {} as never, gateway as never, departamentosUseCase as never);

    const estado = await adapter.obtenerEstadoConexionesWebSocket();

    expect(estado.status).toBe('active');
    expect(estado.por_departamento).toEqual([]);
    expect(departamentosUseCase.ejecutar).not.toHaveBeenCalled();
  });

  it('PostgreSQL: valida conexion activa y parseo de version', async () => {
    const prismaService = {
      $queryRaw: jest
        .fn()
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce([{ version: 'PostgreSQL 16.2 on x86_64' }]),
    };

    const adapter = new MonitorSistemaAdapter(prismaService as never, {} as never, {} as never, {} as never);
    const estado = await adapter.verificarConexionBaseDatos();

    expect(estado).toEqual({
      db_status: 'connected',
      version: 'PostgreSQL 16.2',
    });
  });

  it('PostgreSQL: valida ruta error', async () => {
    const prismaService = {
      $queryRaw: jest.fn().mockRejectedValue(new Error('db-error')),
    };

    const adapter = new MonitorSistemaAdapter(prismaService as never, {} as never, {} as never, {} as never);
    const estado = await adapter.verificarConexionBaseDatos();

    expect(estado).toEqual({ db_status: 'error', version: 'N/A' });
  });

  it('Redis: valida estado conectado y memoria usada', async () => {
    const redisService = {
      getConnectionStatus: jest.fn().mockReturnValue(true),
      getServerInfo: jest.fn().mockResolvedValue('used_memory_human:10.5M'),
    };

    const adapter = new MonitorSistemaAdapter({} as never, redisService as never, {} as never, {} as never);
    const estado = await adapter.verificarConexionRedis();

    expect(estado).toEqual({
      status: 'connected',
      used_memory: '10.5M',
    });
  });

  it('Redis: valida estado disconnected cuando no hay conexion', async () => {
    const redisService = {
      getConnectionStatus: jest.fn().mockReturnValue(false),
      getServerInfo: jest.fn(),
    };

    const adapter = new MonitorSistemaAdapter({} as never, redisService as never, {} as never, {} as never);
    const estado = await adapter.verificarConexionRedis();

    expect(estado).toEqual({ status: 'disconnected', used_memory: 'N/A' });
  });

  it('Redis: valida estado disconnected cuando getServerInfo falla', async () => {
    const redisService = {
      getConnectionStatus: jest.fn().mockReturnValue(true),
      getServerInfo: jest.fn().mockRejectedValue(new Error('redis-error')),
    };

    const adapter = new MonitorSistemaAdapter({} as never, redisService as never, {} as never, {} as never);
    const estado = await adapter.verificarConexionRedis();

    expect(estado).toEqual({ status: 'disconnected', used_memory: 'N/A' });
  });

  it('Hardware: obtiene recursos y parsea disco', async () => {
    const promisifySpy = jest.spyOn(nodeUtil, 'promisify').mockReturnValue((async () => ({
      stdout: 'Filesystem 1K-blocks Used Available Use% Mounted on\n/dev/sda1 2000 500 1500 25% /\noverlay 1000 500 500 50% /overlay\n/tmp malformed\n',
    })) as never);

    const adapter = new MonitorSistemaAdapter({} as never, {} as never, {} as never, {} as never);
    const recursos = await adapter.obtenerRecursosHardware();

    expect(recursos.cpu_load).toMatch(/%$/);
    expect(recursos.total_mem).toMatch(/GB$/);
    expect(recursos.disk_usage_percent).toBe('25%');
    promisifySpy.mockRestore();
  });

  it('Hardware: retorna sin info de disco cuando lectura falla', async () => {
    const promisifySpy = jest.spyOn(nodeUtil, 'promisify').mockReturnValue((async () => {
      throw new Error('df-fail');
    }) as never);

    const adapter = new MonitorSistemaAdapter({} as never, {} as never, {} as never, {} as never);
    const recursos = await adapter.obtenerRecursosHardware();

    expect(recursos.cpu_load).toMatch(/%$/);
    expect(recursos.disk_total).toBeUndefined();
    promisifySpy.mockRestore();
  });

  it('Servicios externos: verifica estados online u offline', async () => {
    const fetchMock = jest.fn().mockResolvedValue({ ok: true });
    (globalThis as { fetch?: typeof fetch }).fetch = fetchMock as unknown as typeof fetch;

    const adapter = new MonitorSistemaAdapter({} as never, {} as never, {} as never, {} as never);
    const estado = await adapter.verificarServiciosExternos();

    expect(estado).toHaveLength(7);
    expect(estado.every((s) => s.status === 'online' || s.status === 'offline')).toBe(true);
  });

  it('Servicios externos: marca offline cuando la URL no esta configurada', async () => {
    const originalEmail = SERVICIOS_CONFIG.emailApiBase;
    SERVICIOS_CONFIG.emailApiBase = '';

    const fetchMock = jest.fn().mockResolvedValue({ ok: true });
    (globalThis as { fetch?: typeof fetch }).fetch = fetchMock as unknown as typeof fetch;

    const adapter = new MonitorSistemaAdapter({} as never, {} as never, {} as never, {} as never);
    const estado = await adapter.verificarServiciosExternos();

    expect(estado.find((s) => s.nombre === 'Email API')?.status).toBe('offline');
    SERVICIOS_CONFIG.emailApiBase = originalEmail;
  });

  it('Servicios externos: marca offline cuando fetch falla', async () => {
    const fetchMock = jest.fn().mockRejectedValue(new Error('network-fail'));
    (globalThis as { fetch?: typeof fetch }).fetch = fetchMock as unknown as typeof fetch;

    const adapter = new MonitorSistemaAdapter({} as never, {} as never, {} as never, {} as never);
    const estado = await adapter.verificarServiciosExternos();

    expect(estado.every((s) => s.status === 'offline')).toBe(true);
  });
});

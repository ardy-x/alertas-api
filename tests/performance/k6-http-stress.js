import { check, sleep } from 'k6';
import http from 'k6/http';
import { Rate, Trend } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL;
if (!BASE_URL) {
  throw new Error('BASE_URL es obligatorio. Ejemplo: BASE_URL=https://tu-host/api');
}
const deptPublicFailures = new Rate('dept_public_failures');
const deptPublicLatency = new Trend('dept_public_latency_ms');
const verificarDenunciaFailures = new Rate('verificar_denuncia_failures');
const verificarDenunciaLatency = new Trend('verificar_denuncia_latency_ms');
const verificarVictimaFailures = new Rate('verificar_victima_failures');
const verificarVictimaLatency = new Trend('verificar_victima_latency_ms');

const FIXED_CI = '6666';
const FIXED_CUD = '1-030-20-00-25-00003';
// Coordenadas representativas por departamento para no concentrar carga en un solo punto.
const BOLIVIA_DEPARTMENT_COORDS = [
  { departamento: 'La Paz', latitud: -16.4897, longitud: -68.1193 },
  { departamento: 'Cochabamba', latitud: -17.3895, longitud: -66.1568 },
  { departamento: 'Santa Cruz', latitud: -17.7833, longitud: -63.1821 },
  { departamento: 'Oruro', latitud: -17.9833, longitud: -67.15 },
  { departamento: 'Potosi', latitud: -19.5836, longitud: -65.7531 },
  { departamento: 'Chuquisaca', latitud: -19.0474, longitud: -65.2592 },
  { departamento: 'Tarija', latitud: -21.5355, longitud: -64.7296 },
  { departamento: 'Beni', latitud: -14.8333, longitud: -64.9 },
  { departamento: 'Pando', latitud: -11.0267, longitud: -68.7692 },
];

// Criterio de estabilidad: todo 2xx-4xx se considera respuesta esperada; 5xx es falla.
http.setResponseCallback(http.expectedStatuses({ min: 200, max: 499 }));

export const options = {
  scenarios: {
    departamentos_publico: {
      executor: 'ramping-vus',
      exec: 'stressDepartamentoPublico',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 40 },
        { duration: '3m', target: 100 },
        { duration: '1m', target: 0 },
      ],
    },
    verificar_denuncia_publico: {
      executor: 'ramping-vus',
      exec: 'stressVerificarDenuncia',
      startTime: '10s',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 15 },
        { duration: '3m', target: 40 },
        { duration: '1m', target: 0 },
      ],
    },
    verificar_victima_publico: {
      executor: 'ramping-vus',
      exec: 'stressVerificarVictima',
      startTime: '20s',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 10 },
        { duration: '3m', target: 25 },
        { duration: '1m', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<3000'],
    dept_public_failures: ['rate<0.05'],
    verificar_denuncia_failures: ['rate<0.05'],
    verificar_victima_failures: ['rate<0.05'],
  },
};

function randomBoliviaCoord() {
  return BOLIVIA_DEPARTMENT_COORDS[Math.floor(Math.random() * BOLIVIA_DEPARTMENT_COORDS.length)];
}

export function stressDepartamentoPublico() {
  // Alterna coordenadas entre departamentos para simular tráfico geográfico real.
  const { latitud, longitud, departamento } = randomBoliviaCoord();
  const res = http.get(`${BASE_URL}/departamentos/encontrar?latitud=${encodeURIComponent(latitud)}&longitud=${encodeURIComponent(longitud)}`, {
    headers: { Accept: 'application/json' },
    tags: {
      name: 'GET /departamentos/encontrar',
      departamento,
    },
  });

  deptPublicLatency.add(res.timings.duration);

  const ok = check(res, {
    'departamentos/encontrar: status 2xx-4xx': (r) => r.status >= 200 && r.status < 500,
    'departamentos/encontrar: no 5xx': (r) => r.status < 500,
  });

  deptPublicFailures.add(!ok);
  sleep(0.2);
}

export function stressVerificarDenuncia() {
  const res = http.get(`${BASE_URL}/victimas/verificar-denuncia?codigoDenuncia=${encodeURIComponent(FIXED_CUD)}&cedulaIdentidad=${encodeURIComponent(FIXED_CI)}`, {
    headers: { Accept: 'application/json' },
    tags: { name: 'GET /victimas/verificar-denuncia' },
  });

  verificarDenunciaLatency.add(res.timings.duration);

  const ok = check(res, {
    'verificar-denuncia: status 2xx-4xx': (r) => r.status >= 200 && r.status < 500,
    'verificar-denuncia: no 5xx': (r) => r.status < 500,
  });

  verificarDenunciaFailures.add(!ok);
  sleep(0.2);
}

export function stressVerificarVictima() {
  const res = http.get(`${BASE_URL}/victimas/verificar?ci=${encodeURIComponent(FIXED_CI)}`, {
    headers: { Accept: 'application/json' },
    tags: { name: 'GET /victimas/verificar' },
  });

  verificarVictimaLatency.add(res.timings.duration);

  const ok = check(res, {
    'verificar-victima: status 2xx-4xx': (r) => r.status >= 200 && r.status < 500,
    'verificar-victima: no 5xx': (r) => r.status < 500,
  });

  verificarVictimaFailures.add(!ok);
  sleep(0.2);
}

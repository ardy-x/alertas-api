export interface InformacionErrorHttp {
  status?: number;
  mensaje: string;
  esErrorCliente: boolean;
  esErrorServidor: boolean;
}

function esErrorAxios(error: unknown): error is { response?: { status?: number; data?: { message?: string } }; message: string } {
  return typeof error === 'object' && error !== null && 'response' in error;
}

function traducirMensajeError(mensaje: string): string {
  if (mensaje.includes('timeout of') && mensaje.includes('exceeded')) {
    const match = mensaje.match(/timeout of (\d+)ms exceeded/);
    if (match) {
      return `tiempo de espera de ${match[1]}ms agotado`;
    }
  }
  if (mensaje.includes('ETIMEDOUT')) {
    return 'tiempo de conexión agotado';
  }
  if (mensaje.includes('ECONNREFUSED')) {
    return 'conexión rechazada por el servidor';
  }
  if (mensaje.includes('ENOTFOUND')) {
    return 'servidor no encontrado';
  }
  // Add more translations as needed
  return mensaje;
}

export function analizarErrorHttp(error: unknown): InformacionErrorHttp {
  if (esErrorAxios(error)) {
    const status = error.response?.status;
    const mensaje = traducirMensajeError(error.response?.data?.message || error.message || 'Error HTTP desconocido');

    return {
      status,
      mensaje,
      esErrorCliente: status ? status >= 400 && status < 500 : false,
      esErrorServidor: status ? status >= 500 : false,
    };
  }

  // Para errores no Axios
  return {
    mensaje: traducirMensajeError(error instanceof Error ? error.message : String(error)),
    esErrorCliente: false,
    esErrorServidor: false,
  };
}

export function esErrorNoEncontrado(error: unknown): boolean {
  const infoError = analizarErrorHttp(error);
  return infoError.status === 404;
}

export function esErrorTimeout(error: unknown): boolean {
  const infoError = analizarErrorHttp(error);
  return (
    infoError.mensaje.includes('timeout') ||
    infoError.mensaje.includes('ETIMEDOUT') ||
    infoError.mensaje.includes('tiempo de espera agotado') ||
    infoError.mensaje.includes('tiempo de conexión agotado')
  );
}

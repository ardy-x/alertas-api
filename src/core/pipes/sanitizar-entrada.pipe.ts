import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class SanitizarEntradaPipe implements PipeTransform {
  // Pipe global: sanea body/query/params antes de la validacion de DTO.
  transform(value: unknown, metadata: ArgumentMetadata): unknown {
    return this.sanitizarRecursivo(value, metadata.type || 'payload');
  }

  private sanitizarRecursivo(valor: unknown, ruta: string): unknown {
    if (this.esBuffer(valor) || this.esArchivoMulter(valor)) {
      return valor;
    }

    if (typeof valor === 'string') {
      return this.sanitizarString(valor, ruta);
    }

    if (Array.isArray(valor)) {
      return valor.map((item, index) => this.sanitizarRecursivo(item, `${ruta}[${index}]`));
    }

    if (valor && typeof valor === 'object') {
      const entrada = valor as Record<string, unknown>;
      const salida: Record<string, unknown> = {};

      for (const [clave, item] of Object.entries(entrada)) {
        const rutaClave = ruta ? `${ruta}.${clave}` : clave;
        salida[clave] = this.sanitizarRecursivo(item, rutaClave);
      }

      return salida;
    }

    return valor;
  }

  private esBuffer(valor: unknown): boolean {
    return Buffer.isBuffer(valor);
  }

  private esArchivoMulter(valor: unknown): boolean {
    if (!valor || typeof valor !== 'object') return false;

    const posibleArchivo = valor as Record<string, unknown>;
    return Buffer.isBuffer(posibleArchivo.buffer) && typeof posibleArchivo.originalname === 'string' && typeof posibleArchivo.mimetype === 'string';
  }

  private sanitizarString(texto: string, ruta: string): string {
    const textoLimpio = texto.trim();
    const esBody = ruta === 'body' || ruta.startsWith('body.');

    // En body se permiten comillas para texto libre; en query/params se mantiene mas estricto.
    const patronNoPermitido = esBody ? /[`;<>\\]/ : /['"`;<>\\]/;
    if (patronNoPermitido.test(textoLimpio)) {
      throw new BadRequestException(`Entrada invalida en ${ruta}: contiene caracteres no permitidos.`);
    }

    for (const caracter of textoLimpio) {
      const codigo = caracter.charCodeAt(0);
      if (codigo <= 8 || codigo === 11 || codigo === 12 || (codigo >= 14 && codigo <= 31) || codigo === 127) {
        throw new BadRequestException(`Entrada invalida en ${ruta}: contiene caracteres de control no permitidos.`);
      }
    }

    return textoLimpio;
  }
}

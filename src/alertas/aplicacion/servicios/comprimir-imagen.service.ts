import { existsSync, unlinkSync } from 'node:fs';
import { Injectable, Logger } from '@nestjs/common';
import * as sharp from 'sharp';

@Injectable()
export class ComprimirImagenService {
  private readonly logger = new Logger(ComprimirImagenService.name);

  /**
   * Comprime una imagen si es necesario
   * @param rutaArchivo Ruta del archivo original
   * @param mimetype Tipo MIME del archivo
   * @returns Ruta del archivo (original o comprimido)
   */
  async comprimirSiEsImagen(rutaArchivo: string, mimetype: string): Promise<string> {
    // Solo procesar imágenes
    if (!mimetype.startsWith('image/')) {
      return rutaArchivo;
    }

    try {
      const imagen = sharp(rutaArchivo);
      const metadata = await imagen.metadata();

      // Configuración de compresión
      const rutaComprimida = rutaArchivo.replace(/\.[^/.]+$/, '_compressed$&');

      await imagen
        .resize({
          width: 1920, // Máximo ancho (Full HD)
          height: 1080, // Máximo alto
          fit: 'inside', // Mantener aspect ratio
          withoutEnlargement: true, // No agrandar imágenes pequeñas
        })
        .jpeg({ quality: 85 }) // Convertir a JPEG con calidad 85%
        .toFile(rutaComprimida);

      // Obtener tamaños para comparar
      const metadataComprimida = await sharp(rutaComprimida).metadata();
      const tamanosComparados = {
        original: metadata.size || 0,
        comprimido: metadataComprimida.size || 0,
      };

      // Si la compresión redujo el tamaño, usar la imagen comprimida
      if (tamanosComparados.comprimido < tamanosComparados.original) {
        // Eliminar original
        if (existsSync(rutaArchivo)) {
          unlinkSync(rutaArchivo);
        }

        this.logger.log(`Imagen comprimida: ${(tamanosComparados.original / 1024).toFixed(2)}KB → ${(tamanosComparados.comprimido / 1024).toFixed(2)}KB`);

        return rutaComprimida;
      }

      // Si no mejoró, eliminar comprimida y usar original
      if (existsSync(rutaComprimida)) {
        unlinkSync(rutaComprimida);
      }

      return rutaArchivo;
    } catch (error) {
      this.logger.error(`Error al comprimir imagen: ${error}`);
      // Si falla, devolver el original
      return rutaArchivo;
    }
  }
}

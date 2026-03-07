import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { TipoEvidencia } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

import { ComprimirImagenService } from '@/alertas/aplicacion/servicios/comprimir-imagen.service';
import { AlertaRepositorioPort } from '@/alertas/dominio/puertos/alerta.port';
import { EvidenciaRepositorioPort } from '@/alertas/dominio/puertos/evidencia.port';
import { ALERTA_REPOSITORIO_TOKEN, EVIDENCIA_REPOSITORIO_TOKEN } from '@/alertas/dominio/tokens/alerta.tokens';

// Tipos MIME permitidos por categoría
const MIMETYPES_PERMITIDOS = {
  FOTO: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'],
  VIDEO: ['video/mp4', 'video/quicktime'], // mp4 y mov
  AUDIO: ['audio/mpeg', 'audio/mp3'], // mp3
  DOCUMENTO: ['application/pdf', 'text/csv'],
};

function validarYDetectarTipo(mimetype: string): TipoEvidencia {
  // Normalizar mimetype
  const mimetypeLower = mimetype.toLowerCase();

  // Verificar fotos
  if (MIMETYPES_PERMITIDOS.FOTO.includes(mimetypeLower)) {
    return TipoEvidencia.FOTO;
  }

  // Verificar videos
  if (MIMETYPES_PERMITIDOS.VIDEO.includes(mimetypeLower)) {
    return TipoEvidencia.VIDEO;
  }

  // Verificar audios
  if (MIMETYPES_PERMITIDOS.AUDIO.includes(mimetypeLower)) {
    return TipoEvidencia.AUDIO;
  }

  // Verificar documentos
  if (MIMETYPES_PERMITIDOS.DOCUMENTO.includes(mimetypeLower)) {
    return TipoEvidencia.DOCUMENTO;
  }

  // Si no coincide con ninguno, rechazar
  throw new BadRequestException(`Tipo de archivo no permitido: ${mimetype}. Tipos válidos: Fotos (JPG, PNG, WEBP), Videos (MP4, MOV), Audios (MP3), Documentos (PDF, CSV)`);
}

@Injectable()
export class SubirEvidenciaUseCase {
  private readonly logger = new Logger(SubirEvidenciaUseCase.name);

  constructor(
    @Inject(EVIDENCIA_REPOSITORIO_TOKEN)
    private readonly evidenciaRepo: EvidenciaRepositorioPort,
    @Inject(ALERTA_REPOSITORIO_TOKEN)
    private readonly alertaRepo: AlertaRepositorioPort,
    private readonly comprimirImagenService: ComprimirImagenService,
  ) {}

  async ejecutar(idAlerta: string, mimetype: string, rutaArchivo: string): Promise<void> {
    // 1. Validar que la alerta existe
    const alerta = await this.alertaRepo.obtenerAlertaSimple(idAlerta);
    if (!alerta) {
      throw new NotFoundException('Alerta no encontrada');
    }

    // 2. Validar y detectar tipo de evidencia
    const tipoEvidencia = validarYDetectarTipo(mimetype);

    // 3. Comprimir imagen si es necesario
    const rutaFinal = await this.comprimirImagenService.comprimirSiEsImagen(rutaArchivo, mimetype);

    // 4. Crear la evidencia
    const idEvidencia = uuidv4();
    await this.evidenciaRepo.crearEvidencia({
      id: idEvidencia,
      idAlerta: idAlerta,
      tipoEvidencia: tipoEvidencia,
      rutaArchivo: rutaFinal,
    });

    this.logger.log(`Evidencia ${idEvidencia} (${tipoEvidencia}) creada para alerta ${idAlerta}`);
  }
}

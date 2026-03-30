import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import { BadRequestException, Controller, Delete, Get, HttpStatus, Inject, Param, ParseUUIDPipe, Post, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { v4 as uuidv4 } from 'uuid';

import { EliminarEvidenciaUseCase } from '@/alertas/aplicacion/casos-uso/evidencias/eliminar-evidencia.use-case';
import { ListarEvidenciasUseCase } from '@/alertas/aplicacion/casos-uso/evidencias/listar-evidencias.use-case';
import { SubirEvidenciaUseCase } from '@/alertas/aplicacion/casos-uso/evidencias/subir-evidencia.use-case';
import { AlertaRepositorioPort } from '@/alertas/dominio/puertos/alerta.port';
import { ALERTA_REPOSITORIO_TOKEN } from '@/alertas/dominio/tokens/alerta.tokens';
import { RolesPermitidos } from '@/autenticacion/dominio/enums/roles-permitidos.enum';
import { Roles } from '@/autenticacion/infraestructura/decoradores/roles-permitidos.decorator';
import { KerberosJwtAuthGuard } from '@/autenticacion/infraestructura/guards/kerberos-jwt-auth.guard';
import { RolesGuard } from '@/autenticacion/infraestructura/guards/roles.guard';
import { ApiRespuestasComunes } from '@/core/decoradores/api-respuestas-comunes.decorator';
import { RespuestaBaseDto } from '@/core/dto/respuesta-base.dto';
import { RespuestaBuilder } from '@/core/utilidades/respuesta.builder';
import { VictimaRepositorioPort } from '@/victimas/dominio/puertos/victima.port';
import { VICTIMA_REPOSITORIO } from '@/victimas/dominio/tokens/victima.tokens';
import { ListarEvidenciasResponseDto } from '../dto/salida/evidencias-salida.dto';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

@ApiTags('ALERTAS WEB')
@ApiSecurity('jwt-auth')
@ApiRespuestasComunes()
@Controller('alertas-web')
@UseGuards(KerberosJwtAuthGuard, RolesGuard)
@Roles(RolesPermitidos.ADMINISTRADOR)
export class EvidenciasController {
  constructor(
    private readonly subirEvidenciaUseCase: SubirEvidenciaUseCase,
    private readonly listarEvidenciasUseCase: ListarEvidenciasUseCase,
    private readonly eliminarEvidenciaUseCase: EliminarEvidenciaUseCase,
    @Inject(ALERTA_REPOSITORIO_TOKEN)
    private readonly alertaRepositorio: AlertaRepositorioPort,
    @Inject(VICTIMA_REPOSITORIO)
    private readonly victimaRepositorio: VictimaRepositorioPort,
  ) {}

  @Post(':idAlerta/evidencias')
  @Roles(RolesPermitidos.ADMINISTRADOR, RolesPermitidos.OPERADOR, RolesPermitidos.INVESTIGADOR)
  @ApiOperation({ summary: 'Subir evidencias a una alerta (hasta 10 archivos).', description: 'Roles permitidos: ADMINISTRADOR, OPERADOR, INVESTIGADOR' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Evidencia(s) subida(s) exitosamente' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        archivos: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Archivos de evidencia: Fotos (JPG, PNG, WEBP, HEIC), Videos (MP4, MOV), Audios (MP3), Documentos (PDF, CSV)',
        },
      },
      required: ['archivos'],
    },
  })
  @UseInterceptors(
    FilesInterceptor('archivos', 10, {
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB por archivo
      },
      fileFilter: (_req, file, callback) => {
        // Validar tipos MIME permitidos
        const mimetypesPermitidos = [
          // Fotos
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp',
          'image/heic',
          'image/heif',
          // Videos
          'video/mp4',
          'video/quicktime',
          // Audios
          'audio/mpeg',
          'audio/mp3',
          // Documentos
          'application/pdf',
          'text/csv',
        ];

        if (mimetypesPermitidos.includes(file.mimetype.toLowerCase())) {
          callback(null, true);
        } else {
          callback(new BadRequestException(`Tipo de archivo no permitido: ${file.mimetype}`), false);
        }
      },
    }),
  )
  async subirEvidencia(@Param('idAlerta', ParseUUIDPipe) idAlerta: string, @UploadedFiles() archivos: MulterFile[]): Promise<RespuestaBaseDto> {
    if (!archivos || archivos.length === 0) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    // Obtener información de la alerta
    const alerta = await this.alertaRepositorio.obtenerAlertaSimple(idAlerta);
    if (!alerta || !alerta.idVictima) {
      throw new BadRequestException('Alerta no encontrada o no tiene víctima asociada');
    }

    // Obtener información de la víctima para obtener su cédula
    const victima = await this.victimaRepositorio.obtenerVictimaSimple(alerta.idVictima);
    if (!victima) {
      throw new BadRequestException('Víctima no encontrada');
    }

    // Crear estructura de carpetas: archivos/evidencias/{cedulaIdentidad}/{idAlerta}
    const baseDir = join(process.cwd(), 'archivos', 'evidencias', victima.cedulaIdentidad, idAlerta);
    if (!existsSync(baseDir)) {
      mkdirSync(baseDir, { recursive: true });
    }

    // Procesar cada archivo
    for (const archivo of archivos) {
      // Generar nombre único para el archivo
      const extension = extname(archivo.originalname);
      const nombreArchivo = `${uuidv4()}${extension}`;
      const rutaCompleta = join(baseDir, nombreArchivo);

      // Guardar el archivo en el sistema de archivos
      writeFileSync(rutaCompleta, archivo.buffer);

      // Ruta relativa desde la raíz del proyecto para guardar en BD
      const rutaRelativa = join('archivos', 'evidencias', victima.cedulaIdentidad, idAlerta, nombreArchivo);

      // Registrar en base de datos
      await this.subirEvidenciaUseCase.ejecutar(idAlerta, archivo.mimetype, rutaRelativa);
    }

    const cantidad = archivos.length;
    const mensaje = cantidad === 1 ? 'Evidencia subida exitosamente' : `${cantidad} evidencias subidas exitosamente`;

    return RespuestaBuilder.exito(HttpStatus.CREATED, mensaje);
  }

  @Get(':idAlerta/evidencias')
  @Roles(RolesPermitidos.ADMINISTRADOR, RolesPermitidos.OPERADOR, RolesPermitidos.INVESTIGADOR)
  @ApiOperation({ summary: 'Listar evidencias de una alerta', description: 'Roles permitidos: ADMINISTRADOR, OPERADOR, INVESTIGADOR' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Evidencias obtenidas exitosamente', type: ListarEvidenciasResponseDto })
  async listarEvidencias(@Param('idAlerta', ParseUUIDPipe) idAlerta: string): Promise<RespuestaBaseDto<ListarEvidenciasResponseDto>> {
    const resultado = await this.listarEvidenciasUseCase.ejecutar(idAlerta);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Evidencias obtenidas exitosamente', resultado);
  }
  @Delete(':idEvidencia/evidencia')
  @ApiOperation({ summary: 'Eliminar una evidencia', description: 'Rol permitido: ADMINISTRADOR' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Evidencia eliminada exitosamente' })
  async eliminarEvidencia(@Param('idEvidencia', ParseUUIDPipe) idEvidencia: string): Promise<RespuestaBaseDto> {
    await this.eliminarEvidenciaUseCase.ejecutar(idEvidencia);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Evidencia eliminada exitosamente');
  }
}

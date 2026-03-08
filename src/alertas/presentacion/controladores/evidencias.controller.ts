import { extname } from 'node:path';
import { BadRequestException, Controller, Delete, Get, HttpStatus, Param, ParseUUIDPipe, Post, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';

import { EliminarEvidenciaUseCase } from '@/alertas/aplicacion/casos-uso/evidencias/eliminar-evidencia.use-case';
import { ListarEvidenciasUseCase } from '@/alertas/aplicacion/casos-uso/evidencias/listar-evidencias.use-case';
import { SubirEvidenciaUseCase } from '@/alertas/aplicacion/casos-uso/evidencias/subir-evidencia.use-case';
import { RolesPermitidos } from '@/autenticacion/dominio/enums/roles-permitidos.enum';
import { Roles } from '@/autenticacion/infraestructura/decoradores/roles-permitidos.decorator';
import { KerberosJwtAuthGuard } from '@/autenticacion/infraestructura/guards/kerberos-jwt-auth.guard';
import { RolesGuard } from '@/autenticacion/infraestructura/guards/roles.guard';
import { RespuestaBaseDto } from '@/core/dto/respuesta-base.dto';
import { RespuestaBuilder } from '@/core/utilidades/respuesta.builder';
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
@Controller('alertas-web')
@UseGuards(KerberosJwtAuthGuard, RolesGuard)
@Roles(RolesPermitidos.ADMINISTRADOR)
export class EvidenciasController {
  constructor(
    private readonly subirEvidenciaUseCase: SubirEvidenciaUseCase,
    private readonly listarEvidenciasUseCase: ListarEvidenciasUseCase,
    private readonly eliminarEvidenciaUseCase: EliminarEvidenciaUseCase,
  ) {}

  @Post(':idAlerta/evidencias')
  @Roles(RolesPermitidos.OPERADOR, RolesPermitidos.INVESTIGADOR)
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
      storage: diskStorage({
        destination: './archivos/evidencias',
        filename: (_req, file, callback) => {
          const uniqueSuffix = `${uuidv4()}${extname(file.originalname)}`;
          callback(null, uniqueSuffix);
        },
      }),
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

    // Procesar cada archivo
    for (const archivo of archivos) {
      await this.subirEvidenciaUseCase.ejecutar(idAlerta, archivo.mimetype, archivo.path);
    }

    const cantidad = archivos.length;
    const mensaje = cantidad === 1 ? 'Evidencia subida exitosamente' : `${cantidad} evidencias subidas exitosamente`;

    return RespuestaBuilder.exito(HttpStatus.CREATED, mensaje);
  }

  @Get(':idAlerta/evidencias')
  @Roles(RolesPermitidos.OPERADOR, RolesPermitidos.INVESTIGADOR)
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

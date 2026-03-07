import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';
import { EvidenciaEntity } from '../../../dominio/entidades/evidencia.entity';
import { TipoEvidencia } from '../../../dominio/enums/evento-enums';
import { CrearEvidenciaDatos, EvidenciaRepositorioPort } from '../../../dominio/puertos/evidencia.port';

@Injectable()
export class EvidenciaPrismaAdapter implements EvidenciaRepositorioPort {
  constructor(private readonly prisma: PrismaService) {}

  async crearEvidencia(datos: CrearEvidenciaDatos): Promise<void> {
    await this.prisma.evidencia.create({
      data: {
        id: datos.id,
        idAlerta: datos.idAlerta,
        tipoEvidencia: datos.tipoEvidencia,
        rutaArchivo: datos.rutaArchivo,
      },
    });
  }

  async obtenerPorAlerta(idAlerta: string): Promise<EvidenciaEntity[]> {
    const evidencias = await this.prisma.evidencia.findMany({
      where: {
        idAlerta: idAlerta,
      },
      orderBy: { creadoEn: 'desc' },
    });

    return evidencias.map((evidencia) => ({
      id: evidencia.id,
      idAlerta: evidencia.idAlerta,
      tipoEvidencia: evidencia.tipoEvidencia as TipoEvidencia,
      rutaArchivo: evidencia.rutaArchivo,
      creadoEn: evidencia.creadoEn,
    }));
  }

  async eliminarEvidencia(id: string): Promise<void> {
    await this.prisma.evidencia.delete({
      where: { id },
    });
  }
}

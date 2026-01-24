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
        idEvento: datos.idEvento,
        tipoEvidencia: datos.tipoEvidencia,
        rutaArchivo: datos.rutaArchivo,
      },
    });
  }

  async obtenerPorEvento(idEvento: string): Promise<EvidenciaEntity[]> {
    const evidencias = await this.prisma.evidencia.findMany({
      where: {
        idEvento: idEvento,
      },
      orderBy: { creadoEn: 'desc' },
    });

    return evidencias.map((evidencia) => ({
      id: evidencia.id,
      idEvento: evidencia.idEvento,
      tipoEvidencia: evidencia.tipoEvidencia as TipoEvidencia,
      urlArchivo: evidencia.rutaArchivo,
      creadoEn: evidencia.creadoEn,
    }));
  }
}

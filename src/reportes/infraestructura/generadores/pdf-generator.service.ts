import * as path from 'node:path';
import { Injectable } from '@nestjs/common';

import PDFDocument = require('pdfkit');

export interface TablaColumna {
  header: string;
  width: number;
  align?: 'left' | 'center' | 'right';
}

export type MetadatoPar = [string, string | null | undefined, string, string | null | undefined];

const COLOR_HEADER_TABLA = '#52602b';
const COLOR_BORDE_HEADER = '#6b7a3a';
const COLOR_FILA_PAR = '#f5f7f0';
const COLOR_FILA_IMPAR = '#ffffff';
const COLOR_TEXTO_BLANCO = '#ffffff';
const COLOR_TEXTO_OSCURO = '#1a1a1a';
const COLOR_BORDE = '#aaaaaa';
const LOGO_PATH = path.join(process.cwd(), 'src/assets/logo-policia.jpeg');
const MARGIN = 35;

@Injectable()
export class PdfGeneratorService {
  crearDocumento(options?: { size?: string | [number, number]; layout?: 'portrait' | 'landscape' }): PDFKit.PDFDocument {
    // Por defecto: Oficio latinoamericano landscape: 8.5" × 13" = 612 × 936 pt
    return new PDFDocument({
      margin: MARGIN,
      size: options?.size || [612, 936],
      layout: options?.layout || 'landscape',
      autoFirstPage: true,
    });
  }

  /**
   * Encabezado al estilo de la imagen:
   * logo a la izquierda, título + subtitulo centrados
   */
  agregarEncabezado(doc: PDFKit.PDFDocument, titulo: string, subtitulo?: string, rangoFechas?: string): void {
    const logoSize = 50;
    const startY = MARGIN;

    // Logo con opacidad
    try {
      doc.opacity(0.5);
      doc.image(LOGO_PATH, MARGIN, startY - 10, { width: logoSize });
      doc.opacity(1);
    } catch {
      // si no encuentra el logo, continúa sin él
    }

    // Título centrado en toda la página
    const contentWidth = doc.page.width - MARGIN * 2;
    doc
      .font('Helvetica-Bold')
      .fontSize(16)
      .fillColor(COLOR_TEXTO_OSCURO)
      .text(titulo.toUpperCase(), MARGIN, startY + 10, { width: contentWidth, align: 'center' });

    if (subtitulo) {
      doc
        .font('Helvetica-Bold')
        .fontSize(12)
        .fillColor(COLOR_TEXTO_OSCURO)
        .text(subtitulo.toUpperCase(), MARGIN, startY + 30, { width: contentWidth, align: 'center' });
    }

    // Rango de fechas debajo del título
    if (rangoFechas) {
      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor(COLOR_TEXTO_OSCURO)
        .text(rangoFechas, MARGIN, subtitulo ? startY + 50 : startY + 35, { width: contentWidth, align: 'center' });
    }

    doc.y = startY + (rangoFechas ? 70 : subtitulo ? 50 : 35);
    doc.fillColor(COLOR_TEXTO_OSCURO);
  }

  /**
   * Metadatos como texto plano en dos columnas (DOCENTE: ... MATERIA: ...)
   * Cada elemento del array es [etiqueta1, valor1, etiqueta2, valor2]
   */
  agregarMetadatos(doc: PDFKit.PDFDocument, filas: MetadatoPar[]): void {
    const contentWidth = doc.page.width - MARGIN * 2;
    const col1Width = contentWidth * 0.55;

    filas.forEach(([label1, val1, label2, val2]) => {
      const y = doc.y;

      // Columna izquierda
      doc.font('Helvetica-Bold').fontSize(8).fillColor(COLOR_TEXTO_OSCURO).text(`${label1}: `, MARGIN, y, { continued: true, width: col1Width });
      doc.font('Helvetica').text(val1 ?? '—', { lineBreak: false });

      // Columna derecha (si existe)
      if (label2) {
        doc
          .font('Helvetica-Bold')
          .fontSize(8)
          .fillColor(COLOR_TEXTO_OSCURO)
          .text(`${label2}: `, MARGIN + col1Width, y, { continued: true, lineBreak: false });
        doc.font('Helvetica').text(val2 ?? '—', { lineBreak: false });
      }

      doc.y = y + 9;
    });

    doc.moveDown(0.3);
  }

  /**
   * Tabla con bordes completos en cada celda (grid), header oscuro
   */
  agregarTabla(doc: PDFKit.PDFDocument, columnas: TablaColumna[], filas: (string | null | undefined)[][]): void {
    const PADDING_V = 3;
    const FONT_SIZE = 8;
    const headerHeight = 16;
    const contentWidth = doc.page.width - MARGIN * 2;
    const specifiedTotal = columnas.reduce((sum, col) => sum + col.width, 0);
    const scale = contentWidth / specifiedTotal;
    const escaladas = columnas.map((col) => ({ ...col, width: Math.round(col.width * scale) }));
    const roundedTotal = escaladas.reduce((sum, col) => sum + col.width, 0);
    escaladas[escaladas.length - 1].width += contentWidth - roundedTotal;
    const tableX = MARGIN;

    const dibujarHeader = (y: number) => {
      // Fondo del header
      doc.rect(tableX, y, contentWidth, headerHeight).fill(COLOR_HEADER_TABLA);

      // Textos del header
      let x = tableX;
      escaladas.forEach((col) => {
        doc
          .fillColor(COLOR_TEXTO_BLANCO)
          .font('Helvetica-Bold')
          .fontSize(7.5)
          .text(col.header, x + 4, y + 4, { width: col.width - 8, align: col.align ?? 'center', lineBreak: false });
        x += col.width;
      });

      // Bordes del header
      doc.lineWidth(1).strokeColor(COLOR_BORDE_HEADER);
      doc.rect(tableX, y, contentWidth, headerHeight).stroke();

      // Líneas verticales del header
      x = tableX;
      escaladas.forEach((col, idx) => {
        x += col.width;
        if (idx < escaladas.length - 1) {
          doc
            .moveTo(x, y)
            .lineTo(x, y + headerHeight)
            .stroke();
        }
      });
    };

    // — Header —
    const headerY = doc.y;
    dibujarHeader(headerY);
    doc.y = headerY + headerHeight;

    // — Filas con altura dinámica —
    doc.font('Helvetica').fontSize(FONT_SIZE);
    filas.forEach((fila, rowIdx) => {
      // Calcular la altura real necesaria para esta fila
      const cellHeight = escaladas.map((col, colIdx) => {
        const texto = String(fila[colIdx] ?? '—');
        return doc.heightOfString(texto, { width: col.width - 8, lineBreak: true });
      });
      const rowHeight = Math.max(...cellHeight, 14) + PADDING_V * 2;

      // Salto de página solo si no cabe
      const bottomLimit = doc.page.height - MARGIN - 30;
      if (doc.y + rowHeight > bottomLimit) {
        doc.addPage();
        dibujarHeader(MARGIN);
        doc.y = MARGIN + headerHeight;
        doc.font('Helvetica').fontSize(FONT_SIZE);
      }

      const currentY = doc.y;
      const bgColor = rowIdx % 2 === 0 ? COLOR_FILA_PAR : COLOR_FILA_IMPAR;

      // Fondo de toda la fila
      doc.rect(tableX, currentY, contentWidth, rowHeight).fill(bgColor);

      // Textos de cada celda
      let x = tableX;
      escaladas.forEach((col, colIdx) => {
        const texto = String(fila[colIdx] ?? '—');
        const textHeight = doc.heightOfString(texto, { width: col.width - 8, lineBreak: true });
        const textY = currentY + (rowHeight - textHeight) / 2 + 1;

        doc
          .fillColor(COLOR_TEXTO_OSCURO)
          .font('Helvetica')
          .fontSize(FONT_SIZE)
          .text(texto, x + 4, textY, { width: col.width - 8, align: col.align ?? 'left' });
        x += col.width;
      });

      // Bordes de la fila
      doc.lineWidth(0.5).strokeColor(COLOR_BORDE);
      doc.rect(tableX, currentY, contentWidth, rowHeight).stroke();

      // Líneas verticales de la fila
      x = tableX;
      escaladas.forEach((col, idx) => {
        x += col.width;
        if (idx < escaladas.length - 1) {
          doc
            .moveTo(x, currentY)
            .lineTo(x, currentY + rowHeight)
            .stroke();
        }
      });

      doc.y = currentY + rowHeight;
    });
  }

  agregarSeccion(doc: PDFKit.PDFDocument, nombre: string): void {
    doc.moveDown(0.4);
    const y = doc.y;
    const seccionHeight = 24;
    const fontSize = 9;
    doc.rect(MARGIN, y, doc.page.width - MARGIN * 2, seccionHeight).fill(COLOR_HEADER_TABLA);

    const textY = y + (seccionHeight - fontSize) / 2 + 1;
    doc
      .fillColor(COLOR_TEXTO_BLANCO)
      .font('Helvetica-Bold')
      .fontSize(fontSize)
      .text(nombre.toUpperCase(), MARGIN + 6, textY, { width: doc.page.width - MARGIN * 2 - 12, lineBreak: false });
    doc.y = y + seccionHeight + 5;
    doc.fillColor(COLOR_TEXTO_OSCURO);
  }

  agregarSubtitulo(doc: PDFKit.PDFDocument, nombre: string): void {
    doc.moveDown(0.3);
    const y = doc.y;
    doc.font('Helvetica-Bold').fontSize(8).fillColor(COLOR_TEXTO_OSCURO).text(nombre.toUpperCase(), MARGIN, y, { lineBreak: false });
    doc.y = y + 11;
    doc.fillColor(COLOR_TEXTO_OSCURO);
  }

  agregarTextoDescriptivo(doc: PDFKit.PDFDocument, texto: string): void {
    doc.moveDown(0.5);
    const contentWidth = doc.page.width - MARGIN * 2;
    doc.fontSize(8.5).fillColor('#333333').font('Helvetica').text(texto, MARGIN, doc.y, { width: contentWidth, align: 'justify', lineGap: 2 });
    doc.moveDown(1);
    doc.fillColor(COLOR_TEXTO_OSCURO);
  }

  agregarSeparador(doc: PDFKit.PDFDocument): void {
    doc.moveDown(0.3);
    doc
      .moveTo(MARGIN, doc.y)
      .lineTo(doc.page.width - MARGIN, doc.y)
      .stroke(COLOR_BORDE);
    doc.moveDown(0.5);
  }

  agregarPieDePagina(doc: PDFKit.PDFDocument, numeroPagina: number = 1, totalPaginas: number = 1): void {
    const generadoEn = new Date().toLocaleString('es-BO', { timeZone: 'America/La_Paz' });
    const footerY = doc.page.height - MARGIN - 10;

    // Línea decorativa
    doc
      .moveTo(MARGIN, footerY - 8)
      .lineTo(doc.page.width - MARGIN, footerY - 8)
      .strokeColor(COLOR_BORDE)
      .lineWidth(0.5)
      .stroke();

    // Usar coordenadas absolutas sin afectar el flujo del documento
    doc.save();
    doc.fontSize(6.5).font('Helvetica').fillColor('#888888');

    // Texto izquierda
    doc.text(`Generado: ${generadoEn}`, MARGIN, footerY, {
      width: 200,
      lineBreak: false,
      align: 'left',
    });

    // Texto derecha
    const rightText = `Pág. ${numeroPagina} de ${totalPaginas}`;
    const rightTextWidth = doc.widthOfString(rightText);
    const rightX = doc.page.width - MARGIN - rightTextWidth;
    doc.text(rightText, rightX, footerY, {
      lineBreak: false,
    });

    doc.restore();
  }

  async finalizar(doc: PDFKit.PDFDocument): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      doc.end();
    });
  }
}

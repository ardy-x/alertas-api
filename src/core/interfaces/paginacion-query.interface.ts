export interface PaginacionQuery {
  pagina: number;
  elementosPorPagina: number;
  ordenarPor?: string;
  orden?: 'asc' | 'desc';
}

import { Injectable } from '@nestjs/common';

import { Unidad } from '../../dominio/entidades/unidades.entidad';
import { UnidadesPort } from '../../dominio/puertos/unidades.port';

@Injectable()
export class UnidadesEstaticasAdapter implements UnidadesPort {
  private unidades: Unidad[] = [
    {
      id: 1,
      unidad: 'Policía Nacional La Paz',
      direccion: 'Av. 16 de Julio 1490, La Paz',
      ubicacion: { latitud: -16.5, longitud: -68.15 },
      referencia: 'Centro de La Paz, cerca de la Plaza Murillo',
      departamento: 'La Paz',
      provincia: 'Murillo',
      municipio: 'La Paz',
      organismo: 'Policía Nacional',
    },
    {
      id: 2,
      unidad: 'Bomberos de Cochabamba',
      direccion: 'Av. Ayacucho 1234, Cochabamba',
      ubicacion: { latitud: -17.3895, longitud: -66.1568 },
      referencia: 'Centro de Cochabamba, cerca del Cristo de la Concordia',
      departamento: 'Cochabamba',
      provincia: 'Cercado',
      municipio: 'Cochabamba',
      organismo: 'Bomberos',
    },
    {
      id: 3,
      unidad: 'Policía Nacional Santa Cruz',
      direccion: 'Av. Cristóbal de Mendoza 123, Santa Cruz',
      ubicacion: { latitud: -17.7833, longitud: -63.1667 },
      referencia: 'Centro de Santa Cruz, Plaza 24 de Septiembre',
      departamento: 'Santa Cruz',
      provincia: 'Andrés Ibáñez',
      municipio: 'Santa Cruz de la Sierra',
      organismo: 'Policía Nacional',
    },
    {
      id: 4,
      unidad: 'Bomberos de Potosí',
      direccion: 'Calle Sucre 456, Potosí',
      ubicacion: { latitud: -19.5836, longitud: -65.7531 },
      referencia: 'Centro histórico de Potosí',
      departamento: 'Potosí',
      provincia: 'Tomás Frías',
      municipio: 'Potosí',
      organismo: 'Bomberos',
    },
    {
      id: 5,
      unidad: 'Policía Nacional Oruro',
      direccion: 'Plaza 10 de Febrero, Oruro',
      ubicacion: { latitud: -17.9667, longitud: -67.1167 },
      referencia: 'Centro de Oruro, cerca del Lago Poopó',
      departamento: 'Oruro',
      provincia: 'Cercado',
      municipio: 'Oruro',
      organismo: 'Policía Nacional',
    },
    {
      id: 6,
      unidad: 'Bomberos de Sucre',
      direccion: 'Calle Bolívar 789, Sucre',
      ubicacion: { latitud: -19.0333, longitud: -65.25 },
      referencia: 'Centro histórico de Sucre, capital constitucional',
      departamento: 'Chuquisaca',
      provincia: 'Oropeza',
      municipio: 'Sucre',
      organismo: 'Bomberos',
    },
    {
      id: 7,
      unidad: 'Policía Nacional Tarija',
      direccion: 'Av. Victor Paz Estenssoro 101, Tarija',
      ubicacion: { latitud: -21.5333, longitud: -64.7333 },
      referencia: 'Centro de Tarija, cerca del río Guadalquivir',
      departamento: 'Tarija',
      provincia: 'Cercado',
      municipio: 'Tarija',
      organismo: 'Policía Nacional',
    },
    {
      id: 8,
      unidad: 'Bomberos de Riberalta',
      direccion: 'Av. 9 de Febrero 202, Riberalta',
      ubicacion: { latitud: -11.0167, longitud: -66.0833 },
      referencia: 'Riberalta, capital del departamento del Beni',
      departamento: 'Beni',
      provincia: 'Vaca Díez',
      municipio: 'Riberalta',
      organismo: 'Bomberos',
    },
    {
      id: 9,
      unidad: 'Policía Nacional Cobija',
      direccion: 'Av. 9 de Febrero 303, Cobija',
      ubicacion: { latitud: -11.0333, longitud: -68.7667 },
      referencia: 'Centro de Cobija, capital del departamento de Pando',
      departamento: 'Pando',
      provincia: 'Nicolás Suárez',
      municipio: 'Cobija',
      organismo: 'Policía Nacional',
    },
  ];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  obtenerUnidadesCercanas(latitud: number, longitud: number): Promise<Unidad[]> {
    // Devolver todas las unidades, el caso de uso se encarga de ordenar y filtrar
    return Promise.resolve(this.unidades);
  }
}

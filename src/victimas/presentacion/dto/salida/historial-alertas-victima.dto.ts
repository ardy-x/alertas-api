import { ApiProperty } from '@nestjs/swagger';

export class AlertaVictimaDto {
  @ApiProperty({
    description: 'ID de la alerta',
    example: 'uuid-123',
  })
  idAlerta: string;

  @ApiProperty({
    description: 'Fecha y hora de la alerta',
    example: '2025-10-08T14:30:00Z',
  })
  fechaHora: Date;

  @ApiProperty({
    description: 'Estado de la alerta',
    example: 'RESUELTA',
  })
  estadoAlerta: string;

  @ApiProperty({
    description: 'Origen de la alerta',
    example: 'FELCV',
  })
  origen: string;

  @ApiProperty({
    description: 'Municipio donde ocurrió la alerta',
    example: 'La Paz',
  })
  municipio: string;

  @ApiProperty({
    description: 'Provincia donde ocurrió la alerta',
    example: 'Murillo',
  })
  provincia: string;

  @ApiProperty({
    description: 'Departamento donde ocurrió la alerta',
    example: 'La Paz',
  })
  departamento: string;

  @ApiProperty({
    description: 'Tiempo de asignación de funcionario (HH:MM:SS)',
    example: '00:03:45',
    nullable: true,
  })
  tiempoAsignacion: string | null;

  @ApiProperty({
    description: 'Tiempo hasta el cierre de la alerta (HH:MM:SS)',
    example: '01:25:30',
    nullable: true,
  })
  tiempoCierre: string | null;

  @ApiProperty({
    description: 'Fecha de creación del registro',
    example: '2025-10-08T14:30:12Z',
  })
  creadoEn: Date;
}

export class EstadisticasAlertasVictimaDto {
  @ApiProperty({
    description: 'Total de alertas de la víctima',
    example: 23,
  })
  totalAlertas: number;

  @ApiProperty({
    description: 'Alertas activas (PENDIENTE, ASIGNADA, EN_ATENCION)',
    example: 2,
  })
  alertasActivas: number;

  @ApiProperty({
    description: 'Alertas finalizadas (RESUELTA, CANCELADA, FALSA_ALERTA)',
    example: 21,
  })
  alertasFinalizadas: number;

  @ApiProperty({
    description: 'Tiempo promedio de asignación (HH:MM:SS)',
    example: '00:03:15',
  })
  tiempoPromedioAsignacion: string;

  @ApiProperty({
    description: 'Tiempo promedio de cierre (HH:MM:SS)',
    example: '01:22:30',
  })
  tiempoPromedioCierre: string;

  @ApiProperty({
    description: 'Cantidad de alertas por estado',
    example: {
      PENDIENTE: 1,
      ASIGNADA: 1,
      EN_ATENCION: 0,
      RESUELTA: 20,
      CANCELADA: 1,
      FALSA_ALERTA: 0,
    },
  })
  alertasPorEstado: { [estado: string]: number };
}

export class VictimaResumenDto {
  @ApiProperty({
    description: 'ID de la víctima',
    example: 'uuid-victima',
  })
  id: string;

  @ApiProperty({
    description: 'Nombre completo de la víctima',
    example: 'María García López',
  })
  nombreCompleto: string;

  @ApiProperty({
    description: 'Cédula de identidad',
    example: '12345678',
  })
  cedulaIdentidad: string;

  @ApiProperty({
    description: 'Fecha de nacimiento',
    example: '1990-01-15T00:00:00Z',
  })
  fechaNacimiento: Date;

  @ApiProperty({
    description: 'Número de celular',
    example: '70123456',
  })
  celular: string;

  @ApiProperty({
    description: 'Correo electrónico',
    required: false,
  })
  correo?: string;
}

export class HistorialAlertasVictimaDto {
  @ApiProperty({
    description: 'Información de la víctima',
    type: VictimaResumenDto,
  })
  victima: VictimaResumenDto;

  @ApiProperty({
    description: 'Estadísticas de alertas',
    type: EstadisticasAlertasVictimaDto,
  })
  estadisticas: EstadisticasAlertasVictimaDto;

  @ApiProperty({
    description: 'Listado de alertas',
    type: [AlertaVictimaDto],
  })
  alertas: AlertaVictimaDto[];
}

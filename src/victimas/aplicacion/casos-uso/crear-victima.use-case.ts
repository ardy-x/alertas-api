import { Inject, Injectable } from '@nestjs/common';

import { v4 as uuidv4 } from 'uuid';

import { TextoUtilidades } from '@/utils/texto-utilidades.util';
import { EstadoCuenta } from '@/victimas/dominio/enums/victima-enums';
import { ContactoEmergenciaRepositorioPort } from '@/victimas/dominio/puertos/contacto-emergencia.port';
import { VictimaRepositorioPort } from '@/victimas/dominio/puertos/victima.port';
import { VictimaValidacionDominioService } from '@/victimas/dominio/servicios/victima-validacion-dominio.service';
import { CONTACTO_EMERGENCIA_REPOSITORIO, VICTIMA_REPOSITORIO, VICTIMA_VALIDACION_DOMINIO_SERVICE } from '@/victimas/dominio/tokens/victima.tokens';

import { CrearVictimaRequestDto } from '../../presentacion/dto/entrada/victima.dto';

@Injectable()
export class CrearVictimaUseCase {
  constructor(
    @Inject(VICTIMA_REPOSITORIO)
    private readonly victimaRepositorio: VictimaRepositorioPort,
    @Inject(CONTACTO_EMERGENCIA_REPOSITORIO)
    private readonly contactoEmergenciaRepositorio: ContactoEmergenciaRepositorioPort,
    @Inject(VICTIMA_VALIDACION_DOMINIO_SERVICE)
    private readonly victimaValidacionDominio: VictimaValidacionDominioService,
  ) {}

  async ejecutar(entrada: CrearVictimaRequestDto): Promise<{ victima: { id: string } }> {
    // Validaciones de reglas de negocio usando servicio de dominio
    const fechaNacimiento = new Date(entrada.fechaNacimiento);
    await this.victimaValidacionDominio.validarCreacion(entrada.cedulaIdentidad.trim(), entrada.celular.trim(), entrada.contactosEmergencia);
    this.victimaValidacionDominio.validarFechaNacimiento(fechaNacimiento);

    // Crear víctima
    const datosVictima = {
      id: uuidv4(),
      cedulaIdentidad: entrada.cedulaIdentidad.trim(),
      nombreCompleto: TextoUtilidades.formatearNombreCompleto(entrada.nombreCompleto),
      celular: entrada.celular.trim(),
      idMunicipio: entrada.idMunicipio,
      fechaNacimiento,
      correo: entrada.correo?.trim(),
      direccionDomicilio: entrada.direccionDomicilio.trim(),
      puntoReferencia: entrada.puntoReferencia.trim(),
      estadoCuenta: EstadoCuenta.PENDIENTE_VERIFICACION,
    };

    const victima = await this.victimaRepositorio.crearVictima(datosVictima);

    // Crear contactos de emergencia directamente vinculados a la víctima
    for (const contactoData of entrada.contactosEmergencia) {
      await this.contactoEmergenciaRepositorio.crearContacto({
        id: uuidv4(),
        idVictima: victima.id,
        nombreCompleto: TextoUtilidades.formatearNombreCompleto(contactoData.nombreCompleto),
        celular: contactoData.celular.trim(),
        parentesco: TextoUtilidades.formatearNombreCompleto(contactoData.parentesco),
        principal: contactoData.principal,
      });
    }

    return {
      victima: {
        id: victima.id,
      },
    };
  }
}

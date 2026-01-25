import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { AlertaWebRepositorioPort } from '@/alertas/dominio/puertos/alerta-web.port';
import { DatosExternosAttRepositorioPort } from '@/alertas/dominio/puertos/datos-externos-att.port';
import { ALERTA_WEB_REPOSITORIO_TOKEN, DATOS_EXTERNOS_ATT_REPOSITORIO_TOKEN } from '@/alertas/dominio/tokens/alerta.tokens';
import { ObtenerProvinciaDepartamentoUseCase } from '@/integraciones/aplicacion/casos-uso/obtener-provincia-departamento.use-case';
import { PersonalPort } from '@/integraciones/dominio/puertos/personal.port';
import { PERSONAL_TOKEN } from '@/integraciones/dominio/tokens/integracion.tokens';
import { UsuarioWebKerberosRepositorioPort } from '@/usuarios-web/dominio/puertos/usuario-web-repositorio.port';
import { USUARIO_WEB_KERBEROS_REPOSITORIO_TOKEN } from '@/usuarios-web/dominio/tokens/usuario-web.tokens';

import { AlertaExtendida } from '../../dominio/entidades/alerta.entity';
import { OrigenAlerta } from '../../dominio/enums/alerta-enums';
import { AlertaDetalleDto } from '../../presentacion/dto/salida/alertas-salida.dto';

@Injectable()
export class ObtenerAlertaPorIdUseCase {
  constructor(
    @Inject(ALERTA_WEB_REPOSITORIO_TOKEN)
    private readonly alertaRepositorio: AlertaWebRepositorioPort,
    @Inject(DATOS_EXTERNOS_ATT_REPOSITORIO_TOKEN)
    private readonly datosExternosAttRepo: DatosExternosAttRepositorioPort,
    @Inject(USUARIO_WEB_KERBEROS_REPOSITORIO_TOKEN)
    private readonly usuarioWebPort: UsuarioWebKerberosRepositorioPort,
    @Inject(PERSONAL_TOKEN)
    private readonly PersonalPort: PersonalPort,
    private readonly obtenerProvinciaDepartamentoUseCase: ObtenerProvinciaDepartamentoUseCase,
  ) {}

  async ejecutar(idAlerta: string): Promise<{ alerta: AlertaDetalleDto }> {
    const alerta: AlertaExtendida | null = await this.alertaRepositorio.obtenerDetalleAlerta(idAlerta);

    if (!alerta) {
      throw new NotFoundException('Alerta no encontrada');
    }

    if (alerta.atencion?.atencionFuncionario) {
      for (const funcionario of alerta.atencion.atencionFuncionario) {
        if (!funcionario.ciFuncionario) continue;

        const funcionariosExternos = await this.PersonalPort.buscarFuncionario(funcionario.ciFuncionario);
        const datosExternos = funcionariosExternos?.[0];

        if (datosExternos) {
          funcionario.grado = datosExternos.grado ?? funcionario.grado;
          funcionario.nombreCompleto = datosExternos.nombreCompleto ?? funcionario.nombreCompleto;
        }
      }
    }

    if (alerta.atencion?.idUsuarioWeb) {
      const usuarioWeb = await this.usuarioWebPort.obtenerUsuarioWeb(alerta.atencion.idUsuarioWeb);
      if (usuarioWeb) {
        alerta.atencion.gradoUsuarioWeb = usuarioWeb.grado;
        alerta.atencion.nombreCompletoUsuarioWeb = usuarioWeb.nombreCompleto;
      }
    }

    // Si no hay víctima pero es de origen ATT, obtener datos desde el repositorio de ATT
    if (!alerta.victima && String(alerta.origen) === String(OrigenAlerta.ATT)) {
      const datosExternos = await this.datosExternosAttRepo.obtenerAlertaATT(idAlerta);
      if (datosExternos) {
        // Formatear como víctima en el mismo formato
        alerta.victima = {
          id: undefined,
          cedulaIdentidad: datosExternos.persona?.cedulaIdentidad,
          nombreCompleto: datosExternos.persona ? `${datosExternos.persona.nombres} ${datosExternos.persona.apellidos}` : undefined,
          celular: datosExternos.contacto?.celular,
          fechaNacimiento: datosExternos.persona?.fechaNacimiento ? new Date(datosExternos.persona.fechaNacimiento) : undefined,
          correo: datosExternos.contacto?.correo,
          direccionDomicilio: undefined,
          contactosEmergencia: undefined,
        };
      }
    }

    // Extraer idMunicipio soportando diversas formas (idMunicipio | id_municipio)
    const idMunicipio = alerta.idMunicipio ?? null;

    if (idMunicipio) {
      const resultado = await this.obtenerProvinciaDepartamentoUseCase.ejecutar(Number(idMunicipio));

      if (resultado) {
        // Insertar nombres planos en el objeto alerta
        alerta.municipio = resultado.municipio.municipio;
        alerta.provincia = resultado.provincia.provincia;
        alerta.departamento = resultado.departamento.departamento;
      }
    }

    return {
      alerta: alerta as AlertaDetalleDto,
    };
  }
}

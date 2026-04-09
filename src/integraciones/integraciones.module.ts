import { Global, Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { VictimasModule } from '@/victimas/victimas.module';
import { CoreModule } from '../core/core.module';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';
import { CachearDepartamentosUseCase } from './aplicacion/casos-uso/cachear-departamentos.use-case';
import { CachearMunicipiosGeoServerUseCase } from './aplicacion/casos-uso/cachear-geo-server.use-case';
import { EncontrarDepartamentoUseCase } from './aplicacion/casos-uso/encontrar-departamento.use-case';
import { ListarFuncionariosUseCase } from './aplicacion/casos-uso/listar-funcionarios.use-case';
import { ObtenerDepartamentosUseCase } from './aplicacion/casos-uso/obtener-departamentos.use-case';
import { ObtenerFuncionarioUseCase } from './aplicacion/casos-uso/obtener-funcionario.use-case';
import { ObtenerMunicipiosPorFiltroGeograficoUseCase } from './aplicacion/casos-uso/obtener-municipios-por-filtro-geografico.use-case';
import { ObtenerMunicipiosPorProvinciaUseCase } from './aplicacion/casos-uso/obtener-municipios-por-provincia.use-case';
import { ObtenerProvinciaDepartamentoUseCase } from './aplicacion/casos-uso/obtener-provincia-departamento.use-case';
import { ObtenerProvinciasPorDepartamentoUseCase } from './aplicacion/casos-uso/obtener-provincias-por-departamento.use-case';
import { ObtenerUnidadesCercanasUseCase } from './aplicacion/casos-uso/obtener-unidades-cercanas.use-case';
import { DEPARTAMENTOS_PORT_TOKEN, GEO_SERVER_TOKEN, LISTAR_FUNCIONARIOS_USE_CASE, OBTENER_FUNCIONARIO_USE_CASE, PERSONAL_TOKEN, UNIDADES_PORT_TOKEN } from './dominio/tokens/integracion.tokens';
import { CatalogoDepartamentosAdapter } from './infraestructura/adaptadores/catalogo-departamentos.adapter';
import { GeoServerAdapter } from './infraestructura/adaptadores/geo-server.adapter';
import { PersonalAdapter } from './infraestructura/adaptadores/personal.adapter';
import { UnidadesEstaticasAdapter } from './infraestructura/adaptadores/unidades-estaticas.adapter';
import { InicializacionService } from './infraestructura/servicios/inicializacion.service';
import { DepartamentosController } from './presentacion/controladores/departamentos.controller';
import { FuncionariosController } from './presentacion/controladores/funcionarios.controller';
import { UnidadesController } from './presentacion/controladores/unidades.controller';

@Global()
@Module({
  imports: [ScheduleModule.forRoot(), CoreModule, PrismaModule, RedisModule, VictimasModule],
  providers: [
    InicializacionService,
    {
      provide: DEPARTAMENTOS_PORT_TOKEN,
      useClass: CatalogoDepartamentosAdapter,
    },
    ObtenerDepartamentosUseCase,
    ObtenerProvinciasPorDepartamentoUseCase,
    ObtenerMunicipiosPorProvinciaUseCase,
    ObtenerProvinciaDepartamentoUseCase,
    ObtenerMunicipiosPorFiltroGeograficoUseCase,
    CachearMunicipiosGeoServerUseCase,
    CachearDepartamentosUseCase,
    EncontrarDepartamentoUseCase,
    {
      provide: GEO_SERVER_TOKEN,
      useClass: GeoServerAdapter,
    },
    {
      provide: UNIDADES_PORT_TOKEN,
      useClass: UnidadesEstaticasAdapter,
    },
    {
      provide: PERSONAL_TOKEN,
      useClass: PersonalAdapter,
    },
    {
      provide: OBTENER_FUNCIONARIO_USE_CASE,
      useClass: ObtenerFuncionarioUseCase,
    },
    {
      provide: LISTAR_FUNCIONARIOS_USE_CASE,
      useClass: ListarFuncionariosUseCase,
    },
    ObtenerUnidadesCercanasUseCase,
    ObtenerFuncionarioUseCase,
    ListarFuncionariosUseCase,
  ],
  controllers: [DepartamentosController, UnidadesController, FuncionariosController],
  exports: [
    ObtenerDepartamentosUseCase,
    ObtenerProvinciasPorDepartamentoUseCase,
    ObtenerMunicipiosPorProvinciaUseCase,
    ObtenerProvinciaDepartamentoUseCase,
    ObtenerMunicipiosPorFiltroGeograficoUseCase,
    CachearMunicipiosGeoServerUseCase,
    CachearDepartamentosUseCase,
    EncontrarDepartamentoUseCase,
    GEO_SERVER_TOKEN,
    ObtenerFuncionarioUseCase,
    PERSONAL_TOKEN,
    OBTENER_FUNCIONARIO_USE_CASE,
    LISTAR_FUNCIONARIOS_USE_CASE,
  ],
})
export class IntegracionesModule {}

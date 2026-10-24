-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "EstadoAlerta" AS ENUM ('PENDIENTE', 'ASIGNADA', 'EN_ATENCION', 'RESUELTA', 'CANCELADA', 'FALSA_ALERTA');

-- CreateEnum
CREATE TYPE "EstadoCuenta" AS ENUM ('ACTIVA', 'INACTIVA', 'SUSPENDIDA', 'PENDIENTE_VERIFICACION');

-- CreateEnum
CREATE TYPE "EstadoSolicitudCancelacion" AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA');

-- CreateEnum
CREATE TYPE "MotivoCierre" AS ENUM ('RESUELTA', 'CANCELADA', 'FALSA_ALERTA');

-- CreateEnum
CREATE TYPE "OrigenAlerta" AS ENUM ('ATT', 'FELCV');

-- CreateEnum
CREATE TYPE "RolAtencion" AS ENUM ('ENCARGADO', 'APOYO');

-- CreateEnum
CREATE TYPE "TipoEvidencia" AS ENUM ('AUDIO', 'VIDEO', 'FOTO', 'DOCUMENTO');

-- CreateEnum
CREATE TYPE "TipoEvento" AS ENUM ('ALERTA_RECIBIDA', 'ALERTA_ASIGNADA', 'CONTACTO_FAMILIARES', 'ATENCION_VICTIMA', 'ALERTA_CERRADA', 'ALERTA_CANCELADA', 'FALSA_ALERTA', 'SOLICITUD_CANCELACION');

-- CreateTable
CREATE TABLE "alertas" (
    "id" UUID NOT NULL,
    "id_victima" UUID,
    "id_municipio" INTEGER,
    "fecha_hora" TIMESTAMPTZ NOT NULL,
    "codigo_cud" VARCHAR(50),
    "codigo_registro" VARCHAR(50),
    "estado_alerta" "EstadoAlerta" NOT NULL DEFAULT 'PENDIENTE',
    "ubicacion" JSONB,
    "origen" "OrigenAlerta" NOT NULL DEFAULT 'FELCV',
    "datos_externos" JSONB,
    "creado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ,

    CONSTRAINT "alertas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atenciones" (
    "id" UUID NOT NULL,
    "id_alerta" UUID NOT NULL,
    "id_usuario_panel" UUID NOT NULL,
    "sigla_vehiculo" VARCHAR(20),
    "sigla_radio" VARCHAR(20),
    "creado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ,

    CONSTRAINT "atenciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atencion_funcionario" (
    "id" UUID NOT NULL,
    "id_atencion" UUID NOT NULL,
    "ci_funcionario" VARCHAR(20),
    "rol_atencion" "RolAtencion" NOT NULL DEFAULT 'ENCARGADO',
    "ubicacion" JSONB,
    "unidad" VARCHAR(255) NOT NULL,
    "turno_inicio" TIMESTAMPTZ NOT NULL,
    "turno_fin" TIMESTAMPTZ NOT NULL,
    "fecha_llegada" TIMESTAMPTZ,
    "confirmacion_victima" BOOLEAN NOT NULL DEFAULT false,
    "creado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ,

    CONSTRAINT "atencion_funcionario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cierre_alerta" (
    "id" UUID NOT NULL,
    "id_alerta" UUID NOT NULL,
    "id_usuario_panel" UUID NOT NULL,
    "fecha_hora" TIMESTAMPTZ NOT NULL,
    "estado_victima" VARCHAR(100) NOT NULL,
    "motivo_cierre" "MotivoCierre" NOT NULL DEFAULT 'RESUELTA',
    "observaciones" TEXT,
    "creado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cierre_alerta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cierre_alerta_agresores" (
    "id" UUID NOT NULL,
    "id_cierre_alerta" UUID NOT NULL,
    "cedula_identidad" VARCHAR(20) NOT NULL,
    "nombre_completo" VARCHAR(200) NOT NULL,
    "parentesco" VARCHAR(100),
    "creado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cierre_alerta_agresores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidencias" (
    "id" UUID NOT NULL,
    "id_alerta" UUID NOT NULL,
    "tipo_evidencia" "TipoEvidencia" NOT NULL DEFAULT 'FOTO',
    "ruta_archivo" VARCHAR(500) NOT NULL,
    "creado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evidencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventos" (
    "id" UUID NOT NULL,
    "id_alerta" UUID NOT NULL,
    "id_usuario_web" UUID,
    "ci_funcionario" VARCHAR(20),
    "tipo_evento" "TipoEvento" NOT NULL DEFAULT 'ALERTA_RECIBIDA',
    "fecha_hora" TIMESTAMPTZ NOT NULL,
    "ubicacion" JSONB,
    "creado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eventos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ruta_alerta" (
    "id" UUID NOT NULL,
    "id_alerta" UUID NOT NULL,
    "ruta" JSONB NOT NULL,
    "creado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ,

    CONSTRAINT "ruta_alerta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitudes_cancelacion" (
    "id" UUID NOT NULL,
    "id_alerta" UUID NOT NULL,
    "fecha_solicitud" TIMESTAMPTZ NOT NULL,
    "estado_solicitud" "EstadoSolicitudCancelacion" NOT NULL DEFAULT 'PENDIENTE',
    "id_usuario_web" UUID,
    "motivo_cancelacion" TEXT,
    "creado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "solicitudes_cancelacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "victimas" (
    "id" UUID NOT NULL,
    "nombre_completo" VARCHAR(200) NOT NULL,
    "correo" VARCHAR(255),
    "cedula_identidad" VARCHAR(20) NOT NULL,
    "celular" VARCHAR(15) NOT NULL,
    "fecha_nacimiento" DATE NOT NULL,
    "id_municipio" INTEGER NOT NULL,
    "direccion_domicilio" VARCHAR(500) NOT NULL,
    "punto_referencia" VARCHAR(255) NOT NULL,
    "estado_cuenta" "EstadoCuenta" NOT NULL DEFAULT 'PENDIENTE_VERIFICACION',
    "id_dispositivo" VARCHAR(255),
    "api_key" VARCHAR(64),
    "fcm_token" VARCHAR(255),
    "info_dispositivo" JSONB,
    "ultima_conexion" TIMESTAMPTZ,
    "permisos_app" JSONB,
    "creado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ,

    CONSTRAINT "victimas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contactos_emergencia" (
    "id" UUID NOT NULL,
    "idVictima" UUID NOT NULL,
    "nombre_completo" VARCHAR(200) NOT NULL,
    "celular" VARCHAR(15) NOT NULL,
    "parentesco" VARCHAR(50) NOT NULL,
    "principal" BOOLEAN NOT NULL DEFAULT false,
    "creado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ,

    CONSTRAINT "contactos_emergencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investigador_victima" (
    "id" UUID NOT NULL,
    "id_victima" UUID NOT NULL,
    "id_usuario_investigador" UUID NOT NULL,
    "id_usuario_asignador" UUID NOT NULL,
    "fecha_asignacion" TIMESTAMPTZ NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "observaciones" TEXT,
    "creado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ,

    CONSTRAINT "investigador_victima_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios_web_kerberos" (
    "id" UUID NOT NULL,
    "grado" VARCHAR(50) NOT NULL,
    "nombre_completo" VARCHAR(200) NOT NULL,
    "unidad" VARCHAR(255) NOT NULL,
    "id_departamento" INTEGER NOT NULL,
    "rol" VARCHAR(50) NOT NULL,
    "estado_session" BOOLEAN NOT NULL DEFAULT false,
    "fcm_token" VARCHAR(255),
    "info_dispositivo" JSONB,
    "actualizado_en" TIMESTAMPTZ,

    CONSTRAINT "usuarios_web_kerberos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "atenciones_id_alerta_key" ON "atenciones"("id_alerta");

-- CreateIndex
CREATE UNIQUE INDEX "atencion_funcionario_id_atencion_ci_funcionario_key" ON "atencion_funcionario"("id_atencion", "ci_funcionario");

-- CreateIndex
CREATE UNIQUE INDEX "cierre_alerta_id_alerta_key" ON "cierre_alerta"("id_alerta");

-- CreateIndex
CREATE UNIQUE INDEX "ruta_alerta_id_alerta_key" ON "ruta_alerta"("id_alerta");

-- CreateIndex
CREATE UNIQUE INDEX "solicitudes_cancelacion_id_alerta_key" ON "solicitudes_cancelacion"("id_alerta");

-- CreateIndex
CREATE UNIQUE INDEX "victimas_cedula_identidad_key" ON "victimas"("cedula_identidad");

-- CreateIndex
CREATE UNIQUE INDEX "victimas_celular_key" ON "victimas"("celular");

-- CreateIndex
CREATE UNIQUE INDEX "victimas_id_dispositivo_key" ON "victimas"("id_dispositivo");

-- CreateIndex
CREATE UNIQUE INDEX "victimas_api_key_key" ON "victimas"("api_key");

-- AddForeignKey
ALTER TABLE "alertas" ADD CONSTRAINT "alertas_id_victima_fkey" FOREIGN KEY ("id_victima") REFERENCES "victimas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atenciones" ADD CONSTRAINT "atenciones_id_alerta_fkey" FOREIGN KEY ("id_alerta") REFERENCES "alertas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atenciones" ADD CONSTRAINT "atenciones_id_usuario_panel_fkey" FOREIGN KEY ("id_usuario_panel") REFERENCES "usuarios_web_kerberos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atencion_funcionario" ADD CONSTRAINT "atencion_funcionario_id_atencion_fkey" FOREIGN KEY ("id_atencion") REFERENCES "atenciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cierre_alerta" ADD CONSTRAINT "cierre_alerta_id_alerta_fkey" FOREIGN KEY ("id_alerta") REFERENCES "alertas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cierre_alerta" ADD CONSTRAINT "cierre_alerta_id_usuario_panel_fkey" FOREIGN KEY ("id_usuario_panel") REFERENCES "usuarios_web_kerberos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cierre_alerta_agresores" ADD CONSTRAINT "cierre_alerta_agresores_id_cierre_alerta_fkey" FOREIGN KEY ("id_cierre_alerta") REFERENCES "cierre_alerta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidencias" ADD CONSTRAINT "evidencias_id_alerta_fkey" FOREIGN KEY ("id_alerta") REFERENCES "alertas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos" ADD CONSTRAINT "eventos_id_alerta_fkey" FOREIGN KEY ("id_alerta") REFERENCES "alertas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos" ADD CONSTRAINT "eventos_id_usuario_web_fkey" FOREIGN KEY ("id_usuario_web") REFERENCES "usuarios_web_kerberos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ruta_alerta" ADD CONSTRAINT "ruta_alerta_id_alerta_fkey" FOREIGN KEY ("id_alerta") REFERENCES "alertas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_cancelacion" ADD CONSTRAINT "solicitudes_cancelacion_id_alerta_fkey" FOREIGN KEY ("id_alerta") REFERENCES "alertas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_cancelacion" ADD CONSTRAINT "solicitudes_cancelacion_id_usuario_web_fkey" FOREIGN KEY ("id_usuario_web") REFERENCES "usuarios_web_kerberos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contactos_emergencia" ADD CONSTRAINT "contactos_emergencia_idVictima_fkey" FOREIGN KEY ("idVictima") REFERENCES "victimas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investigador_victima" ADD CONSTRAINT "investigador_victima_id_victima_fkey" FOREIGN KEY ("id_victima") REFERENCES "victimas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


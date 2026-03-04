import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';

import { AtencionRepositorioPort } from '@/alertas/dominio/puertos/atencion.port';
import { AtencionPersonalPort } from '@/alertas/dominio/puertos/atencion-funcionario.port';
import { ATENCION_FUNCIONARIO_REPOSITORIO_TOKEN, ATENCION_REPOSITORIO_TOKEN } from '@/alertas/dominio/tokens/alerta.tokens';

@Injectable()
export class ConfirmarLlegadaFuncionarioUseCase {
  constructor(
    @Inject(ATENCION_REPOSITORIO_TOKEN)
    private readonly atencionRepo: AtencionRepositorioPort,
    @Inject(ATENCION_FUNCIONARIO_REPOSITORIO_TOKEN)
    private readonly atencionFuncionarioRepo: AtencionPersonalPort,
  ) {}

  async ejecutar(idAlerta: string, ciFuncionario: string): Promise<void> {
    const atencion = await this.atencionRepo.obtenerPorAlerta(idAlerta);
    if (!atencion) {
      throw new NotFoundException('Atención no encontrada');
    }

    // verificar que el funcionario exista
    const funcionarios = await this.atencionFuncionarioRepo.obtenerPorAtencion(atencion.id);
    const funcion = funcionarios.find((f) => f.ciFuncionario === ciFuncionario);
    if (!funcion) {
      throw new NotFoundException('Funcionario no encontrado');
    }
    if (funcion.confirmacionVictima) {
      throw new ConflictException('Llegada ya confirmada por la víctima');
    }

    // marcar confirmación de la víctima
    await this.atencionFuncionarioRepo.confirmarLlegadaVictima(atencion.id, ciFuncionario);
  }
}

/// <reference types="jest" />

import { NotFoundException } from '@nestjs/common';
import { VerificarDenunciaUseCase } from '@/victimas/aplicacion/casos-uso/verificar-denuncia.use-case';

describe('Validación CI/CUD contra JUPITER', () => {
  it('consulta JUPITER y retorna los datos de la víctima', async () => {
    // Arrange: configurar el puerto externo simulado de consulta.
    const verificarDenunciaPort = {
      verificarDenuncia: jest.fn().mockResolvedValue({
        victima: {
          id: 'victima-1',
          cedulaIdentidad: '1234567',
        },
      }),
    };

    const useCase = new VerificarDenunciaUseCase(verificarDenunciaPort as never);

    // Act: ejecutar el caso de uso con código de denuncia y CI.
    const resultado = await useCase.ejecutar('CUD-001', '1234567');

    // Assert: validar invocación al puerto y respuesta de dominio.
    expect(verificarDenunciaPort.verificarDenuncia).toHaveBeenCalledWith('CUD-001', '1234567');
    expect(resultado).toEqual(
      expect.objectContaining({
        id: 'victima-1',
        cedulaIdentidad: '1234567',
      }),
    );
  });

  it('lanza NotFoundException cuando JUPITER no retorna victima', async () => {
    const verificarDenunciaPort = {
      verificarDenuncia: jest.fn().mockResolvedValue({ victima: null }),
    };

    const useCase = new VerificarDenunciaUseCase(verificarDenunciaPort as never);

    await expect(useCase.ejecutar('CUD-404', '1234567')).rejects.toBeInstanceOf(NotFoundException);
  });
});

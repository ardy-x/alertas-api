import { VictimaVerificada } from '../entidades/verificar-denuncia.entity';

export { VictimaVerificada };

export interface VerificarDenunciaPort {
  verificarDenuncia(codigoDenuncia: string, cedulaIdentidad: string): Promise<{ victima: VictimaVerificada | null }>;
}

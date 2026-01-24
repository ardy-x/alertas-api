import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { HttpConfig } from '../interfaces/http-config.interface';

@Injectable()
export class HttpClientPrivadoService {
  private readonly logger = new Logger(HttpClientPrivadoService.name);

  constructor(private readonly httpService: HttpService) {}

  async get<T>(url: string, token: string, config?: HttpConfig): Promise<T> {
    const headers = { ...config?.headers, Authorization: `Bearer ${token}` };
    try {
      const response = await firstValueFrom(this.httpService.get<T>(url, { ...config, headers }));
      return response.data;
    } catch (error) {
      this.logger.error(`Error en GET privado ${url}: ${error.message}`);
      throw error;
    }
  }

  async post<T>(url: string, token: string, data?: unknown, config?: HttpConfig): Promise<T> {
    const headers = { ...config?.headers, Authorization: `Bearer ${token}` };
    try {
      const response = await firstValueFrom(this.httpService.post<T>(url, data, { ...config, headers }));
      return response.data;
    } catch (error) {
      this.logger.error(`Error en POST privado ${url}: ${error.message}`);
      throw error;
    }
  }
}

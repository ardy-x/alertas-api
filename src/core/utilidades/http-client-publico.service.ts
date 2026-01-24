import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { HttpConfig } from '../interfaces/http-config.interface';

@Injectable()
export class HttpClientPublicoService {
  private readonly logger = new Logger(HttpClientPublicoService.name);

  constructor(private readonly httpService: HttpService) {}

  async get<T>(url: string, config?: HttpConfig): Promise<T> {
    try {
      const response = await firstValueFrom(this.httpService.get<T>(url, config));
      return response.data;
    } catch (error) {
      this.logger.error(`Error en GET público ${url}: ${error.message}`);
      throw error;
    }
  }

  async post<T>(url: string, data?: unknown, config?: HttpConfig): Promise<T> {
    try {
      const response = await firstValueFrom(this.httpService.post<T>(url, data, config));
      return response.data;
    } catch (error) {
      this.logger.error(`Error en POST público ${url}: ${error.message}`);
      throw error;
    }
  }
}

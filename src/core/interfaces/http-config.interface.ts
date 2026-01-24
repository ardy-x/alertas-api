export interface HttpConfig {
  headers?: Record<string, string>;
  timeout?: number;
  params?: Record<string, string | number | boolean>;
  // Add other properties as needed
}

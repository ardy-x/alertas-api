import type { NestJSReferenceConfiguration } from '@scalar/nestjs-api-reference';

export const SCALAR_CONFIG: NestJSReferenceConfiguration = {
  theme: 'moon',
  url: '/api-json',
  hideModels: true,
  hideClientButton: true,
  defaultOpenAllTags: false,
};

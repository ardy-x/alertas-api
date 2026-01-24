import { Test, TestingModule } from '@nestjs/testing';

import { AlertasGateway } from './alertas.gateway';

describe('EventsGateway', () => {
  let gateway: AlertasGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AlertasGateway],
    }).compile();

    gateway = module.get<AlertasGateway>(AlertasGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});

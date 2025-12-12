import { Test, TestingModule } from '@nestjs/testing';
import { EnviosController } from './envios.controller';
import { EnviosService } from './envios.service';

describe('EnviosController', () => {
  let controller: EnviosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EnviosController],
      providers: [EnviosService],
    }).compile();

    controller = module.get<EnviosController>(EnviosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

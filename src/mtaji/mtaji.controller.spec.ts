import { Test, TestingModule } from '@nestjs/testing';
import { MtajiController } from './mtaji.controller';

describe('MtajiController', () => {
  let controller: MtajiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MtajiController],
    }).compile();

    controller = module.get<MtajiController>(MtajiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

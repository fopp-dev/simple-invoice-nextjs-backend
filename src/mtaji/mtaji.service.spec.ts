import { Test, TestingModule } from '@nestjs/testing';
import { MtajiService } from './mtaji.service';

describe('MtajiService', () => {
  let service: MtajiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MtajiService],
    }).compile();

    service = module.get<MtajiService>(MtajiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

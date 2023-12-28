import { Test, TestingModule } from '@nestjs/testing';
import { MarkerController } from './marker.controller';

describe('MarkerController', () => {
  let controller: MarkerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MarkerController],
    }).compile();

    controller = module.get<MarkerController>(MarkerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

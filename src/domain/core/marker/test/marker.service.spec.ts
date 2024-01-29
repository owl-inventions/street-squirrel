import { Test, TestingModule } from '@nestjs/testing';
import { InnerMarkerService } from '../marker.service';

describe('FooService', () => {
  let service: InnerMarkerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InnerMarkerService],
    }).compile();

    service = module.get<InnerMarkerService>(InnerMarkerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { MarkerService } from '../marker.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PoiS } from '../../../../infrastructure/entities/PoiS';
import { InfrastructureModule } from '../../../../infrastructure/infrastructure.module';
import { Valhalla } from '@routingjs/valhalla';
import { ValhallaSearchAdapter } from '../../../../infrastructure/valhalla/valhalla-search-adapter.service';
import { InnerMarkerService } from '../../../../domain/core/marker/marker.service';
import { MarkerModule } from '../marker.module';
import { MarkerController } from '../marker.controller';
import { postgresConfiguration } from '../../../../infrastructure/databases/postgres.configuration';
import { ConfigModule } from '@nestjs/config';
import configuration from '../../../../infrastructure/configuration/configuration';

describe('MarkerService', () => {
  let service: MarkerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [configuration],
        }),
        postgresConfiguration(),
        TypeOrmModule.forFeature([PoiS]),
        InfrastructureModule,
        MarkerModule,
      ],
      controllers: [MarkerController],
      providers: [
        MarkerService,
        Valhalla,
        ValhallaSearchAdapter,
        InnerMarkerService,
      ],
    }).compile();

    service = module.get<MarkerService>(MarkerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

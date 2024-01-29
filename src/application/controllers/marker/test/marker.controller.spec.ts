import { Test, TestingModule } from '@nestjs/testing';
import { MarkerController } from '../marker.controller';
import { ConfigModule } from '@nestjs/config';
import configuration from '../../../../infrastructure/configuration/configuration';
import { postgresConfiguration } from '../../../../infrastructure/databases/postgres.configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PoiS } from '../../../../infrastructure/entities/PoiS';
import { InfrastructureModule } from '../../../../infrastructure/infrastructure.module';
import { MarkerModule } from '../marker.module';
import { MarkerService } from '../marker.service';
import { Valhalla } from '@routingjs/valhalla';
import { ValhallaSearchAdapter } from '../../../../infrastructure/valhalla/valhalla-search-adapter.service';
import { InnerMarkerService } from '../../../../domain/core/marker/marker.service';

describe('MarkerController', () => {
  let controller: MarkerController;

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

    controller = module.get<MarkerController>(MarkerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

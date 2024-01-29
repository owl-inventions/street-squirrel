import { Module } from '@nestjs/common';
import { MarkerController } from './marker.controller';
import { MarkerService } from './marker.service';
import { Valhalla } from '@routingjs/valhalla';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PoiS } from '../../../infrastructure/entities/PoiS';
import { ValhallaSearchAdapter } from '../../../infrastructure/valhalla/valhalla-search-adapter.service';
import { InfrastructureModule } from '../../../infrastructure/infrastructure.module';
import { InnerMarkerService } from '../../../domain/core/marker/marker.service';

@Module({
  imports: [TypeOrmModule.forFeature([PoiS]), InfrastructureModule],
  controllers: [MarkerController],
  providers: [
    MarkerService,
    Valhalla,
    ValhallaSearchAdapter,
    InnerMarkerService,
  ],
})
export class MarkerModule {}

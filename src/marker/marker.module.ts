import { Module } from '@nestjs/common';
import { MarkerController } from './marker.controller';
import { MarkerService } from './marker.service';
import { Valhalla } from '@routingjs/valhalla';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PoiS } from '../common/entities/PoiS';

@Module({
  imports: [TypeOrmModule.forFeature([PoiS])],
  controllers: [MarkerController],
  providers: [MarkerService, Valhalla],
})
export class MarkerModule {}

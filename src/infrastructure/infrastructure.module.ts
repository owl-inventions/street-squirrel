import { Module } from '@nestjs/common';
import { MarkerSearchAdapter } from './marker/marker-search-adapter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PoiS } from './entities/PoiS';
import { ValhallaSearchAdapter } from './valhalla/valhalla-search-adapter.service';
import { ConfigService } from '@nestjs/config';
import { Valhalla } from '@routingjs/valhalla';

/*
   This module is responsible for the infrastructure of the application. In details are this the data connectors
   to the database in terms of repositories and the database configuration itself like TypeORMModules.
*/

@Module({
  imports: [TypeOrmModule.forFeature([PoiS])],
  controllers: [],
  providers: [
    ConfigService,
    Valhalla,
    MarkerSearchAdapter,
    ValhallaSearchAdapter,
  ],
  exports: [MarkerSearchAdapter, ValhallaSearchAdapter],
})
export class InfrastructureModule {}

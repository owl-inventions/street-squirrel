import { Get, Injectable, Query } from '@nestjs/common';
import {
  GetPoiCoverageDto,
  GetPoiCoverageResponseDto,
  PoiCategory,
  PoiWithScore,
} from './dto/getPoiCoverage.dto';

import { Feature, Geometry, Point } from 'geojson';

import { InjectRepository } from '@nestjs/typeorm';
import { PoiS } from '../../../infrastructure/entities/PoiS';
import { Repository } from 'typeorm';
import { ValhallaSearchAdapter } from '../../../infrastructure/valhalla/valhalla-search-adapter.service';
import { ReachabilityAreas } from '../../../domain/model/marker/marker.types';
import { MarkerSearchAdapter } from '../../../infrastructure/marker/marker-search-adapter';
import { InnerMarkerService } from '../../../domain/core/marker/marker.service';

@Injectable()
export class MarkerService {
  constructor(
    private readonly innerMarkerService: InnerMarkerService,
    private readonly valhallaService: ValhallaSearchAdapter,
    @InjectRepository(PoiS) private readonly poiSRepository: Repository<PoiS>,
    private readonly markerSearchAdapter: MarkerSearchAdapter,
  ) {}

  @Get('poi-coverage')
  async getPoiCoverage(
    @Query() getPoiCoverageDto: GetPoiCoverageDto,
  ): Promise<GetPoiCoverageResponseDto> {
    const { lat, lng } = getPoiCoverageDto;
    const poiTypes: typeof PoiCategory = getPoiCoverageDto.poi;
    const center: Point = { type: 'Point', coordinates: [lat, lng] };
    const isochroneSlots: Array<number> = [5, 10, 15, 20, 25, 30]; // minutes

    // get isochrones by a given center and isochroneSlots in minutes
    const reachabilityAreas: ReachabilityAreas = {
      isochrones: await this.valhallaService.reachability(
        center,
        isochroneSlots,
        getPoiCoverageDto.transportation,
      ),
    };

    // map by type and list of points in Isochrones, limit by 3 of each type
    const poiByTypeInIsochrone: Map<
      string,
      Array<Feature<Geometry, { [p: string]: any }>>
    > = await this.markerSearchAdapter.getPoiSByIsochrones(
      reachabilityAreas.isochrones,
      poiTypes,
    );

    return this.innerMarkerService.getPoiCoverage(poiByTypeInIsochrone);
  }
}

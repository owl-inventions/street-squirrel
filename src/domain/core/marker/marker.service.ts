import { Injectable } from '@nestjs/common';
import {
  GetPoiCoverageResponseDto,
  PoiWithScore,
} from '../../../application/controllers/marker/dto/getPoiCoverage.dto';
import { Feature, Geometry } from 'geojson';

/*
    This is the marker service on domain layer (core),
    it applies some business logic and returns the result to the application layer.
 */

@Injectable()
export class InnerMarkerService {
  getPoiCoverage(
    poiByTypeInIsochrone: Map<
      string,
      Array<Feature<Geometry, { [p: string]: any }>>
    >,
  ): GetPoiCoverageResponseDto {
    const res: GetPoiCoverageResponseDto = {
      poiAverageReachability: [],
    };

    // calculate average reachability for each poi type
    poiByTypeInIsochrone.forEach((poiS, poiType) => {
      let sum = 0;
      poiS.forEach((poi) => {
        sum += poi.properties.isochrone;
      });
      const poiWithScore: PoiWithScore = {
        type: poiType,
        duration: Number((sum / poiS.length).toFixed(2)),
        unit: 'minutes',
        quantity: poiS.length,
      };
      res.poiAverageReachability.push(poiWithScore);
    });

    return res;
  }
}

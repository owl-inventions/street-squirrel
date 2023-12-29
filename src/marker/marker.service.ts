import { Body, Get, Injectable, Query } from '@nestjs/common';
import {
  GetPoiCoverageDto,
  GetPoiCoverageResponseDto,
  PoiCategory,
  PoiWithScore,
} from './dto/get-poi-coverage.dto/get-poi-coverage.dto';

import {
  Valhalla,
  ValhallaIsochroneOpts,
  ValhallaIsochroneResponse,
} from '@routingjs/valhalla';

import { Isochrones } from '@routingjs/core';
import { Feature, Geometry, Point } from 'geojson';

import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { PoiS } from '../common/entities/PoiS';
import { Repository } from 'typeorm';
import {
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { async } from 'rxjs';

@Injectable()
export class MarkerService {
  constructor(
    private readonly valhalla: Valhalla,
    private readonly configService: ConfigService,
    @InjectRepository(PoiS) private readonly poiSRepository: Repository<PoiS>,
  ) {
    this.valhalla = new Valhalla({
      baseUrl: this.configService.get<string>('valhalla.url'),
    });
  }

  @Get('poi-coverage')
  async getPoiCoverage(
    @Query() getPoiCoverageDto: GetPoiCoverageDto,
  ): Promise<GetPoiCoverageResponseDto> {
    const { lat, lng } = getPoiCoverageDto;
    const poiTypes: typeof PoiCategory = getPoiCoverageDto.poi;
    console.log(typeof poiTypes);
    const center: Point = { type: 'Point', coordinates: [lat, lng] };
    const isochroneSlots: Array<number> = [5, 10, 15, 20, 25, 30]; // minutes
    const isochrones: Array<
      Isochrones<
        ValhallaIsochroneResponse,
        Feature<Geometry, { [name: string]: any }>
      >
    > = [];
    for (const minutes of isochroneSlots) {
      isochrones.push(
        await this.valhalla
          .reachability(
            center.coordinates as [number, number],
            getPoiCoverageDto.transportation,
            [minutes].map((minutes) => minutes * 60),
            {
              polygons: true,
              intervalType: 'time', // time as minutes
            } as ValhallaIsochroneOpts,
            false,
          )
          .catch((error) => {
            console.log(error);
          })
          .then((result) => {
            if (result) {
              return result;
            }
          }),
      );
    }

    // map by type and list of points in Isochrones, limit by 3 of each type
    const poiByTypeInIsochrone: Map<
      string,
      Array<Feature<Geometry, { [p: string]: any }>>
    > = await this.getPoiSByIsochrones(isochrones, poiTypes);

    // mapping between osm_ids and routes
    // const osmIdsRoutes: Map<
    //   number,
    //   Array<Feature<Geometry, { [p: string]: any }>>
    // > = new Map();

    // poiTypes.forEach((poiType) => async () =>  {
    //   for (const poi of poiByTypeInIsochrone.get(poiType)) {
    //     await console.log(poi.geometry);
    //     if ('coordinates' in poi.geometry) {
    //       const distance = await this.valhalla.directions(
    //         [
    //           center.coordinates as [number, number],
    //           poi.geometry.coordinates as [number, number],
    //         ],
    //         getPoiCoverageDto.transportation,
    //         {} as ValhallaIsochroneOpts,
    //         true,
    //       );
    //       console.log(distance);
    //     }
    //     osmIdsRoutes.set(poi.properties.osm_id, []);
    //   }
    // });

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

  private async getPoiSByIsochrones(
    isochrones: Array<
      Isochrones<
        ValhallaIsochroneResponse,
        Feature<Geometry, { [p: string]: any }>
      >
    >,
    poiTypes: Array<string>,
  ): Promise<Map<string, Array<Feature>>> {
    const poiSAtIsochrones: Map<string, Array<Feature>> = new Map();
    console.log(typeof poiTypes);
    poiTypes.forEach((poiType) => {
      poiSAtIsochrones.set(poiType, []);
    });

    for (const isochrone of isochrones) {
      const lookForPois: Array<string> = poiTypes.filter((poiType) => {
        return poiSAtIsochrones.get(poiType).length < 3;
      });
      const osmIds: Array<number> = [];
      poiTypes.forEach((poiType) => {
        poiSAtIsochrones.get(poiType).forEach((poi) => {
          osmIds.push(poi.properties.osm_id);
        });
      });
      if (lookForPois.length === 0) {
        break;
      }
      await this.poiSRepository
        .createQueryBuilder('poi')
        .where('ST_Contains(ST_GeomFromGeoJSON(:geometry), poi.geometry)', {
          geometry: JSON.stringify(isochrone.raw.features[0].geometry),
        })
        .andWhere('poi.type IN (:...poiTypes)', { poiTypes: lookForPois })
        .andWhere('poi.osm_id NOT IN (:...osmIds)', {
          osmIds: osmIds.length > 1 ? osmIds : [0], // remove all pois already found
        })
        .getMany()
        .then((poiS: Array<PoiS>) => {
          lookForPois.forEach((poiType) => {
            poiSAtIsochrones.set(
              poiType,
              poiSAtIsochrones.get(poiType).concat(
                poiS
                  .filter((poi) => poi.type === poiType) // filter all PoiS by type
                  .map((poi) => {
                    // map to Feature
                    const feature: Feature = {
                      type: 'Feature',
                      geometry: {
                        type: 'Point',
                        coordinates: poi.geometry.coordinates,
                      },
                      properties: {
                        name: poi.name,
                        type: poi.type,
                        osm_id: poi.osm_id,
                        isochrone: isochrone.isochrones[0].interval / 60, // minutes
                      },
                    };
                    return feature;
                  })
                  .slice(
                    0,
                    3 - poiSAtIsochrones.get(poiType).length
                      ? 3 - poiSAtIsochrones.get(poiType).length
                      : 0,
                  ), // limit to 3
              ),
            );
          });
        });
    }

    return poiSAtIsochrones;
  }
}

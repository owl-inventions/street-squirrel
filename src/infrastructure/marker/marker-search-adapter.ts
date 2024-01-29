import { Injectable } from '@nestjs/common';
import { Feature } from 'geojson';
import { PoiS } from '../entities/PoiS';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReachabilityAreas } from '../../domain/model/marker/marker.types';

@Injectable()
export class MarkerSearchAdapter {
  constructor(
    @InjectRepository(PoiS) private readonly poiSRepository: Repository<PoiS>,
  ) {}
  async getPoiSByIsochrones(
    isochrones: ReachabilityAreas['isochrones'],
    poiTypes: Array<string>,
  ): Promise<Map<string, Array<Feature>>> {
    const poiSAtIsochrones: Map<string, Array<Feature>> = new Map();
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

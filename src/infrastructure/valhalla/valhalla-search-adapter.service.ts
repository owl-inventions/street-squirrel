import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Valhalla,
  ValhallaIsochroneOpts,
  ValhallaIsochroneResponse,
} from '@routingjs/valhalla';
import { Isochrones } from '@routingjs/core';
import { Feature, Geometry, Point } from 'geojson';
import { ValhallaCostingType } from '@routingjs/valhalla/dist/js/parameters';

@Injectable()
export class ValhallaSearchAdapter {
  constructor(
    private readonly valhalla: Valhalla,
    private readonly configService: ConfigService,
  ) {
    this.valhalla = new Valhalla({
      baseUrl: this.configService.get<string>('valhalla.url'),
    });
  }

  async reachability(
    center: Point,
    isochroneSlots: number[],
    transportMode:
      | 'auto'
      | 'bicycle'
      | 'pedestrian'
      | 'motorcycle'
      | 'transit'
      | 'truck',
  ): Promise<
    Array<
      Isochrones<
        ValhallaIsochroneResponse,
        Feature<Geometry, { [name: string]: any }>
      >
    >
  > {
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
            transportMode as ValhallaCostingType,
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
    return isochrones;
  }
}

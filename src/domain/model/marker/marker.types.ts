import { Isochrones } from '@routingjs/core';
import { ValhallaIsochroneResponse } from '@routingjs/valhalla';
import { Feature, Geometry } from 'geojson';

export type ReachabilityAreas = {
  isochrones: Array<
    Isochrones<
      ValhallaIsochroneResponse,
      Feature<Geometry, { [name: string]: any }>
    >
  >;
};

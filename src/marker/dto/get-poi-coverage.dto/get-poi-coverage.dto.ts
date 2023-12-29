import {
  IsArray,
  IsEnum,
  IsIn,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import {
  ApiBody,
  ApiProperty,
  ApiResponse,
  ApiResponseProperty,
} from '@nestjs/swagger';
import { ValhallaCostingType } from '@routingjs/valhalla/dist/js/parameters';

export enum TransportMode {
  Bicycle = 'bicycle',
  Auto = 'auto',
  Pedestrian = 'pedestrian',
}

export const PoiCategory: Array<string> = [
  'bakery',
  'beverages',
  'bus_stop',
  'cafe',
  'chemist',
  'cinema',
  'dentist',
  'doctors',
  'doityourself',
  'fire_station',
  'fitness_centre',
  'florist',
  'fuel',
  'health_food',
  'hospital',
  'kindergarten',
  'library',
  'marketplace',
  'optician',
  'parcel_locker',
  'pet',
  'pharmacy',
  'playground',
  'police',
  'pub',
  'restaurant',
  'school',
  'supermarket',
  'theatre',
  'townhall',
  'tram_stop',
  'university',
];

export class GetPoiCoverageDto {
  @ApiProperty({
    description: 'latitude of location',
    example: 54.08,
  })
  @IsLatitude()
  lat: number;
  @ApiProperty({
    description: 'longitude of location',
    example: 12.13,
  })
  @IsLongitude()
  lng: number;
  @ApiProperty({
    description: 'list of point of interests (at least two)',
    enum: PoiCategory,
    isArray: true,
    default: ['supermarket', 'pharmacy'],
  })
  @IsIn(PoiCategory, { each: true })
  @IsArray()
  poi: typeof PoiCategory;
  @ApiProperty({
    description: 'transportation mode',
    example: 'bicycle',
    default: 'bicycle',
    enum: TransportMode,
  })
  @IsEnum(TransportMode, { each: true })
  transportation: ValhallaCostingType;
}

export class PoiWithScore {
  @IsString()
  @IsNotEmpty()
  type: string;
  @IsNumber()
  @IsNotEmpty()
  duration: number;
  @IsString()
  @IsNotEmpty()
  unit: string;
  @IsNumber()
  quantity: number;
}

export class GetPoiCoverageResponseDto {
  @IsArray()
  @ApiResponseProperty({
    type: Array<PoiWithScore>,
    format: 'json',
    example: [
      {
        type: 'supermarket',
        avgDuration: 10,
        unit: 'minutes',
        quantity: 3,
      },
      {
        type: 'pharmacy',
        avgDuration: 15,
        unit: 'minutes',
        quantity: 2,
      },
    ],
  })
  poiAverageReachability: Array<PoiWithScore>;
}

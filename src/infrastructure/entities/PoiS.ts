import { Column, Entity, Index, PrimaryColumn } from 'typeorm';
import { Point } from 'geojson';

@Entity('osm_amenities')
export class PoiS {
  @PrimaryColumn({ type: 'bigint' })
  osm_id: number;
  @Column({ type: 'character varying' })
  name: string;
  @Column({ type: 'character varying' })
  type: string;
  @Index({ spatial: true })
  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  geometry: Point;
}

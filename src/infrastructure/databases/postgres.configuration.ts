import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { PoiS } from '../entities/PoiS';

export const postgresConfiguration = () => {
  return TypeOrmModule.forRootAsync({
    useFactory: (configService: ConfigService) => ({
      type: 'postgres',
      host: configService.get<string>('database.host'),
      port: +configService.get<number>('database.port'),
      username: configService.get<string>('database.username'),
      password: configService.get<string>('database.password'),
      database: configService.get<string>('database.database'),
      entities: [PoiS],
      autoLoadEntities: true,
      synchronize: false,
    }),
    inject: [ConfigService],
  });
};

import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MarkerModule } from './marker/marker.module';
import { LoggingMiddleware } from '../middleware/logging/logging.middleware';

import { postgresConfiguration } from '../../infrastructure/databases/postgres.configuration';
import configuration from '../../infrastructure/configuration/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    postgresConfiguration(),
    MarkerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}

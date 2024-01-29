import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/application/controllers/app.module';

describe('MarkerController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/marker/poi-coverage (GET)', () => {
    return request(app.getHttpServer())
      .get(
        '/marker/poi-coverage?lat=54.08&lng=12.13&poi=bakery&poi=cafe&transportation=bicycle',
      )
      .expect(200)
      .expect({
        poiAverageReachability: [
          {
            type: 'bakery',
            duration: 5,
            unit: 'minutes',
            quantity: 3,
          },
          {
            type: 'cafe',
            duration: 5,
            unit: 'minutes',
            quantity: 3,
          },
        ],
      });
  });
});

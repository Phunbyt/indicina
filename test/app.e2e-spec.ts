import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { UrlService } from '../src/modules/url/url.service';
import { Url } from '../src/schemas/url.schema';
import { AppConfigService } from '../src/common/config/app-config.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { afterEach } from 'node:test';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let service: UrlService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        AppConfigService,
        UrlService,
        {
          // Provider for the mongoose model
          provide: getModelToken(Url.name),
          useValue: Model,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    service = moduleFixture.get<UrlService>(UrlService);
  });

  it('/ (GET)', async () => {
    await request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('should return validation error for invalid url', async () => {
    const mockReq = {
      url: '/example',
      pepo: 'preooooo',
    };
    const res = await request(app.getHttpServer())
      .post('/encode')
      .send(mockReq)
      .set('Accept', 'application/json');

    const result = res.body;

    expect(result).toHaveProperty('message', [
      'url must be  valid and with domain name',
    ]);
    expect(result).toHaveProperty('error', 'Bad Request');
    expect(result).not.toHaveProperty('url');
  });

  it('should encode a URL', async () => {
    const mockReq = {
      url: 'https://example.com/long-url',
    };

    const res = await request(app.getHttpServer())
      .post('/encode')
      .send(mockReq)
      .set('Accept', 'application/json');

    const result = res.body;

    expect(result).toHaveProperty('message', 'Url successfully shortened');
    expect(result).toHaveProperty('url');
  });

  it('should not decode an invalid URL', async () => {
    const mockReq = {
      url: 'https://example.com/long-url',
    };

    const res = await request(app.getHttpServer())
      .post('/decode')
      .send(mockReq)
      .set('Accept', 'application/json');

    const result = res.body;

    expect(result).toHaveProperty('message', 'Invalid url provided');
    expect(result).toHaveProperty('error', 'Bad Request');
  });

  it('should decrypt a valid URL', async () => {
    // Mock data
    const mockUrl = 'http://localhost:3000/abcdef';
    const mockUrlId = 'abcdef';
    const mockExistingUrl: Url = {
      urlId: 'qwerty',
      encryptedDek: 'ejnejwnrje',
      encryptedDekIV: 'dsnfnskfds',
      encryptedData: {},
      visits: 6,
      decryptCount: 5,
      lastVisit: 'fwfeefe',
    };
    const mockDecryptedUrl = {
      url: 'https://example.com/long-url',
    };

    // Mock service methods
    jest.spyOn(service, 'findUrlByUrlId').mockResolvedValue(mockExistingUrl);
    jest.spyOn(service, 'decryptUrlData').mockResolvedValue(mockDecryptedUrl);
    jest.spyOn(service, 'updateUrl').mockResolvedValueOnce(); // Mock the update

    // Execute the decode method
    const result = await service.decode({ url: mockUrl });

    // Assertions
    expect(result.message).toBe('Url successfully decrypted');
    expect(result.url).toBe(mockDecryptedUrl.url);

    // Verify method calls
    expect(service.findUrlByUrlId).toHaveBeenCalledWith(mockUrlId);
    expect(service.decryptUrlData).toHaveBeenCalledWith(mockExistingUrl);
    expect(service.updateUrl).toHaveBeenCalledWith(mockUrlId, {
      $set: { decryptCount: mockExistingUrl.decryptCount + 1 },
    });
  });

  it('should throw an error if URL is not found', async () => {
    // Mock data
    const mockUrlPath = '/abcdef';

    // Mock findUrlByUrlId to return null (simulating not found scenario)
    jest.spyOn(service, 'findUrlByUrlId').mockResolvedValue(null);

    // Mock response object (express.Response)
    const mockResponse = {
      redirect: jest.fn(), // Mocking the redirect function
    };

    // Execute and assert exception
    await expect(service.record(mockUrlPath, mockResponse)).rejects.toThrow();
  });

  it('should record visit and redirect to decrypted URL', async () => {
    // Mock data
    const mockUrlPath = '/abcdef';
    const mockUrlId = 'abcdef';
    const mockExistingUrl: Url = {
      urlId: 'qwerty',
      encryptedDek: 'ejnejwnrje',
      encryptedDekIV: 'dsnfnskfds',
      encryptedData: {},
      visits: 6,
      decryptCount: 5,
      lastVisit: 'fwfeefe',
    };
    const mockDecryptedUrl = {
      url: 'https://example.com/original-url',
    };

    // Mock dependencies
    jest.spyOn(service, 'findUrlByUrlId').mockResolvedValue(mockExistingUrl);
    jest.spyOn(service, 'decryptUrlData').mockResolvedValue(mockDecryptedUrl);
    jest.spyOn(service, 'updateUrl').mockResolvedValue(undefined);

    // Mock response object (express.Response)
    const mockResponse = {
      redirect: jest.fn(), // Mocking the redirect function
    };

    // Execute the record method
    await service.record(mockUrlPath, mockResponse);

    // Assertions
    expect(service.findUrlByUrlId).toHaveBeenCalledWith(mockUrlId);
    expect(service.decryptUrlData).toHaveBeenCalledWith(mockExistingUrl);
    expect(service.updateUrl).toHaveBeenCalledWith(mockUrlId, {
      $set: {
        visits: mockExistingUrl.visits + 1,
        lastVisit: expect.any(Date), // Checking if lastVisit is set to a Date object
      },
    });
    expect(mockResponse.redirect).toHaveBeenCalledWith(mockDecryptedUrl.url);
  });

  it('should return stats for a valid URL', async () => {
    // Mock data
    const mockUrlPath = '/abcdef';

    const mockExistingUrl: Url = {
      encryptedDek: 'ejnejwnrje',
      encryptedDekIV: 'dsnfnskfds',
      encryptedData: {},
      urlId: 'abcdef',
      visits: 10,
      decryptCount: 5,
      lastVisit: `${new Date('2023-01-01')}`,
    };

    // Mock findUrlByUrlId to return the existingUrl
    jest.spyOn(service, 'findUrlByUrlId').mockResolvedValue(mockExistingUrl);

    // Execute the stats method
    const result = await service.stats(mockUrlPath);

    // Assertions
    expect(result.id).toBe(mockExistingUrl.urlId);
    expect(result.visits).toBe(mockExistingUrl.visits);
    expect(result.decryptCount).toBe(mockExistingUrl.decryptCount);
    expect(result.lastVisit).toEqual(mockExistingUrl.lastVisit);
  });

  it('should throw BadRequestException for an invalid URL', async () => {
    // Mock data
    const mockUrlPath = '/invalidurl';

    // Mock findUrlByUrlId to return null (simulating not found scenario)
    jest.spyOn(service, 'findUrlByUrlId').mockResolvedValue(null);

    // Execute and assert exception
    await expect(service.stats(mockUrlPath)).rejects.toThrow(
      BadRequestException,
    );
  });

  afterAll(async () => {
    await app.close();
  });

  // global.afterAll(async () => {
  //   await app.close();
  // });
});

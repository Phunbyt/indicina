import { Test, TestingModule } from '@nestjs/testing';
import { UrlService } from './url.service';
import { Url } from '../../schemas/url.schema';
import { Model } from 'mongoose';
import { AppConfigModule } from '../../common/config/app-config.module';
import { getModelToken } from '@nestjs/mongoose';
import { AppConfigService } from '../../common/config/app-config.service';

describe('UrlService', () => {
  let service: UrlService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppConfigModule],

      providers: [
        UrlService,
        Url,
        AppConfigService,
        {
          // Provider for the mongoose model
          provide: getModelToken(Url.name),
          useValue: Model,
        },
      ],
    }).compile();

    service = module.get<UrlService>(UrlService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

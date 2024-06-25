import { Test, TestingModule } from '@nestjs/testing';
import { UrlController } from './url.controller';
import { UrlService } from './url.service';
import { getModelToken } from '@nestjs/mongoose';
import { AppConfigModule } from '../../common/config/app-config.module';
import { Url } from '../../schemas/url.schema';
import { Model } from 'mongoose';

describe('UrlController', () => {
  let controller: UrlController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlController,
        UrlService,
        {
          // Provider for the mongoose model
          provide: getModelToken(Url.name),
          useValue: Model,
        },
      ],
      imports: [AppConfigModule],
    }).compile();

    controller = module.get<UrlController>(UrlController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

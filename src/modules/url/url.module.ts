import { Module } from '@nestjs/common';
import { UrlService } from './url.service';
import { UrlController } from './url.controller';
import { AppConfigModule } from '../../common/config/app-config.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Url, UrlSchema } from '../../schemas/url.schema';

@Module({
  controllers: [UrlController],
  providers: [UrlService],
  imports: [
    AppConfigModule,
    MongooseModule.forFeature([{ name: Url.name, schema: UrlSchema }]),
  ],
})
export class UrlModule {}

import * as Joi from 'joi';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config from '../constants/envs';
import { AppConfigService } from './app-config.service';
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      validationSchema: Joi.object({
        APP_ENV: Joi.string()
          .valid('dev', 'stage', 'test', 'prod', 'production', 'development')
          .default('dev'),
        APP_NAME: Joi.string().default('indicina'),
        APP_PORT: Joi.number().default('3000'),
      }),
    }),
  ],
  providers: [ConfigService, AppConfigService],
  exports: [ConfigService, AppConfigService],
})
export class AppConfigModule {}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UrlModule } from './modules/url/url.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppConfigModule } from './common/config/app-config.module';
import { AppConfigService } from './common/config/app-config.service';

@Module({
  imports: [
    UrlModule,
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [AppConfigModule], // Import ConfigModule to use ConfigService
      inject: [AppConfigService], // Inject ConfigService into the factory function
      useFactory: async (configService: AppConfigService) => ({
        uri: configService.dbUri, // Use ConfigService to get MongoDB URI
      }),
    }),
    AppConfigModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

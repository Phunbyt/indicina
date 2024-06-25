import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {
    this.configService = configService;
  }

  public get env(): string {
    return this.configService.get<string>('app.env');
  }

  public get name(): string {
    return this.configService.get<string>('app.name');
  }

  public get port(): number {
    return this.configService.get<number>('app.port');
  }

  public get dbUri(): string {
    return this.configService.get<string>('app.dbUri');
  }

  public get encryptionMasterKey(): string {
    return this.configService.get<string>('app.encryptionMasterKey');
  }
}

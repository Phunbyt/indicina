import { Injectable } from '@nestjs/common';
import { EncodeUrlDto } from './dto/encode-url.dto';
import { AppConfigService } from 'src/common/config/app-config.service';
import {
  encryptData,
  encryptDataEncryptionKey,
  generateDataEncryptionKey,
} from 'src/helpers/encyption.helper';
import { generateRandomString } from 'src/helpers/url-id.helper';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Url } from 'src/schemas/url.schema';

@Injectable()
export class UrlService {
  constructor(
    private appConfigService: AppConfigService,
    @InjectModel(Url.name)
    private readonly urlModel: Model<Url>,
  ) {}
  async encode(encodeUrlDto: EncodeUrlDto) {
    const masterKey = this.appConfigService.encryptionMasterKey;
    const baseUrl = this.appConfigService.baseUrl;
    const dek = generateDataEncryptionKey();

    const encryptedDek = encryptDataEncryptionKey(dek, masterKey);

    const urlId = generateRandomString(6);

    const jsonData = JSON.stringify(encodeUrlDto);

    const encryptedData = encryptData(jsonData, encryptedDek.iv);

    await this.urlModel.create({
      urlId,
      encryptedData,
      encryptedDek: encryptedDek.encryptedDek,
      encryptedDekIV: encryptedDek.iv,
    });

    return {
      message: 'Url successfully shortend',
      link: `${baseUrl}/${urlId}`,
    };
  }

  decode() {
    return `This action returns all url`;
  }

  record(id: string) {
    return `This action returns a #${id} url`;
  }

  stats(id: string) {
    return `This action returns a #${id} url`;
  }
}

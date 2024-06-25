import { BadRequestException, Injectable } from '@nestjs/common';
import { DecodeUrlDto, EncodeUrlDto } from './dto/encode-url.dto';
import { AppConfigService } from 'src/common/config/app-config.service';
import {
  decryptData,
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
      url: `${baseUrl}/${urlId}`,
    };
  }

  async decode(decodeUrlDto: DecodeUrlDto) {
    const { url } = decodeUrlDto;
    const lastSixStrings = url.slice(-6);

    const existingUrl = await this.urlModel.findOne({
      urlId: lastSixStrings,
    });

    if (!existingUrl) {
      throw new BadRequestException('Invalid url provided');
    }

    const decryptedData = decryptData(
      existingUrl.encryptedData.encryptedData,
      existingUrl.encryptedDekIV,
      existingUrl.encryptedData.iv,
    );

    const decryptedUrl = JSON.parse(decryptedData);

    await this.urlModel.updateOne(
      {
        urlId: lastSixStrings,
      },
      {
        $set: {
          decryptCount: (existingUrl.decryptCount += 1),
        },
      },
    );

    return {
      message: 'Url successfully decrypted',
      url: decryptedUrl.url,
    };
  }

  async record(url_path: string, res) {
    const url = url_path;
    const lastSixStrings = url.slice(-6);

    const existingUrl = await this.urlModel.findOne({
      urlId: lastSixStrings,
    });

    if (!existingUrl) {
      throw new BadRequestException('Invalid url provided');
    }

    const decryptedData = decryptData(
      existingUrl.encryptedData.encryptedData,
      existingUrl.encryptedDekIV,
      existingUrl.encryptedData.iv,
    );

    const decryptedUrl = JSON.parse(decryptedData);

    await this.urlModel.updateOne(
      {
        urlId: lastSixStrings,
      },
      {
        $set: {
          visits: (existingUrl.visits += 1),
          lastVisit: new Date(),
        },
      },
    );

    return res.redirect(decryptedUrl.url);
  }

  async stats(url_path: string) {
    const url = url_path;
    const lastSixStrings = url.slice(-6);

    const existingUrl = await this.urlModel
      .findOne({
        urlId: lastSixStrings,
      })
      .select(['urlId', 'visits', 'decryptCount', 'lastVisit']);

    if (!existingUrl) {
      throw new BadRequestException('Invalid url provided');
    }
    return existingUrl;
  }
}

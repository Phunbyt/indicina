import { BadRequestException, Injectable } from '@nestjs/common';
import { DecodeUrlDto, EncodeUrlDto } from './dto/encode-url.dto';
import { AppConfigService } from '../../common/config/app-config.service';
import {
  decryptData,
  encryptData,
  encryptDataEncryptionKey,
  generateDataEncryptionKey,
} from '../../helpers/encyption.helper';
import { generateRandomString } from '../../helpers/url-id.helper';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Url } from '../../schemas/url.schema';

@Injectable()
export class UrlService {
  constructor(
    private appConfigService: AppConfigService,
    @InjectModel(Url.name)
    private readonly urlModel: Model<Url>,
  ) {}
  async encode(encodeUrlDto: EncodeUrlDto) {
    const { baseUrl, encryptionMasterKey: masterKey } = this.appConfigService;

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
      message: 'Url successfully shortened',
      url: `${baseUrl}/${urlId}`,
    };
  }

  async decode(decodeUrlDto: DecodeUrlDto) {
    const { baseUrl } = this.appConfigService;

    const { url } = decodeUrlDto;
    const urlId = url.slice(-6);
    const urlDomain = url.slice(0, -7);

    if (baseUrl !== urlDomain) {
      throw new BadRequestException(`Invalid url provided`);
    }

    const existingUrl = await this.findUrlByUrlId(urlId);

    const decryptedUrl = await this.decryptUrlData(existingUrl);

    await this.updateUrl(urlId, {
      $set: { decryptCount: existingUrl.decryptCount + 1 },
    });

    return {
      message: 'Url successfully decrypted',
      url: decryptedUrl.url,
    };
  }

  async record(url_path: string, res: any) {
    const urlId = url_path.slice(-6);

    const existingUrl = await this.findUrlByUrlId(urlId);

    const decryptedUrl = await this.decryptUrlData(existingUrl);

    await this.updateUrl(urlId, {
      $set: {
        visits: existingUrl.visits + 1,
        lastVisit: new Date(),
      },
    });

    return res.redirect(decryptedUrl.url);
  }

  async stats(url_path: string) {
    const urlId = url_path.slice(-6);

    const existingUrl = await this.findUrlByUrlId(urlId);

    if (!existingUrl) {
      throw new BadRequestException('Invalid url provided');
    }

    const { urlId: id, visits, decryptCount, lastVisit } = existingUrl;

    return { id, visits, decryptCount, lastVisit };
  }

  public async findUrlByUrlId(urlId: string): Promise<Url | null> {
    const data = this.urlModel.findOne({ urlId });

    if (!data) {
      throw new BadRequestException('Invalid url provided');
    }
    return data;
  }

  public async decryptUrlData(urlData: Url): Promise<any> {
    const decryptedData = decryptData(
      urlData.encryptedData.encryptedData,
      urlData.encryptedDekIV,
      urlData.encryptedData.iv,
    );
    return JSON.parse(decryptedData);
  }

  public async updateUrl(urlId: string, update: any): Promise<void> {
    await this.urlModel.updateOne({ urlId }, update).exec();
  }
}

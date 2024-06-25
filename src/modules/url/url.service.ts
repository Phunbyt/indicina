import { Injectable } from '@nestjs/common';
import { EncodeUrlDto } from './dto/encode-url.dto';

@Injectable()
export class UrlService {
  encode(encodeUrlDto: EncodeUrlDto) {
    return `This action adds a new url ${encodeUrlDto}`;
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

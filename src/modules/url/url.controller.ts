import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UrlService } from './url.service';
import { DecodeUrlDto, EncodeUrlDto } from './dto/encode-url.dto';

@Controller()
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post('encode')
  encode(@Body() encodeUrlDto: EncodeUrlDto) {
    return this.urlService.encode(encodeUrlDto);
  }

  @Post('decode')
  decode(@Body() decodeUrlDto: DecodeUrlDto) {
    return this.urlService.decode(decodeUrlDto);
  }

  @Get(':url_path')
  record(@Param('url_path') url_path: string) {
    return this.urlService.record(url_path);
  }

  @Get('statistic/:url_path')
  stats(@Param('url_path') url_path: string) {
    return this.urlService.stats(url_path);
  }
}

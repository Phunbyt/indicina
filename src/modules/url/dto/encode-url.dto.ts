import { IsNotEmpty, IsUrl } from 'class-validator';

export class EncodeUrlDto {
  @IsNotEmpty({ message: 'url can not be empty' })
  @IsUrl({}, { message: 'url must be  valid and with domain name' })
  public url: string;
}

export class DecodeUrlDto {
  @IsNotEmpty({ message: 'url can not be empty' })
  public url: string;
}

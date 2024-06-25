import { IsNotEmpty } from 'class-validator';

export class EncodeUrlDto {
  @IsNotEmpty({ message: 'url can not be empty' })
  public url: string;
}

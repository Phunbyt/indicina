import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class Url {
  @Prop({ type: 'string' })
  public urlId: string;

  @Prop({ type: 'string' })
  public encryptedDek: string;

  @Prop({ type: 'string' })
  public encryptedDekIV: string;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  public encryptedData: Record<string, string>;

  @Prop({ type: 'number', default: 0 })
  public visits: number;

  @Prop({ type: 'number', default: 0 })
  public decryptCount: number;

  @Prop({ type: 'string' })
  public lastVisit: string;
}

export type UrlDocument = HydratedDocument<Url>;

export const UrlSchema = SchemaFactory.createForClass(Url);

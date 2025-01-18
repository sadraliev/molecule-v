import { InjectModel, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

export type PoSDocument = HydratedDocument<PoSDefinition>;
export type PoSModel = Model<PoSDefinition>;

@Schema({
  timestamps: true,
})
export class PoSDefinition {
  @Prop({ required: true, type: String })
  name: string;

  @Prop({ required: true, type: String })
  address: string;
}

export const POS_COLLECTION_NAME = 'point_of_sales';
export const InjectPoS = () => InjectModel(POS_COLLECTION_NAME);
export const PoSSchema = SchemaFactory.createForClass(PoSDefinition);

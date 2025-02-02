import { InjectModel, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

import { stampActions, StampAction, StampActions } from './stamp.types';

export type StampDocument = HydratedDocument<StampDefinition>;
export type StampModel = Model<StampDefinition>;

@Schema({ timestamps: true })
export class StampDefinition {
  @Prop({ required: true })
  cardId: string;

  @Prop({ required: true })
  posId: string;

  @Prop({ required: true, enum: stampActions, default: StampActions.AddStamp })
  action: StampAction;
}

export const STAMP_COLLECTION_NAME = 'stamps';
export const InjectStamp = () => InjectModel(STAMP_COLLECTION_NAME);
export const StampSchema = SchemaFactory.createForClass(StampDefinition);
StampSchema.set('toObject', {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();

    delete ret._id;
    delete ret.__v;

    return ret;
  },
});

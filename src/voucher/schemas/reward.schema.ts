import { InjectModel, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

import { Reward } from '../types/reward.types';

@Schema({ timestamps: true })
export class RewardDefinition implements Reward {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: String })
  termsUrl?: string;
}
export type RewardDocument = HydratedDocument<RewardDefinition>;
export type RewardModel = Model<RewardDefinition>;

export const REWARD_COLLECTION_NAME = 'rewards';
export const InjectReward = () => InjectModel(REWARD_COLLECTION_NAME);

export const RewardSchema = SchemaFactory.createForClass(RewardDefinition);
RewardSchema.set('toObject', {
  transform: function (_, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;

    return ret;
  },
});

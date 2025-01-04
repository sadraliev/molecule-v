import { InjectModel, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

import { Reward } from '../types/voucher.types';

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
export const RewardSchema = SchemaFactory.createForClass(RewardDefinition);
export const InjectReward = () => InjectModel(REWARD_COLLECTION_NAME);

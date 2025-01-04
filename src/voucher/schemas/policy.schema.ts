import { InjectModel, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

import { IssueOptions } from '../types/voucher.types';

@Schema({ timestamps: true })
export class PolicyDefinition {
  @Prop({ type: String, name: 'name', required: true })
  name: string;

  @Prop({ type: String, required: true })
  issue: IssueOptions;

  @Prop({ type: Number, name: 'max_reissues' })
  maxReissues: number;

  @Prop({ type: Number, required: true })
  stampsRequiredForReward: number;
}

export type PolicyDocument = HydratedDocument<PolicyDefinition>;
export type PolicyModel = Model<PolicyDefinition>;

export const POLICY_COLLECTION_NAME = 'policies';
export const PolicySchema = SchemaFactory.createForClass(PolicyDefinition);
export const InjectPolicy = () => InjectModel(POLICY_COLLECTION_NAME);

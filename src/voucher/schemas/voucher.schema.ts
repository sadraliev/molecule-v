import { InjectModel, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';

import {
  PolicyId,
  RewardId,
  Voucher,
  VoucherState,
} from '../types/voucher.types';

import { POLICY_COLLECTION_NAME } from './policy.schema';
import { REWARD_COLLECTION_NAME } from './reward.schema';

@Schema({ timestamps: true })
export class VoucherDefinition implements Voucher {
  @Prop({ type: Types.ObjectId, ref: REWARD_COLLECTION_NAME, required: true })
  rewardId: RewardId;

  @Prop({ type: Types.ObjectId, ref: POLICY_COLLECTION_NAME, required: true })
  policyId: PolicyId;

  @Prop({ type: String, required: true, default: 'draft' })
  status: VoucherState;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  promotionName: string;

  // @Prop({ type: Types.ObjectId, required: true })
  issuedBy: string; // UserId

  @Prop({ type: Date, required: true })
  issuedAt: string; // ISOstring

  @Prop({ type: Date, required: true })
  expiredAt: string; // ISODate
}
export type VoucherDocument = HydratedDocument<VoucherDefinition>;
export type VoucherModel = Model<VoucherDefinition>;

export const VOUCHER_COLLECTION_NAME = 'vouchers';
export const VoucherSchema = SchemaFactory.createForClass(VoucherDefinition);
export const InjectVoicher = () => InjectModel(VOUCHER_COLLECTION_NAME);
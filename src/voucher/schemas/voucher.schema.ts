import { InjectModel, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';

import { Voucher, VoucherState } from '../types/voucher.types';

import { POLICY_COLLECTION_NAME } from './policy.schema';
import { REWARD_COLLECTION_NAME } from './reward.schema';

@Schema({ timestamps: true })
export class VoucherDefinition implements Voucher {
  @Prop({
    type: Types.ObjectId,
    name: 'reward',
    ref: REWARD_COLLECTION_NAME,
    required: true,
  })
  rewardId: string;

  @Prop({ type: Types.ObjectId, ref: POLICY_COLLECTION_NAME, required: true })
  policyId: string;

  @Prop({ type: String, required: true, default: 'draft' })
  status: VoucherState;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  promotionName: string;

  @Prop({ type: String, required: true })
  issuedBy: string;

  @Prop({ type: Date, required: true })
  issueAt: string;

  @Prop({ type: Date, required: true })
  expirationAt: string;
}

export type VoucherDocument = HydratedDocument<VoucherDefinition>;
export type VoucherModel = Model<VoucherDefinition>;

export const VOUCHER_COLLECTION_NAME = 'vouchers';
export const InjectVoicher = () => InjectModel(VOUCHER_COLLECTION_NAME);
export const VoucherSchema = SchemaFactory.createForClass(VoucherDefinition);

VoucherSchema.set('toObject', {
  transform: (_, ret) => {
    ret.id = ret._id.toString();

    delete ret._id;
    delete ret.__v;

    return ret;
  },
});

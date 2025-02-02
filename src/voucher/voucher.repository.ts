import { Injectable } from '@nestjs/common';
import { RootFilterQuery } from 'mongoose';

import { PolicyDocument } from './schemas/policy.schema';
import { RewardDocument } from './schemas/reward.schema';
import {
  InjectVoicher,
  VoucherModel,
  VoucherDocument,
} from './schemas/voucher.schema';
import { VoucherEntity } from './types/voucher.types';

@Injectable()
export class VoucherRepository {
  constructor(@InjectVoicher() private readonly voucherModel: VoucherModel) {}

  async findOne(filter?: RootFilterQuery<VoucherEntity>) {
    const document = await this.voucherModel.findOne(filter);

    if (!document) {
      return null;
    }

    return document.toObject<VoucherEntity>();
  }
  async findById(voucherId: string) {
    return this.voucherModel
      .findById(voucherId)
      .populate<{ policy: PolicyDocument }>('policyId')
      .populate<{ reward: RewardDocument }>('rewardId');
  }

  async save(data: Partial<VoucherDocument>): Promise<VoucherDocument> {
    return new this.voucherModel(data).save();
  }
}

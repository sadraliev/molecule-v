import { Injectable } from '@nestjs/common';

import { PolicyDocument } from './schemas/policy.schema';
import { RewardDocument } from './schemas/reward.schema';
import {
  InjectVoicher,
  VoucherModel,
  VoucherDocument,
} from './schemas/voucher.schema';

@Injectable()
export class VoucherRepository {
  constructor(@InjectVoicher() private readonly voucherModel: VoucherModel) {}

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

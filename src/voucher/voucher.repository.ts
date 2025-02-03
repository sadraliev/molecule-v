import { Injectable } from '@nestjs/common';
import { RootFilterQuery } from 'mongoose';

import {
  InjectVoicher,
  VoucherModel,
  VoucherDocument,
} from './schemas/voucher.schema';
import { PolicyEntity } from './types/policy.types';
import { RewardEntity } from './types/reward.types';
import { UnfoldedVoucher, VoucherEntity } from './types/voucher.types';

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
  async findById(voucherId: string): Promise<UnfoldedVoucher> {
    const document = await this.voucherModel
      .findById(voucherId)
      .populate('policyId')
      .populate('rewardId');

    const refined = document.toObject<
      VoucherEntity & {
        policyId: PolicyEntity;
        rewardId: RewardEntity;
      }
    >();

    const pretty = {
      ...refined,
      policy: refined.policyId,
      reward: refined.rewardId,
    };

    delete pretty.policyId;
    delete pretty.rewardId;

    return pretty;
  }

  async save(data: Partial<VoucherDocument>): Promise<VoucherDocument> {
    return new this.voucherModel(data).save();
  }
}

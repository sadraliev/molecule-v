import { Injectable, Logger } from '@nestjs/common';
import { Camelify } from 'src/lib';

import { CreateVoucherDto } from './dtos/create-voucher.dto';
import { InjectPolicy, PolicyModel } from './schemas/policy.schema';
import {
  InjectReward,
  RewardDefinition,
  RewardModel,
} from './schemas/reward.schema';
import { InjectVoicher, VoucherModel } from './schemas/voucher.schema';

@Injectable()
export class VoucherService {
  readonly logger = new Logger('Voucher service');
  constructor(
    @InjectReward()
    private readonly rewardModel: RewardModel,
    @InjectPolicy()
    private readonly policyModel: PolicyModel,
    @InjectVoicher()
    private readonly voucherMidel: VoucherModel,
  ) {}

  async create(
    _createVoucher: Camelify<CreateVoucherDto>,
  ): Promise<RewardDefinition> {
    try {
      const mockPolicy = {
        name: 'Loyalty Program Policy',
        issue: 'auto',
        stampsRequiredForReward: 5,
      };
      const mockReward = {
        name: 'Free Coffee',
      };

      const createdCat = new this.rewardModel(mockReward);
      const createdPolicy = new this.policyModel(mockPolicy);
      const policy = await createdPolicy.save();
      const reward = await createdCat.save();

      const mockVoucher = {
        rewardId: reward.id,
        policyId: policy.id,
        status: 'draft',
        name: 'Special Discount Voucher',
        promotionName: 'Black Friday Sale',
        issuedAt: new Date().toISOString(),
        expiredAt: new Date(new Date().setDate(new Date().getDate() + 30)),
      };

      const createdVoucher = new this.voucherMidel(mockVoucher);
      const voucher = await createdVoucher.save();
      const response = {
        policy,
        reward,
        voucher,
      };

      return response as any;
    } catch (error) {
      throw error;
    }
  }
}

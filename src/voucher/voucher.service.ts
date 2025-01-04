import { Injectable, Logger } from '@nestjs/common';

import { CreateVoucherDto } from './dtos/create-voucher.dto';
import {
  getPolicy,
  getReward,
  makeVoucher,
} from './helpers/voucher.calculations';
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

  async create(createVoucher: CreateVoucherDto): Promise<RewardDefinition> {
    try {
      const voucher = makeVoucher(createVoucher);
      const reward = getReward(voucher);
      const policy = getPolicy(voucher);
      const createdReward = new this.rewardModel(reward);
      const createdPolicy = new this.policyModel(policy);
      const savedpolicy = await createdPolicy.save();
      const savedreward = await createdReward.save();

      const mockVoucher = {
        rewardId: savedreward.id,
        policyId: savedpolicy.id,
        status: 'draft',
        name: 'Special Discount Voucher',
        promotionName: 'Black Friday Sale',
        issuedAt: new Date().toISOString(),
        expiredAt: new Date(new Date().setDate(new Date().getDate() + 30)),
      };

      const createdVoucher = new this.voucherMidel(mockVoucher);

      await createdVoucher.save();
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

import { Injectable, Logger } from '@nestjs/common';
import { UserId } from 'src/lib';

import { CreateVoucherDto } from './dtos/create-voucher.dto';
import {
  getPolicy,
  getReward,
  getVoucher,
  makeVoucher,
} from './helpers/voucher.calculations';
import { InjectPolicy, PolicyModel } from './schemas/policy.schema';
import { InjectReward, RewardModel } from './schemas/reward.schema';
import {
  InjectVoicher,
  VoucherDocument,
  VoucherModel,
} from './schemas/voucher.schema';

@Injectable()
export class VoucherService {
  readonly logger = new Logger('Voucher service');
  constructor(
    @InjectReward()
    private readonly rewardModel: RewardModel,
    @InjectPolicy()
    private readonly policyModel: PolicyModel,
    @InjectVoicher()
    private readonly voucherModel: VoucherModel,
  ) {}

  async create(
    createVoucher: CreateVoucherDto,
    userId: UserId,
  ): Promise<VoucherDocument> {
    const withUser = makeVoucher(userId, getVoucher(createVoucher));

    const policy = await new this.policyModel(getPolicy(createVoucher)).save();

    const withPolicy = withUser(policy.id);

    const reward = await new this.rewardModel(getReward(createVoucher)).save();

    const fulledVoucher = withPolicy(reward.id);
    const voucher = await new this.voucherModel(fulledVoucher).save();

    return voucher;
  }
}

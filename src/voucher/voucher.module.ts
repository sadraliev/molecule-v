import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { POLICY_COLLECTION_NAME, PolicySchema } from './schemas/policy.schema';
import { REWARD_COLLECTION_NAME, RewardSchema } from './schemas/reward.schema';
import {
  VOUCHER_COLLECTION_NAME,
  VoucherSchema,
} from './schemas/voucher.schema';
import { VoucherController } from './voucher.controller';
import { VoucherService } from './voucher.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: REWARD_COLLECTION_NAME,
        schema: RewardSchema,
      },
      {
        name: POLICY_COLLECTION_NAME,
        schema: PolicySchema,
      },
      {
        name: VOUCHER_COLLECTION_NAME,
        schema: VoucherSchema,
      },
    ]),
  ],
  providers: [VoucherService],
  controllers: [VoucherController],
})
export class VoucherModule {}

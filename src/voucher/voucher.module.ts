import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomerModule } from 'src/organization/customer/customer.module';

import { CardModule } from './modules/card/card.module';
import { StampModule } from './modules/stamp/stamp.module';
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
    StampModule,
    CardModule,
    CustomerModule,
  ],
  providers: [VoucherService],
  controllers: [VoucherController],
  exports: [VoucherService],
})
export class VoucherModule {}

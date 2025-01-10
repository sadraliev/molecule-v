import { Module } from '@nestjs/common';

import { CustomerModule } from './customer/customer.module';
import { PosModule } from './pos/pos.module';

@Module({
  imports: [CustomerModule, PosModule],
})
export class OrganizationModule {}

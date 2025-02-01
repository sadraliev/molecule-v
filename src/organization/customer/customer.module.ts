import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CustomerRepository } from './customer.repository';
import { CustomerService } from './customer.service';
import {
  CUSTOMER_COLLECTION_NAME,
  CustomerSchema,
} from './schemas/customer.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CUSTOMER_COLLECTION_NAME, schema: CustomerSchema },
    ]),
  ],
  providers: [CustomerService, CustomerRepository],
  exports: [CustomerService],
})
export class CustomerModule {}

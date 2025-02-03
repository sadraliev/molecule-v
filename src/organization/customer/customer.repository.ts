import { Injectable } from '@nestjs/common';
import { PhoneNumber } from 'src/lib';

import { InjectCustomer, CustomerModel } from './schemas/customer.schema';
import { CustomerEntity } from './types/customer.types';

@Injectable()
export class CustomerRepository {
  constructor(
    @InjectCustomer() private readonly customerModel: CustomerModel,
  ) {}

  async findByPhone(phone: PhoneNumber): Promise<CustomerEntity | void> {
    const document = await this.customerModel.findOne({ phone });

    if (!document) {
      return null;
    }

    return document.toObject<CustomerEntity>();
  }

  async save(phone: PhoneNumber): Promise<CustomerEntity> {
    const document = new this.customerModel({ phone });

    await document.save();

    return document.toObject<CustomerEntity>();
  }
}

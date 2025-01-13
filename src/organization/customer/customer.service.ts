import { Injectable, Logger } from '@nestjs/common';
import { PhoneNumber } from 'src/lib';

import {
  CustomerDocument,
  CustomerModel,
  InjectCustomer,
} from './schemas/customer.schema';

@Injectable()
export class CustomerService {
  readonly logger = new Logger('Customer service');
  constructor(
    @InjectCustomer()
    private readonly customerModel: CustomerModel,
  ) {}
  async findByPhone(phone: PhoneNumber): Promise<CustomerDocument> {
    return this.customerModel.findOne({ phone });
  }

  async createCustomer(phone: PhoneNumber): Promise<CustomerDocument> {
    const newCustomer = new this.customerModel({ phone });

    await newCustomer.save();

    return newCustomer;
  }

  async findOrCreate(phone: PhoneNumber): Promise<CustomerDocument> {
    const customer = await this.findByPhone(phone);

    if (customer) {
      return customer;
    }

    return await this.createCustomer(phone);
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { PhoneNumber } from 'src/lib';

import { CustomerRepository } from './customer.repository';
import { CustomerEntity } from './types/customer.types';

@Injectable()
export class CustomerService {
  readonly logger = new Logger('Customer service');

  constructor(private readonly customerRepository: CustomerRepository) {}

  async findByPhone(phone: PhoneNumber): Promise<CustomerEntity | void> {
    return this.customerRepository.findByPhone(phone);
  }

  async createCustomer(phone: PhoneNumber): Promise<CustomerEntity> {
    return this.customerRepository.save(phone);
  }

  async findOrCreate(phone: PhoneNumber): Promise<CustomerEntity> {
    const customer = await this.customerRepository.findByPhone(phone);

    if (!customer) {
      return await this.customerRepository.save(phone);
    }

    return customer;
  }
}

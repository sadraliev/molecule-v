import { Injectable } from '@nestjs/common';

import { InjectPolicy, PolicyModel } from './schemas/policy.schema';
import { Policy, PolicyEntity } from './types/policy.types';

@Injectable()
export class PolicyRepository {
  constructor(@InjectPolicy() private readonly policyModel: PolicyModel) {}

  async save(policy: Policy): Promise<PolicyEntity> {
    const document = new this.policyModel(policy);

    await document.save();

    return document.toObject<PolicyEntity>();
  }
}

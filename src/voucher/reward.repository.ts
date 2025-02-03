import { Injectable } from '@nestjs/common';

import { InjectReward, RewardModel } from './schemas/reward.schema';
import { Reward, RewardEntity } from './types/reward.types';

@Injectable()
export class RewardRepository {
  constructor(@InjectReward() private readonly rewardModel: RewardModel) {}
  async save(reward: Reward) {
    const document = new this.rewardModel(reward);

    document.save();

    return document.toObject<RewardEntity>();
  }
}

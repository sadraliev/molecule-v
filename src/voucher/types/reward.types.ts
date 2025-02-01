import { EntityBase } from 'src/lib';

export type Reward = {
  name: string;
  description?: string;
  termsUrl?: string;
};
export type RewardId = string;

export type RewardEntity = EntityBase<Reward>;

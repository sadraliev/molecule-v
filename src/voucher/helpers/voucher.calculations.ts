import { compose, curry, mergeRight, omit, prop } from 'ramda';
import { toCamelCase, UserId } from 'src/lib';

import { PolicyId } from '../types/policy.types';
import { RewardId } from '../types/reward.types';

export const makeVoucher = curry(
  (
    userId: UserId,
    rawVoucher: Record<string, any>,
    policyId: PolicyId,
    rewardId: RewardId,
  ) => mergeRight(rawVoucher, { policyId, rewardId, issuedBy: userId }),
);

export const getPolicy = compose(prop('policy'), toCamelCase);
export const getReward = compose(prop('reward'), toCamelCase);
export const getVoucher = compose(omit(['policy', 'reward']), toCamelCase);

export const getPolicyId = compose(prop('id'));
export const getRewardId = compose(prop('id'));

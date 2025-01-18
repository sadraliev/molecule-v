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

/**
 * Splits the second number into parts where each part is equal to the first number,
 * except for the last part, which will be the remainder (if any).
 *
 * @param partSize The size of each part.
 * @param total The total number to split.
 * @returns An array of parts.
 */
export const splitToParts = (partSize: number, total: number): number[] => {
  if (partSize <= 0) throw new Error('Part size must be greater than 0');

  const fullParts = Math.floor(total / partSize);
  const remainder = total % partSize;

  return Array(fullParts)
    .fill(partSize)
    .concat(remainder > 0 ? [remainder] : []);
};

/**
 * Fills parts (e.g., the result of `splitToParts`) with the specified value,
 * creating a nested array where each part is an array of identical values.
 *
 * @param parts An array of numbers, typically the result of `splitToParts`,
 *              where each number specifies the size of the corresponding nested array.
 * @param value The value to fill each nested array.
 * @returns A 2D array where each nested array is filled with the specified value.
 */
export const fillPartsWithValue = <T>(
  parts: number[],
  fn: (count: number) => T[],
): T[][] => parts.map((count) => fn(count));

/**
 * Checks if there is enough space to add new stamps to a card.
 *
 * @param stampsToAdd The number of stamps to add.
 * @param limit The total number of possible slots on the card.
 * @param filledSlots The number of slots already occupied on the card.
 * @returns True if there is enough space, false otherwise.
 */
export const hasEnoughSlotsForStamps = (
  stampsToAdd: number,
  limit: number,
  filledSlots: number,
): boolean => stampsToAdd <= limit - filledSlots;

/**
 * Creates an array filled with a specified value.
 *
 * @param blank The value to fill the array with.
 * @param length The number of elements in the array. Default = 1
 * @returns An array filled with the specified value.
 */
export const createArrayWithValue = <T>(blank: T, length: number = 1): T[] =>
  Array.from({ length }, () => blank);

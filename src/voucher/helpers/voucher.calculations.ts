import { compose, prop } from 'ramda';
import { toCamelCase } from 'src/lib';

export const makeVoucher = compose(toCamelCase);
export const getPolicy = compose(prop('policy'));
export const getReward = compose(prop('reward'));

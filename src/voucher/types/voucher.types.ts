import { EntityBase, ISODate, UserId } from 'src/lib';

import { PolicyId } from './policy.types';
import { RewardId } from './reward.types';

/**
 * Status of the voucher lifecycle:
 * `draft`: The voucher is not published: It can be edited. Available only to the creator.
 * `published`: The voucher is published: Cannot be edited. Available to everyone.
 * `expired`: The voucher has expired: Available only to the creator. Cannot be edited.
 * `revoke` : Revoke the remaining vouchers
 */
export const voucherState = [
  'draft',
  'published',
  'expired',
  'revoke',
] as const;
export type VoucherState = (typeof voucherState)[number];

export type Voucher = {
  rewardId: RewardId;
  policyId: PolicyId;

  name: string;
  promotionName: string;

  issuedBy: UserId;
  issueAt: ISODate;
  expirationAt: ISODate;
};
export type VoucherId = string;

export type VoucherEntity = EntityBase<Voucher, { status: VoucherState }>;

import { CustomerId, ISODate, PoSId, UserId, Uuid } from 'src/lib';

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

  status: VoucherState;
  name: string;
  promotionName: string;

  issuedBy: UserId;
  issuedAt: ISODate;
  expiredAt: ISODate;
};
export type VoucherId = string;

export type IssueOptions = 'auto' | 'custom';
export type Policy = {
  name: string;
  /**s
   * Specifies the reissue policy for the voucher:
   * - `'auto'`: Automatic reissue is enabled.
   * - `custom`: Maximum number of reissues allowed for the voucher.
   * This field determines the total number of reissues across all consumers.
   *
   * default: "auto"
   */
  issue: IssueOptions;
  maxReissue?: number;

  stampsRequiredForReward: number;
};

export type PolicyId = string;

export type Reward = {
  name: string;
  description?: string;
  termsUrl?: string;
};
export type RewardId = string;

/**
 * Status of the voucher lifecycle:
 * - `active`: Default state. The voucher becomes active when the first stamp is received.
 * - `completed`: All required stamps have been collected, but the reward has not been claimed yet.
 * - `redeem`: The reward has been claimed.
 */
const holderState = ['actived', 'completed', 'redeemed'] as const;

export type HolderState = (typeof holderState)[number];

export type Holder = {
  id: Uuid;

  voucherId: VoucherId;
  holderId: CustomerId;

  status: HolderState;
  redeemPosId?: PoSId;
  completedAt?: ISODate;
  redeemAt?: ISODate;

  createdAt: ISODate;
  updatedAt: ISODate;
};
export type HolderId = string;

export type Stamp = {
  id: Uuid;
  holderId: HolderId;
  posId: PoSId;
  createdAt: ISODate;
};
export type StampId = string;

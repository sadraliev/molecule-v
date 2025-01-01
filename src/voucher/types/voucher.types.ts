import { CustomerId, ISODate, PoSId, PropType, UserId, Uuid } from 'src/lib';

/**
 * Status of the voucher lifecycle:
 * `draft`: The voucher is not published: It can be edited. Available only to the creator.
 * `published`: The voucher is published: Cannot be edited. Available to everyone.
 * `expired`: The voucher has expired: Available only to the creator. Cannot be edited.
 */
export const voucherState = ['draft', 'published', 'expired'] as const;
export type VoucherState = (typeof voucherState)[number];

export type Voucher = {
  id: Uuid;

  rewardId: RewardId;
  policyId: PolicyId;

  status: VoucherState;
  name: string;
  promotion_name: string;

  issued_by: UserId;
  issued_at: ISODate;
  expired_at: ISODate;

  created_at: ISODate;
  updated_at: ISODate;
};
export type VoucherId = PropType<Voucher, 'id'>;

export type Policy = {
  id: Uuid;
  /**
   * Specifies the reissue policy for the voucher:
   * - `'auto'`: Automatic reissue is enabled.
   * - `number`: Maximum number of reissues allowed for the voucher.
   * This field determines the total number of reissues across all consumers.
   *
   * default: "auto"
   */
  reissue: 'auto' | number;
  /**
   * Specifies the reissue policy per consumer:
   * - `false`: Reissue is not allowed for individual consumers.
   * - `'auto'`: Automatic reissue per consumer is enabled.
   * - `number`: Maximum number of reissues allowed per consumer.
   * This field determines how many times a single consumer can reissue the voucher.
   *
   * default: false
   */
  per_customer_reissue: false | 'auto' | number;
};

export type PolicyId = PropType<Policy, 'id'>;

export type Reward = {
  id: Uuid;
  name: string;
};
export type RewardId = PropType<Reward, 'id'>;

/**
 * Status of the voucher lifecycle:
 * - `active`: Default state. The voucher becomes active when the first stamp is received.
 * - `completed`: All required stamps have been collected, but the reward has not been claimed yet.
 * - `redeem`: The reward has been claimed.
 */
const holderState = ['actived', 'completed', 'redeemed'] as const;
export type HolderState = (typeof holderState)[number];

type Holder = {
  id: Uuid;

  voucher_id: VoucherId;
  holder_id: CustomerId;

  status: HolderState;
  redeem_pos?: PoSId;
  completed_at?: ISODate;
  redeem_at?: ISODate;

  created_at: ISODate;
  updated_at: ISODate;
};
export type HolderId = PropType<Holder, 'id'>;

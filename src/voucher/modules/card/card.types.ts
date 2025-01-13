import { ISODate } from 'src/lib';

/**
 * Status of the voucher lifecycle:
 * - `activated`: Default state. The voucher becomes active when the first stamp is received.
 * - `completed`: All required stamps have been collected, but the reward has not been claimed yet.
 * - `redeem`: The reward has been claimed.
 */
export const CardStatuses = {
  Activated: 'activated',
  Completed: 'completed',
  redeemed: 'redeemed',
} as const;

export const cardStatus = Object.values(CardStatuses);

export type CardStatus = (typeof cardStatus)[number];

export type Card = {
  voucherId: string;
  customerId: string;

  status: CardStatus;
  redeemPosId?: string;
  completedAt?: ISODate;
  redeemAt?: ISODate;
};

export type CardId = string;

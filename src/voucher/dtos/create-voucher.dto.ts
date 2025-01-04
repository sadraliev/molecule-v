import { Policy, Reward } from '../types/voucher.types';

export class CreateVoucherDto {
  name: string;
  promotion_name: string;
  issue_at: string;
  expiration_at: string;
  policy: Policy;
  reward: Reward;
}

export class CreateVoucherResponseDto {
  ok: boolean;
}

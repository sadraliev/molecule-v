export class CreateVoucherDto {
  name: string;
  promotion_name: string;
  issue_at: string;
  expiration_at: string;
  policy: CreatePolicyDto;
  reward: CreateRewardDto;
}

export class CreateVoucherResponseDto {
  ok: boolean;
}

class CreatePolicyDto {
  name: string;
  issue_mode: 'auto' | 'custom';
  max_reissue?: number;
  stamps_required_for_reward: number;
}

class CreateRewardDto {
  name: string;
  description?: string;
  terms_url?: string;
}

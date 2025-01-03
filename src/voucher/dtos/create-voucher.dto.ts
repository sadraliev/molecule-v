export class CreateVoucherDto {
  name: string;
  promotion_name: string;
  issue_at: string;
  expiration_at: string;
  policy: {
    name: string;
    issue: string | number;
  };
  reward: {
    name: string;
  };
}

export class CreateVoucherResponseDto {
  ok: boolean;
}

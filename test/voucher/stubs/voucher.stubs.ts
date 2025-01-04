import { faker } from '@faker-js/faker';
import { CreateVoucherDto } from 'src/voucher/dtos/create-voucher.dto';
import { Policy, Reward } from 'src/voucher/types/voucher.types';

export const createPolicy = (): Policy => ({
  name: faker.lorem.sentence(),
  issueMode: 'auto',
  stampsRequiredForReward: faker.number.int({ min: 3, max: 7 }),
});

export const createReward = (): Reward => ({
  name: faker.lorem.sentence(),
  description: faker.lorem.lines(),
  termsUrl: faker.internet.url(),
});

export const createVoucher = (): CreateVoucherDto => {
  const issue_at = faker.date.future().toISOString();
  const expiration_at = faker.date
    .future({ years: 2, refDate: issue_at })
    .toISOString();

  return {
    name: faker.lorem.word(),
    promotion_name: faker.lorem.sentence(),
    issue_at,
    expiration_at,
    reward: createReward(),
    policy: createPolicy(),
  };
};

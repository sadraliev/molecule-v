import { faker } from '@faker-js/faker';
import { CreateVoucherDto } from 'src/voucher/dtos/create-voucher.dto';

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
    reward: {
      name: faker.lorem.sentence(),
      description: faker.lorem.lines(),
      terms_url: faker.internet.url(),
    },
    policy: {
      name: faker.lorem.sentence(),
      issue_mode: 'auto',
      stamps_required_for_reward: faker.number.int({ min: 3, max: 7 }),
    },
  };
};

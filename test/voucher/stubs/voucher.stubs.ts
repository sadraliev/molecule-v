import { faker } from '@faker-js/faker';
import { PhoneNumber } from 'src/lib';
import { CreateVoucherDto } from 'src/voucher/dtos/create-voucher.dto';

export const createVoucherDto = (
  fn: (voucher: CreateVoucherDto) => CreateVoucherDto,
): CreateVoucherDto => {
  const issue_at = faker.date.future().toISOString();
  const expiration_at = faker.date
    .future({ years: 2, refDate: issue_at })
    .toISOString();

  const voucher = {
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
      issue_mode: faker.helpers.arrayElement(['auto', 'fixed']),
      stamps_required_for_reward: faker.number.int({ min: 3, max: 7 }),
    },
  };

  return fn(voucher);
};

export const makeMockPhone = <T>(fn: (phone: PhoneNumber) => T) => {
  const number = faker.phone.number({ style: 'international' });

  return fn(number);
};

export const createStampsDto = <T>(
  fn: (mockDto: { forCustomer: string; stampsToAdd: number }) => T,
): T => {
  const mockDto = {
    forCustomer: makeMockPhone((phone) => phone),
    stampsToAdd: faker.number.int({ min: 10, max: 100 }),
  };

  return fn(mockDto);
};

export const makeMockPoS = <T>(fn: (mockPoS: Record<string, any>) => T): T => {
  const mockPoS = {
    name: faker.lorem.word(),
    address: faker.location.streetAddress({ useFullAddress: true }),
  };

  return fn(mockPoS);
};

export const addVoucherV1 = <
  T,
  R extends T & { apiVersion: string; resource: 'Voucher' },
>(
  data: T,
): R => {
  return {
    resource: 'Voucher',
    apiVersion: 'v1',
    ...data,
  } as R;
};

export const withVoucherV1 = <T, R>(
  callback: (arg: T) => R,
): ((arg: T) => R) => {
  return function (x: T): R {
    return {
      resource: 'Voucher',
      apiVersion: 'v1',
      ...callback(x),
    };
  };
};

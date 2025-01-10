import { PhoneNumber } from 'src/lib';

export const customerStates = ['unverified', 'verified'] as const;
export type CustomerStatus = (typeof customerStates)[number];

export type Customer = {
  phone: PhoneNumber;
  name: string;
  status: CustomerStatus;
};

export type CustomerId = string;

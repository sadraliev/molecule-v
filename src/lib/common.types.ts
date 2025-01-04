export type Uuid = string; // uuid
export type ISODate = string; // 'ISO 8601';
export type PhoneNumber = string; //'E.164';
export type EmailAddress = string; // Validated against RFC 5322 or RFC 6531

export type PropType<T, K extends keyof T> = T[K];
export type Document<T> = T & {
  _id: Uuid;
  createdAt: ISODate;
  updatedAt: ISODate;
  __v: number;
};

type User = {
  id: Uuid;
  email: EmailAddress;
};

export type UserId = PropType<User, 'id'>;

type PoS = {
  id: Uuid;
  name: string;
  address: string;
};
export type PoSId = PropType<PoS, 'id'>;

type Customer = {
  id: string;
  phoneNumber: PhoneNumber;
  name: string;
};
export type CustomerId = PropType<Customer, 'id'>;

export type Uuid = string; // uuid
export type ISODate = string; // 'ISO 8601';
export type PhoneNumber = string; //'E.164';
export type EmailAddress = string; // Validated against RFC 5322 or RFC 6531
export type JwtToken = string;

export type PropType<T, K extends keyof T> = T[K];

export type User = {
  id: Uuid;
  email: EmailAddress;
};

export type UserId = string;

export type EntityBase<T> = T & {
  id: Uuid;
  createdAt: ISODate;
  updatedAt: ISODate;
};

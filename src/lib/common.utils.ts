import { Types } from 'mongoose';

import { Uuid } from './common.types';

type CamelCase<S extends string> = S extends `${infer P}_${infer Rest}`
  ? `${P}${Capitalize<CamelCase<Rest>>}`
  : S;

export type Camelify<T> =
  T extends Array<infer U>
    ? Array<Camelify<U>>
    : T extends Record<string, any>
      ? {
          [K in keyof T as CamelCase<string & K>]: Camelify<T[K]>;
        }
      : T;

export const toCamelCase = <T extends Record<string, any>>(
  obj: T,
): Camelify<T> => {
  const convertKey = (key: string) =>
    key.replace(/_([a-z])/g, (_, char) => char.toUpperCase());

  if (typeof obj !== 'object' || obj === null) return obj as Camelify<T>;

  if (Array.isArray(obj)) {
    return obj.map((item) => toCamelCase(item)) as Camelify<T>;
  }

  return Object.entries(obj).reduce(
    (acc, [key, value]) => {
      const newKey = convertKey(key);

      acc[newKey] =
        typeof value === 'object' && value !== null
          ? toCamelCase(value)
          : value;

      return acc;
    },
    {} as Record<string, any>,
  ) as Camelify<T>;
};

type SnakeCase<S extends string> = S extends `${infer P}${infer Rest}`
  ? Rest extends Capitalize<Rest>
    ? `${Lowercase<P>}_${SnakeCase<Rest>}`
    : `${Lowercase<P>}${SnakeCase<Rest>}`
  : S;

export type Snakify<T> =
  T extends Array<infer U>
    ? Array<Snakify<U>>
    : T extends Record<string, any>
      ? {
          [K in keyof T as SnakeCase<string & K>]: Snakify<T[K]>;
        }
      : T;

export const toSnakeCase = <T>(obj: T): Snakify<T> => {
  const convertKey = (key: string) =>
    key.replace(/([A-Z])/g, '_$1').toLowerCase();

  if (typeof obj !== 'object' || obj === null) return obj as Snakify<T>;

  if (Array.isArray(obj)) {
    return obj.map((item) => toSnakeCase(item)) as Snakify<T>;
  }

  return Object.entries(obj).reduce(
    (acc, [key, value]) => {
      const newKey = convertKey(key);

      acc[newKey] =
        typeof value === 'object' && value !== null
          ? toSnakeCase(value)
          : value;

      return acc;
    },
    {} as Record<string, any>,
  ) as Snakify<T>;
};

export const toObjectId = (id: Uuid | Uuid[]) => {
  if (Array.isArray(id)) {
    return id.map((id) => new Types.ObjectId(id));
  }

  return new Types.ObjectId(id);
};

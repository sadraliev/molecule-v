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

/**
 * Splits the second number into parts where each part is equal to the first number,
 * except for the last part, which will be the remainder (if any).
 *
 * @param partSize The size of each part.
 * @param total The total number to split.
 * @returns An array of parts.
 */
export const splitToParts = (partSize: number, total: number): number[] => {
  if (partSize <= 0) throw new Error('Part size must be greater than 0');

  const fullParts = Math.floor(total / partSize);
  const remainder = total % partSize;

  return Array(fullParts)
    .fill(partSize)
    .concat(remainder > 0 ? [remainder] : []);
};

/**
 * Fills parts (e.g., the result of `splitToParts`) with the specified value,
 * creating a nested array where each part is an array of identical values.
 *
 * @param parts An array of numbers, typically the result of `splitToParts`,
 *              where each number specifies the size of the corresponding nested array.
 * @param value The value to fill each nested array.
 * @returns A 2D array where each nested array is filled with the specified value.
 */
export const fillPartsWithValue = <T>(
  parts: number[],
  fn: (count: number) => T[],
): T[][] => parts.map((count) => fn(count));

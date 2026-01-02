import { Account, Address, Lamports, ReadonlyUint8Array, Signature } from "@solana/kit";

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type Sanitized<T> = T extends bigint | Lamports
  ? number
  : T extends Address | Signature
  ? string
  : T extends Array<infer U>
  ? Array<Sanitized<U>>
  : T extends Uint8Array | Buffer | ReadonlyUint8Array
  ? number[]
  : T extends object
  ? {
      [K in keyof T]: Sanitized<T[K]>;
    }
  : T;

export type SanitizedAccount<
  TData extends object,
  TAddress extends string = string
> = Omit<Account<TData, TAddress>, "data" | "space" | "lamports"> & {
  space: number;
  lamports: number;
  data: Sanitized<TData>;
};

export const sanitize = <T>(data: T): Sanitized<T> => {
  if (Array.isArray(data)) {
    return data.map(sanitize) as Sanitized<T>;
  }

  if (typeof data === "object" && data !== null) {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, sanitize(value)])
    ) as Sanitized<T>;
  }

  if (typeof data === "bigint") {
    return Number(data) as Sanitized<T>;
  }

  if (data instanceof Uint8Array) {
    return Array.from(data) as Sanitized<T>;
  }

  if (data instanceof Buffer) {
    return Array.from(data) as Sanitized<T>;
  }

  return data as Sanitized<T>;
};

export const sanitizeAccount = <
  TData extends object,
  TAddress extends string = string
>(
  account: Account<TData, TAddress>
): Sanitized<Account<TData, TAddress>> => {
  return sanitize(account);
};

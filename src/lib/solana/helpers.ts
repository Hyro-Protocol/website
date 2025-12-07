import { Account } from "@solana/kit";

export type Sanitized<T> = T extends object
  ? {
      [K in keyof T]: Sanitized<T[K]>;
    }
  : T extends bigint
  ? number
  : T;

export type SanitizedAccount<
  TData extends object,
  TAddress extends string
> = Omit<Account<TData, TAddress>, "data" | "space" | "lamports"> & {
  space: number;
  lamports: number;
  data: Sanitized<TData>;
};

const sanitize = <T>(data: T): Sanitized<T> => {
  if (typeof data === "object" && data !== null) {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, sanitize(value)])
    ) as Sanitized<T>;
  }

  if (typeof data === "bigint") {
    return Number(data) as Sanitized<T>;
  }

  return data as Sanitized<T>;
};

export const sanitizeAccount = <TData extends object>(
  account: Account<TData, string>
): Sanitized<Account<TData, string>> => {
  return sanitize(account);
};

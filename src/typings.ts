// deno-lint-ignore-file
export interface DataBase<T> {
  id: number;
  name: string;
  data: T | Record<string, unknown>;
}

export interface StowrageOptions {
  isPersistent?: boolean;
  name?: string;
  maxEntries?: number;
}

export interface ChangeValueOptions<T> {
  value: T;
  key?: string;
}

export interface FilterFunc<T> {
  (value: DataBase<T>, index: number, array: DataBase<T>[]): any;
  thisArg?: this;
}

export interface DataBase<T> {
  id: number;
  name: string;
  data: T | Record<string, T>;
}

export interface StowrageOptions {
  persistent?: boolean;
  name?: string;
  maxEntries?: number;
}

export interface ChangeValueOptions<T> {
  value: T;
  key?: string;
}

export interface Predicate<T> {
  (value: T, index: number, array: T[]): unknown;
  thisArg?: this;
}

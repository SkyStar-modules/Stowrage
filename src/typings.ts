// deno-lint-ignore-file
export interface DataBase<T> {
  id: number;
  name: string;
  data: T;
}

export interface StowrageOptions {
  saveToDisk?: boolean;
  name?: string;
  maxEntries?: number;
}

export interface ChangeValueOptions<T> {
  newValue: T;
  key?: string;
}

export interface SetValueOptions<T> extends ChangeValueOptions<T> {
  exactMatch?: boolean;
}

export interface FilterFunc<T> {
  (value: DataBase<T>, index: number, array: DataBase<T>[]): any;
  thisArg?: any;
}

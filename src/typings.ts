// deno-lint-ignore-file
export interface DataBase {
  id: number;
  name: string;
  data: any;
}

export interface StowrageOptions {
  saveToDisk?: boolean;
  name?: string;
  maxEntries?: number;
  autoSave?: number;
}

export interface ChangeValueOptions {
  key?: string;
}

export interface SetValueOptions extends ChangeValueOptions {
  exactMatch?: boolean;
}

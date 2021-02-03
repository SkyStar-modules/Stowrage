// deno-lint-ignore-file
export interface DataBase {
  id: number;
  name: string;
  data: any;
}

export interface EnmapOptions {
  saveToDisk?: boolean;
  name?: string;
  maxEntries?: number;
}

export interface ChangeValueOptions {
  key?: string;
}

export interface SetValueOptions extends ChangeValueOptions {
  exactMatch?: boolean;
}

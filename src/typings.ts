// deno-lint-ignore-file
export interface DataBase {
  id: number;
  name: string;
  data: any;
}

export interface EnmapOptions {
  filePath?: string;
  name?: string;
}

export interface ChangeValueOptions {
  key?: string
}

export interface SetValueOptions extends ChangeValueOptions {
  exactMatch?: boolean;
}
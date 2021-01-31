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

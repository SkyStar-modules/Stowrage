// Import sizeof module from deps
import { size, sizeof } from "../deps.ts";

import {
  IDNotFoundError,
  InvalidKeyError,
  KeyUndefinedError,
  NameDuplicationError,
  NameNotFoundError,
  ValueIsNotNumber,
} from "./error.ts";

// Import types from local typings.ts
import {
  ChangeValueOptions,
  FilterFunc,
  SetValueOptions,
  DataBase,
  StowrageOptions,
} from "./typings.ts";

/**
* stowrage class
@property { string | undefined } name - name of the Stowrage
@property { number | undefined } maxEntries - max Entries in the Stowrage
*/
export class Stowrage<DataType extends unknown> extends Map<string, DataBase<DataType>> {
  #id = 0;
  // private worker = new Worker(new URL("./worker.ts", import.meta.url).href, { type: "module" });
  private IDMap = new Map<number, string>();
  public maxEntries: number | undefined
  public name: string | undefined;
  /**
  @param { StowrageOptions } options - all start options for stowrage
  */
  public constructor(options?: StowrageOptions) {
    super();
    this.maxEntries = options?.maxEntries;
    this.name = options?.name;
    return;
  }

  // public async init(): Promise<void> {
  //   this.worker.postMessage("init");
  //   const initiated = new Promise<MessageEvent>((resolve) => {
  //     this.worker.onmessage = resolve;
  //   });
  //   await initiated;
  //   return;
  // }

  public ensure(name: string, key: DataType): DataBase<DataType> {
    const entry = this.generateEntry(name, key);
    this.IDMap.set(entry.id, name);
    super.set(name, entry);
    return entry;
  }

  public add(name: string, key: DataType): void {
    const entry = this.generateEntry(name, key);
    this.IDMap.set(entry.id, name);
    super.set(name, entry);
    return;
  }

  public deleteByID(id: number): void {
    this.deleteMapEntry(id);
    return;
  }
  
  public deleteByRange(start: number, length: number): void {
    for (let i = start; i < start + length; i++) {
      this.deleteMapEntry(i);
    }
    return;
  }
  public override(name: string, key:DataType) {
    const exist = super.has(name);
    if (exist) {
      const entry: DataBase<DataType> = this.generateEntry(name, key, true);
      super.set(name, entry);
    }
  }

  public overrideByID(id: number, key: DataType) {
    const name: string|undefined = this.IDMap.get(id);
    if (name) this.override(name, key);
  }
  public fetchByID(id: number): DataBase<DataType> | undefined {
    const name: string | undefined = this.IDMap.get(id);
    if (name) return super.get(name);
    return;
  }

  public fetchByRange(start: number, length: number): DataBase<DataType>[] {
    if (start + length >= super.size) return Array.from(super.values());
    const temp:DataBase<DataType>[] = [];
    for (const data of super.values()) {
      if (data.id > start + length) break;
      if (data.id < start) continue;
      temp.push(data);
    }
    return temp;
  }
  private deleteMapEntry(id?: number): void {
    let name: string|undefined = undefined;
    if (id) {
      name = this.IDMap.get(id);
      this.IDMap.delete(id);
    } else if (this.maxEntries) {
        name = this.IDMap.get(this.#id - this.maxEntries);
        this.IDMap.delete(this.#id - this.maxEntries);
    }
    if (name) super.delete(name);
    return;
  }

  private generateEntry(name: string, key: DataType, override?: boolean): DataBase<DataType> {
    let id: number;
    if (override) {
      id = super.get(name)!.id;
    } else {
      id = this.#id++
    }
      const obj: DataBase<DataType> = {
        id: id,
        name: name,
        data: key
      }
    if (this.maxEntries && this.size > this.maxEntries) {
      const name = this.IDMap.get(this.#id - this.maxEntries);
      if (name) super.delete(name);
    }
    return obj;
  }
}

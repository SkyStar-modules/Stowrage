import {
  IDNotFoundError,
  InvalidKeyError,
  KeyUndefinedError,
  NameDuplicationError,
  NameNotFoundError,
  ValueIsNotNumber,
} from "./error.ts";

import * as fs from "./filesystem.ts";

// Import types from local typings.ts
import {
  FilterFunc,
  SetValueOptions,
  DataBase,
  StowrageOptions,
} from "./typings.ts";

import { DB } from "../deps.ts";
/**
* stowrage class
@property { string | undefined } name - name of the Stowrage
@property { number | undefined } maxEntries - max Entries in the Stowrage
*/
export class Stowrage<DataType extends unknown> {
  #id = 0;
  #SQLDB: DB | undefined;
  #IDMap = new Map<number, string>();
  #DB = new Map<string, DataBase<DataType>>();
  public maxEntries: number | undefined
  public name: string | undefined;
  public path = "./stowrage";
  public fileLocation: string | undefined;
  public isPersistent: boolean | undefined = false;
  /**
  @param { StowrageOptions } options - all start options for stowrage
  */
  public constructor(options?: StowrageOptions) {
    this.maxEntries = options?.maxEntries;
    this.name = options?.name;
    this.isPersistent = options?.isPersistent;
    if (this.name && !fs.pathExistSync(this.path)) Deno.mkdirSync(this.path);
    return;
  }
  public async init(): Promise<void> {
    if (this.name && this.isPersistent) {
      this.#SQLDB = new DB(this.name + ".db");
      this.#SQLDB.query("CREATE TABLE IF NOT EXISTS stowrage (id INTEGER, name TEXT, data TEXT )");
      for await (const entry of this.#SQLDB.query("SELECT * FROM stowrage")) {
        this.#IDMap.set(entry.id, entry.name);
        this.#DB.set(entry.name, JSON.parse(entry.data));
      }
    } else {
      throw "Do not use init() if you don't have persistent data or a name selected!";
    }
    return;
  }
  public ensure(name: string, key: DataType): DataBase<DataType> {
    const entry = this.generateEntry(name, key);
    this.#IDMap.set(entry.id, name);
    this.#DB.set(name, entry);
    if (this.#SQLDB && this.isPersistent)
      this.#SQLDB.query("INSERT INTO stowrage (id, name, data) VALUES(?, ?, ?)", [entry.name, entry.name, JSON.stringify(entry.data)]);
    return entry;
  }

  public add(name: string, key: DataType): void {
    const entry = this.generateEntry(name, key);
    this.#IDMap.set(entry.id, name);
    this.#DB.set(name, entry);
    return;
  }
  public delete(name: string): void {
    const entry = this.#DB.get(name);
    if (!entry) throw new NameNotFoundError(name);
    this.#DB.delete(name);
    this.#IDMap.delete(entry.id);
    if (this.#SQLDB && this.isPersistent)
      this.#SQLDB.query("DELETE FROM stowrage WHERE id = ?", [entry.id]);
    return;
    
  }
  public deleteByID(id: number): void {
    const name = this.#IDMap.get(id);
    if (!name) throw new IDNotFoundError(id);
    this.#IDMap.delete(id);
    this.#DB.delete(name);
    if (this.#SQLDB && this.isPersistent)
      this.#SQLDB.query("DELETE FROM stowrage WHERE id = ?", [id]);
    return;
  }
  
  public deleteByRange(start: number, length: number): void {
    const range = start + length;
    if (range >= this.#DB.size) {
      this.#DB.clear();
      this.#IDMap.clear();
      this.#id = 0;
      if (this.#SQLDB && this.isPersistent) {
        this.#SQLDB.query("DROP TABLE stowrage");
        this.#SQLDB.query("CREATE TABLE stowrage (id INTEGER, name TEXT, data TEXT)");
      }
    } else {
      this.#DB = new Map([... this.#DB.entries()].filter((entry) => entry[1].id < start || entry[1].id > range));
      this.#IDMap = new Map([... this.#IDMap.entries()].filter((entry) => entry[0] < start || entry[0] > range));
      if (this.#SQLDB && this.isPersistent)
        this.#SQLDB.query("DELETE FROM stowrage WHERE id BETWEEN ? AND ?", [start, start + length]);
    }
    return;
  }
  public override(name: string, key:DataType): void {
    if (!this.#DB.has(name)) throw new NameNotFoundError(name);
    const entry: DataBase<DataType> = this.generateEntry(name, key, true);
    this.#DB.set(name, entry);
    if (this.#SQLDB && this.isPersistent) {
      this.#SQLDB.query("REPLACE INTO stowrage (id, name, data) VALUES(?, ?, ?)", [entry.id, entry.name, JSON.stringify(entry.data)])
    }
    return;
  }

  public overrideByID(id: number, key: DataType): void {
    const name: string|undefined = this.#IDMap.get(id);
    if (name) {
      this.override(name, key);
    } else {
      throw new IDNotFoundError(id);
    }
    return;
  }
  public filter(func: FilterFunc<DataType>): DataBase<DataType>[] {
    return [...this.#DB.values()].filter(func);
  }

  public fetch(name: string): DataBase<DataType> {
    const data = this.#DB.get(name);
    if (data) return data;
    throw new NameNotFoundError(name);
  }

  public fetchByID(id: number): DataBase<DataType> {
    const name: string | undefined = this.#IDMap.get(id);
    if (!name) throw new IDNotFoundError(id); 
    return this.#DB.get(name)!;
  }

  public fetchByRange(start: number, length: number): DataBase<DataType>[] {
    if (start + length >= this.#DB.size) return [...this.#DB.values()];
    return [...this.#DB.values()].filter(data => data.id >= start && data.id < start + length);
  }

  public setValue(id: number, options: SetValueOptions<unknown>): void
  public setValue(name: string, options: SetValueOptions<unknown>): void;
  public setValue(nameID:string|number, options: SetValueOptions<unknown>): void {
    if (typeof nameID === "number") nameID = this.#IDMap.get(nameID)!;
    if (!nameID && typeof nameID === "number") throw new IDNotFoundError(nameID);
    if (!nameID && typeof nameID === "string") throw new NameNotFoundError(nameID);
    const entry = this.#DB.get(nameID);
    if (typeof entry!.data === "object") {
      if (typeof options.key === "undefined") throw new KeyUndefinedError();
      if (typeof (entry!.data as Record<string, DataType>)[options.key] === "undefined") throw new InvalidKeyError(options.key, this.name ?? "unnamed db");
      (entry!.data as Record<string, DataType>)[options.key]
    } else {
      (entry!.data as unknown) = options.value;
    }
    this.override(nameID, entry!.data as DataType);
    return;
  }

  public totalEntries(): number {
    return this.#DB.size;
  }

  private generateEntry(name: string, key: DataType, override?: boolean): DataBase<DataType> {
    let id: number;
    if (override) {
      id = this.#DB.get(name)!.id;
    } else {
      id = this.#id++;
    }
      const obj: DataBase<DataType> = {
        id: id,
        name: name,
        data: key
      }
    if (this.#SQLDB && this.isPersistent)
      this.#SQLDB.query("INSERT INTO stowrage (id, name, data) VALUES(?, ?, ?)", [obj.id, obj.name, JSON.stringify(obj.data)]);
    
    if (this.maxEntries && this.#DB.size > this.maxEntries) {
      const name = this.#IDMap.get(this.#id - this.maxEntries);
      if (name) this.#DB.delete(name);
      if (this.#SQLDB && this.isPersistent)
        this.#SQLDB.query("DELETE FROM stowrage WHERE name = ?", [name]);
    }
    return obj;
  }
}

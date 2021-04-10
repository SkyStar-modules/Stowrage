// Import errors
import {
  IDNotFoundError,
  InvalidKeyError,
  KeyUndefinedError,
  NameDuplicationError,
  NameNotFoundError,
  nonPersistentError,
} from "./error.ts";

// Import SQLite
import { DB } from "../deps.ts";

// Import types
import type {
  ChangeValueOptions,
  DataBase,
  Predicate,
  StowrageOptions,
} from "./typings.ts";

import type { PreparedQuery } from "../deps.ts";

/**
* Stowrage class
@property { number | null } maxEntries - max Entries in the Stowrage
@property { string | undefined } name - name of the Stowrage
@property { string } path - Directory for persistent data
@property { boolean } isPersistent - Enable or disable persistent storage
*/
export class Stowrage<DataType = unknown> {
  #id = 0;
  #SQLDB: DB | undefined;
  #IDMap = new Map<number, string>();
  #DB = new Map<string, DataBase<DataType>>();
  #query: PreparedQuery | undefined;
  public maxEntries: number | null;
  public name: string | undefined;
  public path = "./stowrage/";
  public isPersistent: boolean;

  /**
  @param { StowrageOptions } options - all start options for stowrage
  */
  public constructor(options?: StowrageOptions) {
    this.maxEntries = options?.maxEntries ?? null;
    this.name = options?.name;
    this.isPersistent = options?.persistent ?? false;
    if (this.name) {
      try {
        Deno.mkdirSync(this.path);
      } catch (e) {
        if (!(e instanceof Deno.errors.AlreadyExists)) throw e;
      }
    }
    return;
  }

  /**
  Initiate persistent storage
  Throw's when `isPersistent` = false
  */
  public async init(): Promise<void> {
    if (this.name && this.isPersistent) {
      this.#SQLDB = new DB(this.path + this.name + ".db");
      this.#SQLDB.query(
        "CREATE TABLE IF NOT EXISTS stowrage (id INTEGER, name TEXT, data TEXT )",
      );
      this.#query = this.#SQLDB.prepareQuery(
        "INSERT INTO stowrage (id, name, data) VALUES(?, ?, ?)",
      );
      for await (
        const [name, data] of this.#SQLDB.query(
          "SELECT name, data FROM stowrage",
        )
      ) {
        if (this.#DB.has(name)) throw new NameDuplicationError(name);
        const entry = this.generateEntry(name, data, false, true);
        this.#IDMap.set(entry.id, name);
        this.#DB.set(name, entry);
      }
    } else throw new nonPersistentError(this.name ?? "unnamed db", "initiated");
    return;
  }

  /**
  Add entry to db and returns it aswell
  @param { string } name - Name for the entry
  @param { DataType } value - Value that you want to store (Can be anything)
  @returns { DataBase<DataType> } - Returns entry after it has been added
  */
  public ensure(name: string, value: DataType): DataBase<DataType> {
    if (this.#DB.has(name)) throw new NameDuplicationError(name);
    const entry = this.generateEntry(name, value);
    this.#IDMap.set(entry.id, name);
    this.#DB.set(name, entry);
    return entry;
  }

  /**
  Add entry to db
  @param { string } name - Name for the entry
  @param { DataType } value - Value that you want to store (Can be anything)
  */
  public add(name: string, key: DataType): void {
    if (this.#DB.has(name)) throw new NameDuplicationError(name);
    const entry = this.generateEntry(name, key);
    this.#IDMap.set(entry.id, name);
    this.#DB.set(name, entry);
    return;
  }

  /**
  Delete entry from db by name
  @param { string } name - Name of the entry you want to delete
  */
  public delete(name: string): void {
    const entry = this.#DB.get(name);
    if (!entry) throw new NameNotFoundError(name);
    this.#DB.delete(name);
    this.#IDMap.delete(entry.id);
    if (this.#SQLDB && this.isPersistent) {
      this.#SQLDB.query("DELETE FROM stowrage WHERE id = ?", [entry.id]);
    }
    return;
  }

  /**
  Delete entry from db by ID
  @param { number } id - ID of the entry you want to delete
  */
  public deleteByID(id: number): void {
    const name = this.#IDMap.get(id);
    if (!name) throw new IDNotFoundError(id);
    this.#IDMap.delete(id);
    this.#DB.delete(name);
    if (this.#SQLDB && this.isPersistent) {
      this.#SQLDB.query("DELETE FROM stowrage WHERE id = ?", [id]);
    }
    return;
  }

  /**
  Delete multiple entries from db
  @param { number } start - First entry you want to delete
  @param { number } length - Length to delete
  */
  public deleteByRange(start: number, length: number): void {
    const range = start + length;
    if (range >= this.#DB.size) {
      this.#DB.clear();
      this.#IDMap.clear();
      this.#id = 0;
      if (this.#SQLDB && this.isPersistent) {
        this.#SQLDB.query("DELETE FROM stowrage");
      }
    } else {
      for (let i = start; i <= range; i++) {
        const name = this.#IDMap.get(i);
        this.#DB.delete(name!);
        this.#IDMap.delete(i);
      }
      if (this.#SQLDB && this.isPersistent) {
        this.#SQLDB.query("DELETE FROM stowrage WHERE id BETWEEN ? AND ?", [
          start,
          range,
        ]);
      }
    }
    return;
  }

  /**
  Override entry from db by name
  @param { string } name - Name of the entry you want to delete
  @param { DataType } newValue - New value you want to store
  */
  public override(name: string, newValue: DataType): void {
    if (!this.#DB.has(name)) throw new NameNotFoundError(name);
    const entry: DataBase<DataType> = this.generateEntry(name, newValue, true);
    this.#DB.set(name, entry);
    if (this.#SQLDB && this.isPersistent) {
      this.#SQLDB.query(
        "REPLACE INTO stowrage (id, name, data) VALUES(?, ?, ?)",
        [entry.id, entry.name, JSON.stringify(entry.data)],
      );
    }
    return;
  }

  /**
  Override entry from db by name
  @param { string } name - Name of the entry you want to delete
  @param { DataType } newValue - New value you want to store
  */
  public overrideByID(id: number, key: DataType): void {
    const name: string | undefined = this.#IDMap.get(id);
    if (!name) throw new IDNotFoundError(id);
    this.override(name, key);
    return;
  }

  /**
  Get an Array of entries that matches your filter
  @param { Predicate<DataType> } func - FilterFunction
  @returns { DataBase<DataType>[] } - Returns Array with filtered entries
  */
  public filter(func: Predicate<DataBase<DataType>>): DataBase<DataType>[] {
    return [...this.#DB.values()].filter(func);
  }

  /**
  Get the first entry that matches your filter
  @param { Predicate<DataType> } func - FilterFunction
  @returns { DataBase<DataType> | undefined } - Returns first match found or undefined if no match is found
  */
  public find(
    func: Predicate<DataBase<DataType>>,
  ): DataBase<DataType> | undefined {
    return [...this.#DB.values()].find(func);
  }

  /**
  Fetch entry by name
  @param { string } name - Name of the entry you want to fetch
  @returns { DataBase<DataType> } - Returns the entry that matches the name or throws
  */
  public fetch(name: string): DataBase<DataType> {
    const data = this.#DB.get(name);
    if (!data) throw new NameNotFoundError(name);
    return data;
  }

  /**
  Fetch entry by ID
  @param { number } id - ID of the entry you want to fetch
  @returns { DataBase<DataType> } - Returns the entry that matches the ID or throws
  */
  public fetchByID(id: number): DataBase<DataType> {
    const name: string | undefined = this.#IDMap.get(id);
    if (!name) throw new IDNotFoundError(id);
    return this.fetch(name);
  }

  /**
  Fetch multiple entries from db
  @param { number } start - First entry you want to fetch
  @param { number } length - Length to fetch
  @returns { DataBase<DataType>[] } - Returns Array 
  */
  public fetchByRange(start: number, length: number): DataBase<DataType>[] {
    if (start < 0) throw RangeError("Starting point cannot be lower than 0");
    if (length < 1) throw RangeError("Length is smaller than 1");
    const range = start + length;
    if (range >= this.#DB.size) return [...this.#DB.values()];
    return [...this.#DB.values()].filter((data) =>
      data.id >= start && data.id < range
    );
  }

  /**
  Set the value of an entry via ID
  @param { number } id - ID of the entry to change value of
  @param { ChangeValueOptions<unknown> } options - Extra options like key and value
  */
  public setValue(id: number, options: ChangeValueOptions<unknown>): void;

  /**
  Set the value of an entry via ID
  @param { string } name - Name of the entry to change value of
  @param { ChangeValueOptions<unknown> } options - Extra options like key and value
  */
  public setValue(name: string, options: ChangeValueOptions<unknown>): void;
  public setValue(
    nameID: string | number,
    options: ChangeValueOptions<unknown>,
  ): void {
    if (typeof nameID === "number") nameID = this.#IDMap.get(nameID)!;
    if (!nameID) {
      if (typeof nameID === "string") throw new NameNotFoundError(nameID);
      else throw new IDNotFoundError(nameID);
    }
    const entry = this.#DB.get(nameID);
    if (typeof entry!.data === "object") {
      if (typeof options.key === "undefined") throw new KeyUndefinedError();
      if (
        typeof (entry!.data as Record<string, DataType>)[options.key] ===
          "undefined"
      ) {
        throw new InvalidKeyError(options.key, this.name ?? "unnamed db");
      }
      (entry!.data as Record<string, unknown>)[options.key] = options.value;
    } else {
      (entry!.data as unknown) = options.value;
    }
    this.override(nameID, entry!.data as DataType);
    return;
  }

  /**
  Check if your stowrage has an entry with the given name
  @param { string } searchName - Name to look for
  @returns { boolean } - Returns true or false
  */
  public has(name: string): boolean {
    return this.#DB.has(name);
  }

  /**
  Delete the whole stowrage
  */
  public deleteStowrage(): void {
    this.#DB.clear();
    this.#IDMap.clear();
    this.#id = 0;
    if (this.isPersistent && this.#SQLDB) {
      this.#SQLDB.query("DELETE FROM stowrage");
    }
    return;
  }

  /**
  Close SQLite database if it exists
  */
  public close(): void {
    if (!this.#SQLDB || !this.#query) {
      throw new nonPersistentError(this.name ?? "unnamed db", "closed");
    }
    this.#query.finalize();
    this.#SQLDB.close();
    return;
  }

  /**
  Get total entries of the Stowrage
  */
  public totalEntries(): number {
    return this.#DB.size;
  }

  private generateEntry(
    name: string,
    key: DataType,
    override?: boolean,
    init?: boolean,
  ): DataBase<DataType> {
    let id: number;
    if (override) {
      id = this.#DB.get(name)!.id;
    } else {
      id = this.#id++;
    }
    const obj: DataBase<DataType> = {
      id: id,
      name: name,
      data: key,
    };
    if (!override || !init) {
      if (this.#SQLDB && this.isPersistent && this.#query) {
        this.#query([obj.id, obj.name, JSON.stringify(obj.data)]);
      }
      if (this.maxEntries && this.#DB.size > this.maxEntries) {
        const name = this.#IDMap.get(this.#id - this.maxEntries);
        if (name) this.#DB.delete(name);
        if (this.#SQLDB && this.isPersistent) {
          this.#SQLDB.query("DELETE FROM stowrage WHERE name = ?", [name]);
        }
      }
    }
    return obj;
  }
}

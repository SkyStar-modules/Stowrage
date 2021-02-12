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
  DataBase,
  FilterFunc,
  SetValueOptions,
  StowrageOptions,
} from "./typings.ts";

// Import load and save features
import { load, save } from "./save.ts";

// Import filesystem features
import { pathExist, pathExistSync } from "./filesystem.ts";

// Storage url
const stowrageURL = Deno.cwd() + "/stowrage";

/**
* stowrage class
@property { string | undefined } saveLocation - path where persistent data will be stored
@property { string | undefined } name - name of the .stowrage file
@property { number | undefined } autoSave - amount of time before autosave automatically saves the file(use this if you use the add and ensure method alot)
*/
export class Stowrage<DataType extends unknown> {
  #DB: DataBase<DataType>[] = [];
  #id = 0;
  public maxEntries: number | undefined
  public saveLocation: string | undefined;
  public name: string | undefined;

  /**
  @param { StowrageOptions } options - all start options for stowrage
  */
  public constructor(options?: StowrageOptions) {
    this.maxEntries = options?.maxEntries;
    this.name = options?.name;
    this.saveLocation = (options?.saveToDisk && this.name)
      ?
        stowrageURL + "/" + this.name.toLowerCase() + ".stow"
      : undefined;
    if (!pathExistSync(stowrageURL)) Deno.mkdirSync(stowrageURL);
    return;
  }

  /**
  * Initiate stowrage
  */
  public async init(): Promise<void> {
    if (this.name && this.saveLocation) {
      if (!await pathExist(stowrageURL)) await Deno.mkdir(stowrageURL);
      if (await pathExist(this.saveLocation)) {
        this.#DB = await load<DataBase<DataType>>(this.name, this.saveLocation);
        this.#id = this.totalEntries();
      }
    }
    return;
  }

  /**
  * Add an entry to stowrage and return it
  @param { string } name - The name of the data you want
  @param { DataType } data - The item you want to store
  @returns { Promise<DataBase<DataType>> } return's the same data as you stored
  */

  // deno-fmt-ignore
  public async ensure(name: string, data: DataType): Promise<DataBase<DataType>> {
    return await this.generateEntry(name, data);
  }

  /**
  * Add an entry to the stowrage
  @param { string } name - The name of the data you want
  @param { DataType } data - The item you want to store
  */
  public async add(name: string, data: DataType): Promise<void> {
    await this.generateEntry(name, data);
    return;
  }

  /**
  * Override an entry in the stowrage
  * NOTE: the override will keep the id
  @param { number } id - The id of the entry to override
  @param { DataType } data - The item you want to store
  @param { string } newName - The new name for the entry
  */

  // deno-fmt-ignore
  public async override(id: number, data: DataType, newName?: string): Promise<void>;

  /**
  Override an entry in the stowrage
  NOTE: the override will keep the id
  @param { string } searchName - The name of the entry to override
  @param { DataType } data - The item you want to store
  @param { string } newName - The new name for the entry
  */

  // deno-fmt-ignore
  public async override(searchName: string, data: DataType, newName?: string): Promise<void>;

  // deno-fmt-ignore
  public async override(IDName: number | string, data: DataType, newName?: string): Promise<void> {
    const index = this.#DB.findIndex((value) => value.name === IDName.toString() || value.id === IDName);

    interface key extends DataBase<DataType> {
      data: DataType;
    }
    if (index > -1) {
      const KEY: key = {
        id: this.#DB[index].id,
        name: (newName) ? newName : this.#DB[index].name,
        data
      };
      this.#DB[index] = KEY;
      await this.saveToDisk();
    } else {
      throw (typeof IDName === "string") ? new NameNotFoundError(IDName) : new IDNotFoundError(IDName);
    }
    return;
  }

  /**
  set the value of an entry via a name or id
  @param { string } name - Name of the entry to search for
  @param { SetValueOptions } options - Extra options
  */

  // deno-fmt-ignore
  public async setValue(name: string, options: SetValueOptions<unknown>): Promise<void>;

  /**
  set the value of an entry via a name or id
  @param { number } id - ID of the entry to search for
  @param { ChangeValueOptions } options - options for setValue
  */

  // deno-fmt-ignore
  public async setValue(id: number, options: ChangeValueOptions<unknown>): Promise<void>;

  // deno-fmt-ignore
  public async setValue(IDName: number | string, options: SetValueOptions<unknown>): Promise<void> {
    let index = -1;
    index = this.#DB.findIndex((value) => value.id === IDName || (options.exactMatch && value.name === IDName) || value.name.includes(IDName.toString()));
    if (index > -1) {
      if (typeof this.#DB[index].data === "object") {
        if (options.key) {
          if (typeof (this.#DB[index].data as any)[options.key] !== "undefined") {
            (this.#DB[index].data as any)[options.key] = options.newValue;
          } else {
            throw new InvalidKeyError(options.key, this.name ?? "no name db");
          }
        } else {
          throw new KeyUndefinedError();
        }
      } else if (typeof this.#DB[index].data !== "undefined") {
        (this.#DB[index].data as unknown) = options.newValue;
      }
      await this.saveToDisk();
    } else {
      throw (typeof IDName === "string") ? new NameNotFoundError(IDName) : new IDNotFoundError(IDName);
    }
    return;
  }

  /**
  Increase value by name
  @param { string } name - Name of the entry to search for
  @param { string } key - The key you want to increment the value of
  */
  public async incValue(name: string, key?: string): Promise<void>;

  /**
  Increase value by ID
  @param { number } id - ID of the entry to search for
  @param { string } key - The key you want to increment the value of
  */
  public async incValue(id: number, key?: string): Promise<void>;

  public async incValue(IDName: number | string, key?: string): Promise<void> {
    let index = -1;
    index = this.#DB.findIndex((value) =>
      value.id === IDName || value.name === IDName
    );
    if (index > -1) {
      if (key) {
        if (typeof (this.#DB[index].data as any)[key] === "number") {
          ((this.#DB[index].data as any)[key] as number)++;
        } else if (
          typeof ((this.#DB[index].data as any)[key]) === "undefined"
        ) {
          throw new InvalidKeyError(key, this.name ?? "`no name table`");
        }
      } else if (typeof this.#DB[index].data === "number") {
        (this.#DB[index].data as number)++;
      } else {
        throw new ValueIsNotNumber(this.#DB[index].data);
      }
      await this.saveToDisk();
    } else {
      throw (typeof IDName === "string")
        ? new NameNotFoundError(IDName)
        : new IDNotFoundError(IDName);
    }
    return;
  }

  /**
  Fetch entry by ID
  @param { number } id - ID of the entry you want to fetch
  @returns { Promise<DataBase<DataType> | undefined> } return's the entry or undefined if not found
  */
  public async fetch(id: number): Promise<DataBase<DataType> | undefined>;

  /**
  Fetch entry by name
  @param { string } name - Name of the entry you want to fetch
  @param { boolean } exactMatch - optional: allow the search to be an exact match
  @returns { Promise<DataBase<DataType> | undefined> } return's the entry or undefined if not found
  */

  // deno-fmt-ignore
  public async fetch(name: string, exactMatch?: boolean): Promise<DataBase<DataType> | undefined>;

  // deno-fmt-ignore
  public async fetch(IDName: number | string, exactMatch?: boolean): Promise<DataBase<DataType> | undefined> {
    let index = -1;
    index = await new Promise<number>((resolve) => {
      resolve(this.#DB.findIndex((value) => value.id === IDName || (exactMatch && value.name === IDName) || value.name.includes(IDName.toString())));
    });
    return this.#DB[index];
  }

  /**
  Fetch all entries by a range of id's
  @param { number } begin - The first ID to fetch
  @param { number } length - Length of the list
  @returns { Promise<DataBase<DataType>[]> } Returns an array with all entries found, return empty array if no entries were found
  */

  // deno-fmt-ignore
  public async fetchByRange(begin: number, length: number): Promise<DataBase<DataType>[]> {
    if (length === this.#DB.length) return this.#DB;
    const data: DataBase<DataType>[] = await new Promise<DataBase<DataType>[]>((resolve) =>
      resolve(
        this.#DB.filter((value) =>
          value.id >= begin && value.id < (begin + length)
        ),
      )
    );
    return data;
  }

  /**
  Delete entry by ID
  @param { number } id - ID of the entry you want to fetch
  */
  public async delete(id: number): Promise<void>;

  /**
  Delete entry by name
  @param { string } name - Name of the entry you want to fetch
  @param { boolean } exactMatch - optional: allow the search to be an exact match
  */
  public async delete(name: string, exactMatch?: boolean): Promise<void>;

  // deno-fmt-ignore
  public async delete(IDName: number | string, exactMatch?: boolean): Promise<void> {
    let index = -1;
    index = this.#DB.findIndex((value) => value.id === IDName || (exactMatch && value.name === IDName) || value.name.includes(IDName.toString()));
    if (index > -1) {
      this.#DB.splice(index, 1);
      await this.saveToDisk();
    } else {
      throw (typeof IDName === "string") ? new NameNotFoundError(IDName) : new IDNotFoundError(IDName);
    }
    return;
  }

  /**
  Delete entries in a specific range
  @param { number } begin - The first ID to fetch
  @param { number } length - Length of the list
  */
  public async deleteByRange(begin: number, length: number): Promise<void> {
    this.#DB.splice(begin, length);
    await this.saveToDisk();
    return;
  }

  /**
  Filter through stowrage
  @param { FilterFunc } filter- Custom filter you want to use
  @returns { Promise<DataBase<DataType>[]> } return's an array of the matching entries
  */

  // deno-fmt-ignore
  public async filter(filter: FilterFunc<DataType>): Promise<DataBase<DataType>[]> {
    return await new Promise((resolve) => resolve(this.#DB.filter(filter)));
  }

  /**
  Find the first entry with your specific filter
  @param { FilterFunc } filter - Custom filter you want to use
  @returns { Promise<DataBase<DataType> | undefined> } return's the first match of the entry
  */

  // deno-fmt-ignore
  public async find(filter: FilterFunc<DataType>): Promise<DataBase<DataType> | undefined> {
    return await new Promise((resolve) => resolve(this.#DB.find(filter)));
  }

  /**
  Check if your stowrage has an entry with the given name
  @param { string } searchName - name to search for
  @returns { Promise<boolean> } returns a boolean
  */
  public async has(searchName: string): Promise<boolean> {
    return await new Promise((resolve) =>
      resolve(this.#DB.findIndex((value) => value.name === searchName) > -1)
    );
  }

  /**
  Delete every entry in the stowrage and remove it from disk
  */
  public async deleteStowrage(): Promise<void> {
    this.#DB = [];
    this.#id = 0;
    if (this.saveLocation) await Deno.remove(this.saveLocation);
    return;
  }

  /**
  * Get the size of the stowrage
  */
  public stowrageSize(): size {
    return sizeof(this.#DB);
  }

  /**
  Get total entries in the stowrage 
  */
  public totalEntries(): number {
    return this.#DB.length;
  }

  /**
  Save #DB on disk
  */
  private async saveToDisk(): Promise<void> {
    if (this.maxEntries && this.totalEntries() > this.maxEntries) {
      this.#DB.splice(0, 1);
    }
    if (this.name && this.saveLocation) {
      await save<DataBase<DataType>>(this.name, this.saveLocation, this.#DB);
    }
    return;
  }

  /**
  generate Entry OBJ & return it
  */

  // deno-fmt-ignore
  private async generateEntry(name: string, data: DataType): Promise<DataBase<DataType>> {
    interface key extends DataBase<DataType> {
      data: DataType;
    }
    const prom: Promise<void> = new Promise<void>((resolve) => {
      const DBSIZE = this.#DB.length;
      for (let i = 0; i < DBSIZE; i++) {
        if (name === this.#DB[i].name) throw new NameDuplicationError(name);
      }
      resolve();
    });
    const KEY: key = {
      id: this.#id++,
      name: name,
      data,
    };
    await prom;
    this.#DB.push(KEY);
    await this.saveToDisk();
    return KEY;
  }
}

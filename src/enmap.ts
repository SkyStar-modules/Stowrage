// Import sizeof module from deps
import { size, sizeof } from "../deps.ts";

// Import types from local typings.ts
import {
  ChangeValueOptions,
  DataBase,
  EnmapOptions,
  SetValueOptions,
} from "./typings.ts";

// Import load and save features
import { load, save } from "./save.ts";

// Import filesystem features
import { fileExistSync } from "./filesystem.ts";

/**
* Enmap class
@property { string | undefined } saveLocation path where persistent data will be stored
@property { string | undefined } name name of the .enmap file
*/
export class Enmap<DataType> {
  #DB: DataBase[] = [];
  #i = 0;
  public maxEntries: number | undefined;
  public saveLocation: string | undefined;
  public name: string | undefined;
  /**
  @param { EnmapOptions } options all start options for enmap
  */
  public constructor(options?: EnmapOptions) {
    this.maxEntries = options?.maxEntries;
    this.name = options?.name;
    this.saveLocation = (options?.filePath && this.name)
      ? options.filePath + "/" + this.name + ".enmap"
      : undefined;
    if (this.name && this.saveLocation) {
      if (fileExistSync(this.saveLocation)) {
        this.#DB = load<DataBase>(this.name, this.saveLocation);
      }
    }
    return;
  }

  /**
  * Add an entry to enmap and return it
  @param { string } name The name of the data you want
  @param { DataType } data The item you want to store
  @returns { DataType } Return's the same data as you stored
  */
  public async ensure(name: string, data: DataType): Promise<DataType> {
    interface key extends DataBase {
      data: DataType;
    }
    const KEY: key = {
      id: this.#i++,
      name: name.toLowerCase(),
      data,
    };

    this.#DB.push(KEY);
    await this.saveToDisk();
    return KEY.data;
  }
  /**
  * Add an entry to the enmap
  @param { string } name The name of the data you want
  @param { DataType } data The item you want to store
  */
  public async add(name: string, data: DataType): Promise<void> {
    interface key extends DataBase {
      data: DataType;
    }

    const KEY: key = {
      id: this.#i++,
      name: name.toLowerCase(),
      data,
    };

    this.#DB.push(KEY);
    await this.saveToDisk();
    return;
  }

  /**
  * Override an entry in the enmap
  * NOTE: the override will keep the id
  @param { number } id The id of the entry to override
  @param { string } newName The new name for the entry
  @param { DataType } data The item you want to store
  */
  // deno-fmt-ignore
  public async override(id: number, data: DataType, newName?: string): Promise<void>;

  /**
  Override an entry in the enmap
  NOTE: the override will keep the id
  @param { string } searchName The name of the entry to override
  @param { string } newName The new name for the entry
  @param { DataType } data The item you want to store
  */
  // deno-fmt-ignore
  public async override(searchName: string, data: DataType, newName?: string): Promise<void>;
  // deno-fmt-ignore
  public async override(IDName: number | string, data: DataType, newName?: string): Promise<void> {
    const index = (typeof IDName === "string")
      ? this.#DB.findIndex((value) => value.name === IDName.toLowerCase())
      : this.#DB.findIndex((value) => value.id === IDName);

    interface key extends DataBase {
      data: DataType;
    }
    if (index > -1) {
      const KEY: key = {
        id: this.#DB[index].id,
        name: (newName) ? newName.toLowerCase() : this.#DB[index].name,
        data
      };
      this.#DB[index] = KEY;
      await this.saveToDisk();
    } else {
      console.warn("could not find an entry with the given name or id!");
    }
    return;
  }

  /**
  set the value of an entry via a name or id
  @param { string } name Name of the entry to search for
  @param { unknown } value The new value that you want to store
  @param { SetValueOptions } extraOptions Extra options
  */
  // deno-fmt-ignore
  public async setValue(name: string, value: unknown, extraOptions?: SetValueOptions): Promise<void>;

  /**
  set the value of an entry via a name or id
  @param { number } id ID of the entry to search for
  @param { unknown } value The new value that you want to store
  @param { ChangeValueOptions } extraOptions Extra options
  */
  // deno-fmt-ignore
  public async setValue(id: number, value: unknown, extraOptions?: ChangeValueOptions): Promise<void>;
  // deno-fmt-ignore
  public async setValue(IDName: number | string, value: unknown, extraOptions?: SetValueOptions): Promise<void> {
    let index = -1;
    if (typeof IDName === "string") IDName = IDName.toLowerCase();
    index = (typeof IDName === "number") ? this.#DB.findIndex((value) => value.id === IDName) : ((extraOptions?.exactMatch) ? this.#DB.findIndex((value) => value.name === IDName) : this.#DB.findIndex((value) => value.name.includes(IDName.toString())));
    if (index > -1) {
      if (typeof this.#DB[index].data === "object") {
        if (extraOptions?.key) {
          this.#DB[index].data[extraOptions.key] = value;
        } else {
          console.warn("key is undefined! failed changing value");
        }
      } else {
        this.#DB[index].data = value;
      }
      await this.saveToDisk();
    }
    return;
  }

  /**
  Increase value by name
  @param { string } name Name of the entry to search for
  @param { string } key The key you want to increment the value of
  */
  public async incValue(name: string, key?: string): Promise<void>;

  /**
  Increase value by ID
  @param { number } id ID of the entry to search for
  @param { string } key The key you want to increment the value of
  */
  public async incValue(id: number, key?: string): Promise<void>;
  public async incValue(IDName: number | string, key?: string): Promise<void> {
    let index = -1;
    if (typeof IDName === "number") {
      index = this.#DB.findIndex((value) => value.id === IDName);
    }
    if (typeof IDName === "string") {
      IDName = IDName.toLowerCase();
      index = this.#DB.findIndex((value) => value.name === IDName);
    }
    if (key && typeof this.#DB[index].data[key] === "number") {
      this.#DB[index].data[key]++;
    } else {
      this.#DB[index].data++;
    }
    await this.saveToDisk();
    return;
  }

  /**
  Fetch entry by ID
  @param { number } id ID of the entry you want to fetch
  @returns { DataBase | undefined } return's the entry or undefined if not found
  */
  public async fetch(id: number): Promise<DataBase | undefined>;

  /**
  Fetch entry by name
  @param { string } name Name of the entry you want to fetch
  @param { boolean } exactMatch optional: allow the search to be an exact match
  @returns { DataBase | undefined } return's the entry or undefined if not found
  */
  // deno-fmt-ignore
  public async fetch(name: string, exactMatch?: boolean): Promise<DataBase | undefined>;
  // deno-fmt-ignore
  public async fetch(IDName: number | string, exactMatch?: boolean): Promise<DataBase | undefined> {
    let index = -1;
    if (typeof IDName === "string") IDName = IDName.toLowerCase();
      index = await new Promise<number>((resolve) => resolve(this.#DB.findIndex((value) => value.id === IDName || (exactMatch && value.name === IDName) || value.name.includes(IDName.toString()))));
    return this.#DB[index];
  }

  /**
  Fetch all entries by a range of id's
  @param { number } begin The first ID to fetch
  @param { number } length Length of the list
  @returns { Promise<DataBase[] | undefined> } Returns an array with all entries found, or undefined if no entries were found
  */
  // deno-fmt-ignore
  public async fetchByRange(begin: number, length: number): Promise<DataBase[] | undefined> {
    const data: DataBase[] = await new Promise<DataBase[]>((resolve) =>
      resolve(
        this.#DB.filter((value) =>
          value.id >= begin && value.id <= (begin + length)
        ),
      )
    );
    if (data.length === 0) return undefined;
    return data;
  }

  /**
  Delete entry by ID
  @param { number } id ID of the entry you want to fetch
  */
  public async delete(id: number): Promise<void>;

  /**
  Delete entry by name
  @param { string } name Name of the entry you want to fetch
  @param { boolean } exactMatch optional: allow the search to be an exact match
  */
  public async delete(name: string): Promise<void>;
  // deno-fmt-ignore
  public async delete(IDName: number | string, exactMatch?: boolean): Promise<void> {
    let index = -1;
    if (typeof IDName === "string") {
      index = (exactMatch)
        ? this.#DB.findIndex((value) => value.name === IDName.toLowerCase())
        : this.#DB.findIndex((value) => value.name.includes(IDName));
    } else {
      index = this.#DB.findIndex((value) => value.id === IDName);
    }
    if (index > -1) {
      this.#DB.splice(index, 1);
      await this.saveToDisk();
    }
    return;
  }

  /**
  Delete entries in a specific range
  @param { number } begin The first ID to fetch
  @param { number } length Length of the list
  */
  public async deleteByRange(begin: number, length: number): Promise<void> {
    this.#DB.splice(begin, length);
    await this.saveToDisk();
    return;
  }

  /**
  Delete every entry in the enmap and remove it from disk
  */
  public async deleteEnmap(): Promise<void> {
    this.#DB = [];
    if (this.saveLocation) await Deno.remove(this.saveLocation);
    return;
  }

  /**
  * Get the size of the Enmap
  */
  public EnmapSize(): size {
    return sizeof(this.#DB);
  }

  /**
  * Get total entries in the Enmap 
  */
  public TotalEntries(): number {
    return this.#DB.length;
  }

  /**
  * Save #DB on disk
  */
  private async saveToDisk(): Promise<void> {
    if (this.maxEntries && this.TotalEntries() > this.maxEntries) {
      this.#DB.splice(0, 1);
    }
    if (this.name && this.saveLocation) {
      await save<DataBase>(this.name, this.saveLocation, this.#DB);
    }
    return;
  }
}

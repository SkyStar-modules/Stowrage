import sizeof, { size } from "https://deno.land/x/sizeof@v1.0.2/mod.ts";

import { DataBase, EnmapOptions } from "./typings.ts";
import { load, save } from "./save.ts";
import { fileExistSync } from "./fileSystem.ts";

/**
* Enmap class
@property { string | undefined } saveLocation path where persistent data will be stored
@property { string | undefined } name name of the .enmap file
*/
export class Enmap<DataType> {
  #DB: DataBase[] = [];
  #i = 0;
  public saveLocation: string | undefined;
  public name: string | undefined;

  /**
  @param { EnmapOptions } options all start options for enmap
  */
  public constructor(options?: EnmapOptions) {
    this.name = (options?.name) ? options.name : undefined;
    this.saveLocation = (options?.filePath && this.name)
      ? options.filePath + "/" + this.name + ".enmap"
      : undefined;
    if (this.name && this.saveLocation) {
      if (fileExistSync(this.saveLocation)) {
        this.#DB = load<DataBase[]>(this.name, this.saveLocation);
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
  public ensure(name: string, data: DataType): DataType {
    interface key extends DataBase {
      data: DataType;
    }
    const KEY: key = {
      id: this.#i++,
      name: name.toLowerCase(),
      data,
    };

    this.#DB.push(KEY);
    this.saveToDisk();
    return KEY.data;
  }
  /**
  * Add an entry to the enmap
  @param { string } name The name of the data you want
  @param { DataType } data The item you want to store
  */
  public add(name: string, data: DataType): void {
    interface key extends DataBase {
      data: DataType;
    }

    const KEY: key = {
      id: this.#i++,
      name: name.toLowerCase(),
      data,
    };

    this.#DB.push(KEY);
    this.saveToDisk();
    return;
  }

  /**
  * Override an entry in the enmap
  * NOTE: the override will keep the id
  @param { number } id The id of the entry to override
  @param { string } newName The new name for the entry
  @param { DataType } data The item you want to store
  */
  public override(id: number, newName: string, data: DataType): void;

  /**
  Override an entry in the enmap
  NOTE: the override will keep the id
  @param { string } searchName The name of the entry to override
  @param { string } newName The new name for the entry
  @param { DataType } data The item you want to store
  */
  public override(searchName: string, newName: string, data: DataType): void;
  // deno-fmt-ignore
  public override(IDName: number | string, newName: string, data: DataType): void {
    const index = (typeof IDName === "string")
      ? this.#DB.findIndex((value) => value.name === IDName)
      : this.#DB.findIndex((value) => value.id === IDName);

    interface key extends DataBase {
      data: DataType;
    }
    if (index > -1) {
      const KEY: key = {
        id: this.#DB[index].id,
        name: newName.toLowerCase(),
        data
      };
      this.#DB[index] = KEY;
    } else {
      console.warn("could not find an entry with the given name or id!");
    }
    this.saveToDisk();
    return;
  }

  /**
  set the value of an entry via a name or id
  @param { string } name Name of the entry to search for
  @param { DataType } value The new value that you want to store
  @param { string } key The key you want to change the value of
  */
  public setValue(name: string, value: DataType, key: string): void;

  /**
  set the value of an entry via a name or id
  @param { number } id ID of the entry to search for
  @param { DataType } value The new value that you want to store
  @param { string } key The key you want to change the value of
  */
  public setValue(id: number, value: DataType, key: string): void;
  // deno-fmt-ignore
  public setValue(IDName: number | string, value: DataType, key: string): void {
    let index = -1;
    if (typeof IDName === "number") {
      index = this.#DB.findIndex((value) => value.id === IDName);
    }
    if (typeof IDName === "string") {
      IDName = IDName.toLowerCase();
      index = this.#DB.findIndex((value) => value.name === IDName);
    }
    if (index > -1) {
      if (typeof this.#DB[index].data === "object") {
        if (key) {
          this.#DB[index].data[key] = value;
        } else {
          console.warn("key is undefined! failed changing value");
        }
      } else {
        this.#DB[index].data = value;
      }
    }
    this.saveToDisk();
    return;
  }

  /**
  Increase value by name
  @param { string } name Name of the entry to search for
  @param { string } key The key you want to increment the value of
  */
  public incValue(name: string, key: string): void;

  /**
  Increase value by ID
  @param { number } id ID of the entry to search for
  @param { string } key The key you want to increment the value of
  */
  public incValue(id: number, key: string): void;
  public incValue(IDName: number | string, key: string): void {
    let index = -1;
    if (typeof IDName === "number") {
      index = this.#DB.findIndex((value) => value.id === IDName);
    }
    if (typeof IDName === "string") {
      IDName = IDName.toLowerCase();
      index = this.#DB.findIndex((value) => value.name === IDName);
    }
    if (typeof this.#DB[index].data[key] === "number") {
      this.#DB[index].data[key]++;
    } else {
      this.#DB[index].data++;
    }
    this.saveToDisk();
    return;
  }

  /**
  Fetch entry by ID
  @param { number } id ID of the entry you want to fetch
  @returns { DataBase | undefined } return's the entry or undefined if not found
  */
  public fetch(id: number): DataBase | undefined;

  /**
  Fetch entry by name
  @param { string } name Name of the entry you want to fetch
  @param { boolean } exactMatch optional: allow the search to be an exact match
  @returns { DataBase | undefined } return's the entry or undefined if not found
  */
  public fetch(name: string, exactMatch?: boolean): DataBase | undefined;
  // deno-fmt-ignore
  public fetch(IDName: number | string, exactMatch?: boolean): DataBase | undefined {
    let index = -1;
    if (typeof IDName === "string") {
      const search: string = IDName.toLowerCase();
      index = (exactMatch)
        ? this.#DB.findIndex((value) => value.name === search)
        : this.#DB.findIndex((value) => value.name.includes(search));
    } else {
      index = this.#DB.findIndex((value) => value.id === IDName);
    }
    return this.#DB[index];
  }

  /**
  Fetch all entries by a range of id's
  @param { number } begin The first ID to fetch
  @param { number } length Length of the list
  @returns { DataBase[] | undefined } Returns an array with all entries found, or undefined if no entries were found
  */
  public fetchByRange(begin: number, length: number): DataBase[] | undefined {
    const temp: DataBase[] = this.#DB.filter((value) =>
      value.id >= begin && value.id <= begin + length
    );
    if (temp.length === 0) return undefined;
    return temp;
  }

  /**
  Delete entry by ID
  @param { number } id ID of the entry you want to fetch
  */
  public delete(id: number): void;

  /**
  Delete entry by name
  @param { string } name Name of the entry you want to fetch
  @param { boolean } exactMatch optional: allow the search to be an exact match
  */
  public delete(name: string): this;
  public delete(IDName: number | string, exactMatch?: boolean): this {
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
      this.saveToDisk();
    }
    return this;
  }

  /**
  Delete entries in a specific range
  @param { number } begin The first ID to fetch
  @param { number } length Length of the list
  */
  public deleteByRange(begin: number, length: number): void {
    this.#DB.splice(begin, length);
    this.saveToDisk();
    return;
  }

  /**
  Delete every entry in the enmap and remove it from disk
  */
  public deleteEnmap(): void {
    this.#DB = [];
    if (this.saveLocation) Deno.removeSync(this.saveLocation);
    return;
  }

  /**
  * Get the size of the Enmap
  */
  public getEnmapSize(): size {
    const size: size = sizeof(this.#DB);
    return size;
  }

  /**
  * Get total entries in the Enmap 
  */
  public getTotalEntries(): number {
    return this.#DB.length;
  }

  /**
  * Save db in memory
  */
  private saveToDisk(): void {
    if (this.name && this.saveLocation) {
      save<DataBase>(this.name, this.saveLocation, this.#DB);
    }
    return;
  }
}

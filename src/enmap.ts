import { AES } from "https://deno.land/x/god_crypto@v1.4.9/aes.ts";
import sizeof, { size } from "https://deno.land/x/sizeof@v1.0.2/mod.ts"
import { DataBase, EnmapOptions } from "./typings.ts";
export class Enmap<DataType> {

    #DB: DataBase[] = [];
    #i = 0;
    public name: string|undefined;
    public path: string|undefined;
    #saveLocation: string|undefined;
    public saveToDisk: boolean|undefined;
    public encrypted: boolean;

    public constructor(options?: EnmapOptions) {
        this.name = (options?.name) ? options.name : undefined;
        this.path = (options?.filePath) ? options.filePath : undefined;
        this.encrypted = (options?.encryptData) ? options.encryptData : false;
        this.#saveLocation = (options?.name && options?.filePath) ? options.filePath + "/" + options.name + ".enmap" : undefined;
    }

    public ensure(name: string, data: DataType): DataType {
        interface key extends DataBase {
            data: DataType
        }
        const KEY:key = {
            id: this.#i++,
            name: name.toLowerCase(),
            data
        }

        this.#DB.push(KEY);
        return KEY.data;
    }

    public add(name: string, data: DataType): this {
        interface key extends DataBase {
            data: DataType
        }

        const KEY:key = {
            id: this.#i++,
            name: name.toLowerCase(),
            data
        }

        this.#DB.push(KEY);
        return this;
    }

    public override(id: number, newName: string, data: DataType): this
    public override(searchName: string, newName: string, data: DataType): this
    public override(IDName: number|string, newName: string, data: DataType): this {
        const index = (typeof IDName === "string") ?
            this.#DB.findIndex(value => value.name === IDName) :
            this.#DB.findIndex(value => value.id === IDName);
        
        interface key extends DataBase {
            data: DataType
        }
        if (index > -1) { 
            const KEY:key = {
                id: this.#DB[index].id,
                name: newName.toLowerCase(),
                data
            }
            this.#DB[index] = KEY;
        } else {
            console.warn("could not find an entry with the given name or id!");
        }
        return this;
    }

    public setValue(name: string, value: DataType, key?: string): this
    public setValue(id: number, value: DataType, key?: string): this
    public setValue(IDName: number|string, value: DataType, key?: string): this {
        let index = -1;
        if (typeof IDName === "number") {
            index = this.#DB.findIndex(value => value.id === IDName);
        }
        if (typeof IDName === "string") {
            IDName = IDName.toLowerCase();
            index = this.#DB.findIndex(value => value.name === IDName);
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
        return this;
    }

    public incValue(name: string, key: string): this
    public incValue(id: number, key: string): this
    public incValue(IDName: number|string, key: string): this {
        let index = -1;
        if (typeof IDName === "number") {
            index = this.#DB.findIndex(value => value.id === IDName);
        }
        if (typeof IDName === "string") {
            IDName = IDName.toLowerCase();
            index = this.#DB.findIndex(value => value.name === IDName)
        }
        if (typeof this.#DB[index].data[key] === "number") {
            this.#DB[index].data[key]++;
        } else {
            this.#DB[index].data++;
        }
        return this;
    }

    public fetch(id: number): DataBase|undefined
    public fetch(name: string): DataBase|undefined
    public fetch(IDName: number|string, exactMatch?: boolean): DataBase|undefined {
        let index = -1;
        if (typeof IDName === "string") {
            const search: string = IDName.toLowerCase();
            index = (exactMatch) ?
                this.#DB.findIndex(value => value.name === search) :
                this.#DB.findIndex(value => value.name.includes(search));
        } else {
            index = this.#DB.findIndex(value => value.id === IDName);
        }
        return this.#DB[index];
    }

    public fetchByRange(begin: number, length: number): DataBase[] {
        const temp = this.#DB.filter(value => value.id >= begin && value.id <= begin + length);
        return temp;
    }
    public delete(id: number): this
    public delete(name: string): this
    public delete(IDName: number|string): this {
        const index = (typeof IDName === "string") ? 
            this.#DB.findIndex(value => value.name === IDName.toLowerCase()) :
            this.#DB.findIndex(value => value.id === IDName);
        this.#DB.splice(index, 1);
        return this;
    }

    public deleteByRange(begin: number, length: number): this {
        this.#DB.splice(begin, length);
        return this;
    }
    public deleteEnmap(): void {
        this.#DB = [];
        return;
    }

    public getEnmapSize(): size {
        const size: size = sizeof(this.#DB);
        return size;
    }

    public getTotalEntries(): number {
        return this.#DB.length;
    }
}
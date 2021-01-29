export interface DataBase {
    id: number;
    name: string;
    data: any;
}

export interface EnmapOptions {
    filePath?: string;
    encryptData?: boolean;
    saveToDisk?: boolean;
    name?: string;
}
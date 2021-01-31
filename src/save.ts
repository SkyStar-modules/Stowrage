import { AES } from "../deps.ts";
const add = "1234567890!@#$%^";

export async function save<T>(
  name: string,
  path: string,
  db: T[]
): Promise<void> {
  name = (name.length < 16) ? name + add.slice(name.length) : name;
  name = (name.length > 16) ? name.slice(0, 16) : name;
  const aes: AES = new AES(name, {
    mode: 0,
    iv: name
  });
  const data: Uint8Array = aes.encrypt(new TextEncoder().encode(JSON.stringify(db)));
  await Deno.writeFile(path, data);
  return;
}

export function load<T>(name: string, path: string): T[] {
  name = (name.length < 16) ? name + add.slice(name.length) : name;
  name = (name.length > 16) ? name.slice(0, 16) : name;
  const aes: AES = new AES(name, {
    mode: 0,
    iv: name
  });
  const data: Uint8Array = Deno.readFileSync(path);
  const db: Uint8Array = aes.decrypt(data);
  return JSON.parse(new TextDecoder().decode(db));
}

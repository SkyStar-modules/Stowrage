import { AES } from "../deps.ts";
const add = "1234567890!@#$%^";

export async function save<T>(
  name: string,
  path: string,
  db: T[]
): Promise<void> {
  name = (name.length < 16) ? name + add.slice(name.length) : name;
  name = (name.length > 16) ? name.slice(0, 16) : name;
  const aes = new AES(name, {
    mode: 0,
    iv: name
  });
  const data = aes.encrypt(new TextEncoder().encode(JSON.stringify(db)));
  await Deno.writeFile(path, data);
  return;
}

export function load<T>(name: string, path: string): T {
  name = (name.length < 16) ? name + add.slice(name.length) : name;
  name = (name.length > 16) ? name.slice(0, 16) : name;
  const aes = new AES(name, {
    mode: 0,
    iv: name
  });
  const data = Deno.readFileSync(path);
  const db = aes.decrypt(data);
  return JSON.parse(new TextDecoder().decode(db));
}

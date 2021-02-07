import { AES } from "../deps.ts";
const add = "1234567890!@#$%^";

export async function save<T>(
  name: string,
  path: string,
  db: T[],
): Promise<void> {
  name = nameCheck(name);
  const aes: AES = new AES(name, {
    mode: "cbc",
    iv: name,
  });
  const data: Uint8Array = await aes.encrypt(
    new TextEncoder().encode(JSON.stringify(db)),
  );
  await Deno.writeFile(path, data);
  return;
}

export async function load<T>(name: string, path: string): Promise<T[]> {
  name = nameCheck(name);
  const aes: AES = new AES(name, {
    mode: "cbc",
    iv: name,
  });
  const data: Uint8Array = await Deno.readFile(path);
  const db: Uint8Array = await aes.decrypt(data);
  return JSON.parse(new TextDecoder().decode(db));
}

function nameCheck(name: string): string {
  name = (name.length < 16) ? name + add.slice(name.length) : name;
  name = (name.length > 16) ? name.slice(0, 16) : name;
  return name;
}

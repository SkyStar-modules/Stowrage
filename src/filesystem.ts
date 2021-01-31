export function fileExistSync(path: string): boolean {
  try {
    Deno.statSync(path);
  } catch (e) {
    return false;
  }
  return true;
}

import { Stowrage } from "./mod.ts";
import { Stowrage as oldStowrage } from "https://deno.land/x/stowrage/mod.ts";
interface small {
    entries: number[];
    totalTime: number[];
    avg: number[];
}
interface OBJ {
    new: small;
    old: small;
}
const obj: OBJ = {
    new: {
        entries: [],
        totalTime: [],
        avg: []
    },
    old: {
        entries: [],
        totalTime: [],
        avg: []
    }
}
const newO = obj.new;
const oldO = obj.old;
for (let i = 100; i <= 10000; i += 100) {
  const newV = new Stowrage();
  const oldV = new oldStowrage();
  const newBegin = performance.now();
  for (let j = 0; j < i; j++) {
    newV.ensure(j + "new", j);
  }
  const newEnd = performance.now();
  newO.entries.push(newV.size);
  newO.totalTime.push(newEnd - newBegin);
  newO.avg.push((newEnd - newBegin) / i);

  const oldBegin = performance.now();
  for (let j = 0; j < i; j++) {
    await oldV.ensure(j + "old", j);
  }
  const oldEnd = performance.now();
  oldO.entries.push(oldV.totalEntries());
  oldO.totalTime.push(oldEnd - oldBegin);
  oldO.avg.push((oldEnd - oldBegin) / i);
}
await Deno.writeTextFile("data.json", JSON.stringify(obj));
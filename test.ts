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
for (let i = 10; i <= 10000; i += 10) {
  const newV = new Stowrage();
  const oldV = new oldStowrage();
  const newBegin = performance.now();
  for (let j = 0; j < i; j++) {
    newV.ensure(j + "new", j);
  }
  const newEnd = performance.now();
    obj.new.entries.push(newV.size);
    obj.new.totalTime.push(newEnd - newBegin);
    obj.new.avg.push((newEnd - newBegin) / i);


  const oldBegin = performance.now();
  for (let j = 0; j < i; j++) {
    await oldV.ensure(j + "old", j);
  }
  const oldEnd = performance.now();
    obj.old.entries.push(oldV.totalEntries());
    obj.old.totalTime.push(oldEnd - oldBegin);
    obj.old.avg.push((oldEnd - oldBegin) / i);

}
Deno.writeTextFile("data.json", JSON.stringify(obj));
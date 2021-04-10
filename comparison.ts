import { Stowrage } from "./mod.ts";
import { Keydb } from "https://deno.land/x/keydb/mod.ts";
import { render } from "https://deno.land/x/eta/mod.ts";

const total = Deno.args[0] ? parseInt(Deno.args[0]) : 10000;
const step = Deno.args[1] ? parseInt(Deno.args[1]) : 100;
interface interfaceThing {
  totalTime: number[];
  avg: number[];
}
interface Thing {
  entries: number[];
  stowrage: interfaceThing;
  keyDB: interfaceThing;
}
const obj: Thing = {
  entries: [],

  stowrage: {
    totalTime: [],
    avg: [],
  },
  keyDB: {
    totalTime: [],
    avg: [],
  },
};
for (let i = step; i <= total; i += step) {
  gc();
  obj.entries.push(i);
  const stow = new Stowrage();
  const keydb = new Keydb();
  // stowrage

  let start = performance.now();
  for (let j = 0; j <= i; j++) {
    stow.add(`${j}`, j);
  }
  let end = performance.now();
  let math = end - start;
  obj.stowrage.totalTime.push(math);
  obj.stowrage.avg.push(math / i);
  gc();

  // KeyDB
  start = performance.now();
  for (let j = 0; j <= i; j++) {
    await keydb.set(`${j}`, j);
  }
  end = performance.now();
  math = end - start;
  obj.keyDB.totalTime.push(math);
  obj.keyDB.avg.push(math / i);
  gc();
}

const ejs = Deno.readTextFileSync("graph.ejs");
Deno.writeTextFileSync("graphs.html", await render(ejs, obj) as string);

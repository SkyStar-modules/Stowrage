import { Stowrage } from "./mod.ts";
import { Stowrage as oldStow } from "https://deno.land/x/stowrage/mod.ts";
import { Keydb } from "https://deno.land/x/keydb@1.0.0/sqlite.ts";
import { DB as SQLite } from "https://deno.land/x/sqlite@v2.3.2/mod.ts";
import { render } from "https://deno.land/x/eta/mod.ts";

const total = 100000;
const step = 1000;
interface interfaceThing {
  totalTime: number[];
  avg: number[]
}
interface Thing {
  entries: number[];
  oldStowrage: interfaceThing;
  stowrage: interfaceThing;
  keyDB: interfaceThing;
  SQLite: interfaceThing;
}
const obj: Thing = {
  entries: [],
  oldStowrage: {
    totalTime: [],
    avg: []
  },
  stowrage: {
    totalTime: [],
    avg: []
  },
  keyDB: {
    totalTime: [],
    avg: []
  },
  SQLite: {
    totalTime: [],
    avg: []
  }
}

for (let i = step; i <= total; i += step) {
  console.log(i);
  obj.entries.push(i);
  const ostow = new oldStow({
    name: `meh`
  });
  const stow = new Stowrage({
    name: `meh`,
  });
  const keydb = new Keydb();
  const sql = new SQLite();
  sql.query("CREATE TABLE IF NOT EXISTS sql (id INTEGER, name TEXT)");
  // stowrage
  let start = performance.now();
  for (let j = 0; j <= i; j++) {
    stow.add(`${j}`, j);
  }
  let end = performance.now();
  let math = end - start;
  obj.stowrage.totalTime.push(math);
  obj.stowrage.avg.push(math / i);

  // stowrage
  start = performance.now();
  for (let j = 0; j <= i; j++) {
    await ostow.add(`${j}`, j);
  }
  end = performance.now();
  math = end - start;
  obj.oldStowrage.totalTime.push(math);
  obj.oldStowrage.avg.push(math / i);

  // KeyDB
  start = performance.now();
  for (let j = 0; j <= i; j++) {
    await keydb.set(`${j}`, j);
  }
  end = performance.now();
  math = end - start;
  obj.keyDB.totalTime.push(math);
  obj.keyDB.avg.push(math / i);

  // SQLite
  start = performance.now();
  for (let j = 0; j <= i; j++) {
    await sql.query("INSERT INTO sql (name, id) VALUES(?, ?)", [`${j}`, j]);
  }
  end = performance.now();
  math = end - start;
  obj.SQLite.totalTime.push(math);
  obj.SQLite.avg.push(math / i);
}

const ejs = Deno.readTextFileSync("graph.ejs");
Deno.writeTextFileSync("graphs.html", await render(ejs, obj) as string);

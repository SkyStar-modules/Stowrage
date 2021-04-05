# Documentation

## Create a new Stowrage

### Basic

the most basic example of creating an Stowrage

```ts
import { Stowrage } from "https://deno.land/x/stowrage/mod.ts";

const data = new Stowrage();
```

### persistent Stowrage

to get persistent stowrage, you just need to set `isPersistent` to true\
and initiate the database

```ts
import { Stowrage } from "https://deno.land/x/stowrage/mod.ts";

const data = new Stowrage({
  name: "persistent",
  persistent: true,
});

await data.init();
```

### typesafe Stowrage

A typesafe Stowrage only allow's user listed types to be used\
The example shown below only allow's string's to be used

```ts
import { Stowrage } from "https://deno.land/x/stowrage/mod.ts";

const data = new Stowrage<string>();
```

### Stowrage Options

Stowrage allow's for a few options to be used which are all optional

```ts
import { Stowrage } from "https://deno.land/x/stowrage/mod.ts";

const data = new Stowrage({
  name: "some name", // name of the Stowrage
  persistent: true, // allow's you to save to a SQLite DataBase
  maxEntries: 5, // max entries allowed in the Stowrage, automatically discard the oldest entry
});
```

## Return types

`fetch` & `ensure` will always return the following object

```ts
interface DataBase {
  id: number;
  name: string;
  data: userDefinxed;
}
```

`fetchByRange` will return an array of this object

## Methods

### ensure(name: string, data: userDefinedType)

Ensure allow's the user to add data and immediately return it

```ts
import { Stowrage } from "https://deno.land/x/stowrage/mod.ts";

const data = new Stowrage<string>();
console.log(data.ensure("name", "string"));
/** expected output:
{
  id: 0,
  name: "name",
  data: "string"
}
*/
```

### add(name: string, data: userDefinedType)

Add is the same as ensure, but it does not return the data

```ts
import { Stowrage } from "https://deno.land/x/stowrage/mod.ts";

const data = new Stowrage<string>();
data.add("name", "string");
```

### fetch(IDName: number|string)

get 1 entry by name

use `fetchByID()` to get 1 entry by it's ID

```ts
import { Stowrage } from "https://deno.land/x/stowrage/mod.ts";

const data = new Stowrage<string>();
data.add("somename", "string");

console.log(data.fetch("somename"));
/** expected output:
{
    id: 0,
    name: "name",
    data: "string"
}
```

### fetchByRange(begin: number, length: number)

fetch all entries from a range

```ts
import { Stowrage } from "https://deno.land/x/stowrage/mod.ts";

const data = new Stowrage<string>();
data.add("somename", "string");
data.add("somename1", "string");

console.log(data.fetchByRange(0, 2));
/** expected output:
[
  {
    id: 0,
    name: "somename",
    data: "string"
  },
  {
    id: 1,
    name: "somename1",
    data: "string"
  }
]
```

### override(IDName: number|string, data: userDefinedType, newName?: string)

override an entry by searching for it's name or id

```ts
import { Stowrage } from "https://deno.land/x/stowrage/mod.ts";

const data = new Stowrage<string>();

data.add("name", "string"));

data.override("name", "other string", "newname");
console.log(data.fetch("newname"));
/** expected output:
{
  id: 0,
  name: "newname",
  data: "other string"
}
*/
```

### setValue(IDName: number|string, value: unknown, extraOptions?: SetValueOptions)

set a value of an entry(or key of the entry)

```ts
import { Stowrage } from "https://deno.land/x/stowrage/mod.ts";

const data = new Stowrage<string>();

data.add("name", "string");

data.setValue("name", "newValue");
```

```ts
import { Stowrage } from "https://deno.land/x/stowrage/mod.ts";

const data = new Stowrage<Record<string, string>>();

const obj = {
  thing: "value",
};

console.log(data.ensure("name", obj));
/** expected output:
{
  id: 0,
  name: "name",
  data: {
    thing: "value"
  }
}
*/

data.setValue("name", { key: "thing", newValue: "new value" });
console.log(data.fetch("name"));
/** expected output:
{
  id: 0,
  name: "name",
  data: {
    thing: "new value"
  }
}
*/
```

### delete(IDName: string|number)

Delete 1 entry from the map via a name

use `deleteByID()` to delete 1 entry by it's ID

```ts
import { Stowrage } from "https://deno.land/x/stowrage/mod.ts";

const data = new Stowrage<string>();

data.ensure("name", "string");

data.delete("name");
```

### DeleteByRange(begin: number, length: number)

Same as fetchByRange but it deletes the entries instead of fetching them

```ts
import { Stowrage } from "https://deno.land/x/stowrage/mod.ts";

const data = new Stowrage<string>();
data.add("somename", "string");
data.add("somename1", "string");

data.deleteByRange(0, 2);
```

### filter(filter: FilterFunc)

get all entries with your specific filter

```ts
const data = new Stowrage<string>();
data.add("somename", "string");
data.add("somename1", "string");

data.filter((entry) => entry.name.includes("somename"));
```

### find(filter: FilterFunc)

get the first entry with your specific filter

```ts
const data = new Stowrage<string>();
data.add("somename", "string");
data.add("somename1", "string");

data.find((entry) => entry.name.includes("somename"));
```

### has(searchName: string)

check if stowrage has an entry with the searchname

```ts
const data = new Stowrage<string>();
data.add("somename", "string");
data.add("somename1", "string");

console.log(data.has("somename")) // true
;
console.log(data.has("!Exist")) // false
;
```

### deleteStowrage()

delete everything in the Stowrage\
and also the SQLite file if `persistent` is used

```ts
import { Stowrage } from "https://deno.land/x/stowrage/mod.ts";

const data = new Stowrage<string>();
data.add("somename", "string");
data.add("somename1", "string");

data.deleteStowrage();
// Stowrage is now empty
```

### totalEntries()

gives the amount of total entries

```ts
import { Stowrage } from "https://deno.land/x/stowrage/mod.ts";

const data = new Stowrage<string>();
data.add("somename", "string");
data.add("somename1", "string");

console.log(data.totalEntries());
// expected output: 2
```

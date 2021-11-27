import { DB } from "https://deno.land/x/sqlite/mod.ts";

// Open a database
const db = new DB("data.sqlite");
let query = db.query("select * from tbldata")
console.log(query)

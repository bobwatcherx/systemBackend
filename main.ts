import { Application,Router  } from "https://deno.land/x/oak/mod.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";
// let location = Deno.openSync("datamain.sqlite",{read:true, write:true})
import { v4 } from "https://deno.land/std@0.91.0/uuid/mod.ts";
import { hash, verify } from "https://deno.land/x/scrypt/mod.ts";

const file = Deno.openSync("datamain.sqlite", { read: true, write: true });
const db = new DB("datamain.sqlite");
const router = new Router()
const app = new Application();
app.use(
    oakCors({
      origin: "*"
    }),
);

// TBL USER LOGIN CHECK

router.post("/user/login",async(ctx)=>{
const body = ctx.request.body({ type: 'form' })
  const value = await body.value
  let username = value.get('username')
  let password = value.get('password')
  try{
    let query = db.query("select * from tbluser where username = ? and password = ?",[username,password])
    if(query.length ==  1){
      console.log(query.indexOf(3))
      ctx.response.body = "user found"
    }
  }catch(err){
    ctx.response.body = {"error":"not found"}
    ctx.response.status = 500
  }
})


//TBL USER REGISTER
router.post("/user/add",async(ctx)=>{
const body = ctx.request.body({ type: 'form' })
  const value = await body.value
  let username = value.get('username')
  let password = value.get('password')
  let nik = value.get('nik')
// v4 unique id
let uniqid = v4.generate();
const hashResult = await hash(password || "");
  try{
    let query = db.query(`insert into tbluser
     (id,username,password,nik,active) values ('${uniqid}','${username}','${hashResult}','${nik}','not')`)
    ctx.response.body = "created"
  }catch(err){
    ctx.response.body = err.message
    ctx.response.status = 500
  }
})


//SKRIPSI
router.get("/",(ctx)=>{
  let query = db.query("select * from tblsekolah");
  ctx.response.body = query
})
router.get("/details/:nama",(ctx)=>{
  let nama = ctx.params.nama
  let query = db.query("select * from tblsekolah where nama = ?",[nama])
  console.log(query)
  ctx.response.body = query
})
router.post("/add",async(ctx)=>{
   const body = ctx.request.body({ type: 'form' })
  const value = await body.value
  let nama = value.get('nama')
  let jurusan = value.get('jurusan')
  let judul = value.get("judul")
  let status = value.get('status')
  try{
      let query = db.query(`insert into tblsekolah ('nama','judul','jurusan','status')values ('${nama}','${judul}','${jurusan}','${status}')`);
      console.log("created" +  query)
      ctx.response.body = "data created"
    }catch(err){
      console.log("errr" +  err)
      ctx.response.body =  err.message
    }

})
router.delete("/delete/:id",(ctx)=>{
  let params = ctx.params.id
  let search = db.query("select * from tblsekolah where id = " + params)
  if(search.length == 1){
    try{
      let query = db.query(`delete from tblsekolah where id = ${params}`)
      ctx.response.body = {"status":"data "+ params+ " terhapus" }
    }catch(err){
      ctx.response.body = "failed"
    }
  }
  else{
    ctx.response.body = {"status":"data not found"}
    ctx.response.status = 404
  }
})

router.put("/verified/:id",(ctx)=>{
  let params =  ctx.params.id
  let status = 'verified'
    try{
    let query =  db.query("update tblsekolah SET status = ? where id = ?",[status,params])
    if(query){
      ctx.response.body = "data update"
    }
  }catch(err){
    ctx.response.body = {"failed":"data error"}
    ctx.response.status = 404
  console.log(err)
  }
})
app.use(router.routes());
app.use(router.allowedMethods());

app.addEventListener(
  "listen",
  (e) => console.log("Listening on http://localhost:8080"),
);
await app.listen({ port: 8080 });

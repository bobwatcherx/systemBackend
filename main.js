import { Application,Router  } from "https://deno.land/x/oak/mod.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";
// let location = Deno.openSync("datamain.sqlite",{read:true, write:true})
import { v4 } from "https://deno.land/std@0.91.0/uuid/mod.ts";
import { createHash } from "https://deno.land/std@0.91.0/hash/mod.ts";
import * as flags from 'https://deno.land/std/flags/mod.ts';

// const file = Deno.openSync("datamain.sqlite", { read: true, write: true });
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
      let hashp = createHash("md5");
hashp.update(password);
let haspresult = hashp.toString();
  try{
    let query = db.query("select * from tbluser where username = ? and password = ? ",[username,haspresult])
    if(query.length ==  1){
      let sip = Object.values(query[0])
      console.log(sip[2])
      ctx.response.body = {"find":"user found","data":{
        "username": sip[1],
        "password":sip[3],
        "nik":sip[2],
        "active":sip[4]
      }}
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
let hash = createHash("md5");
hash.update("dush");
let hashResult = hash.toString();
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
  let temp = []
  let main = Object.values(query).forEach((key)=>{

   temp.push({"nama":key[1],"judul":key[3],"jurusan":key[2],"date":key[3],"status":key[4]})
   console.log(temp)
   ctx.response.body = {"status":"succes","data":temp}
  })

})
router.get("/details/:nama",(ctx)=>{
  let nama = ctx.params.nama
  let query = db.query("select * from tblsekolah where nama = ?",[nama])
  let temp = []
  let main = Object.values(query).forEach((key)=>{

  temp.push({"id":key[0],"nama":key[1],"jurusan":key[2],"judul":key[3],"date":key[4],"status":key[5]})
  })
  ctx.response.body = temp
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

const {args, exit} = Deno;
const DEFAULT_PORT = 8000;
const argPort = flags.parse(args).port;
const port = argPort ? Number(argPort) : DEFAULT_PORT;
if (isNaN(port)){
console.log("This is not port number");
exit(1);
};
console.log("server runn on" +  DEFAULT_PORT)
await app.listen({ port: port });

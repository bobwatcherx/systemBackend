import {
 opine,
  json,
  urlencoded,} from "https://deno.land/x/opine@1.9.1/mod.ts";
import { opineCors } from "https://deno.land/x/cors/mod.ts";
import * as flags from 'https://deno.land/std/flags/mod.ts';
import { DB } from "https://deno.land/x/sqlite/mod.ts";
import { v4 } from "https://deno.land/std@0.91.0/uuid/mod.ts";
import { createHash } from "https://deno.land/std@0.91.0/hash/mod.ts";

const app = opine();

const db = new DB("datamain.sqlite");

app.use(json()); // for parsing application/json
app.use(urlencoded()); // for parsing application/x-www-form-urlencoded

app.use(opineCors({
  origin:"*"
}))
app.get("/",(req,res)=>{
  res.send("run server")
})


// EDIT POSTINGAN ID
app.put("/edit/:id",(req,res)=>{
  let {jurusan,judul} = req.parsedBody
  let id = req.params.id

  try{
    let query =  db.query("update tblsekolah SET  jurusan = ? , judul = ? where id = ?",[jurusan,judul,id])
    if(query){
      res.send({"status":"postingan updated"})
    }
  }catch(err){
    res.setStatus(500)
    res.send({"status":"error","data":err})
    console.log(err)
  }
})

// EDIT VERIFIED ID
app.put("/verified/:id",(req,res)=>{
  let id = req.params.id
  let status = 'verified'

  try{
    let query =  db.query("update tblsekolah SET status = ? where id = ?",[status,id])
    if(query){
      res.send({"status":"updated"})
    }
  }catch(err){
    res.setStatus(500)
    res.send({"status":"error","data":err})
  }
})

// HAPUS POSTINGAN ID
app.delete("/delete/:id",(req,res)=>{
  let id = req.params.id
  let search = db.query("select * from tblsekolah where id = " + id)
  if(search.length == 1 ){
    try{
      let query = db.query(`delete from tblsekolah where id = ${id}`)
      res.send({"status":"delete" })
      console.log("terhapus")
    }catch(err){
      res.setStatus(500)
      res.send({"status":"failed" })
    }
  }
  else{
      res.setStatus(500)
        res.send({"status":"failed" })
  
  }

})

// DETAIL POSTINGAN BY ID

app.get("/skripsi/details/:id",(req,res)=>{
  let id = req.params.id
  let query = db.query("select * from tblsekolah where id = ?",[req.params.id]);

  console.log(query)
  res.send({"status":"succes details","data":query})
})
// GET SEMUA POSTINGAN
app.get("/skripsi/:name",(req,res)=>{
  let query = db.query("select * from tblsekolah where nama = ?",[req.params.name]);
  // let temp = []
  // let main = Object.values(query).forEach((key)=>{

  //  temp.push({"nama":key[1],"judul":key[3],"jurusan":key[2],"date":key[3],"status":key[4]})
  //  console.log(temp)
  // })
  console.log(query)
  res.send({"status":"succes","data":query})
})

// BUAT POSTINGAN SKRPISI

app.post("/add",async(req,res)=>{
  let {nama,jurusan,judul} = req.parsedBody
  try{
      let query = await db.query(`insert into tblsekolah ('nama','judul','jurusan','status')values ('${nama}','${judul}','${jurusan}','not')`);
      console.log("created" +  query)
      res.send("data create")
    }catch(err){
      console.log("errr" +  err)
            res.send("error" +  err.message)
            res.setStatus(500)
    }

})


// CEK LOGIN
app.post("/user/login",(req,res)=>{
  let {username,password} = req.parsedBody
 let hashp = createHash("md5");
hashp.update(password);
let haspresult = hashp.toString();
try{
    let query = db.query("select * from tbluser where username = ? and password = ? ",[username,haspresult])
    if(query.length ==  1){
      let sip = Object.values(query[0])
      let temp = []
      temp.push({
        "username": sip[1],
        "password":sip[3],
        "nik":sip[2],
        "active":sip[4]
      })
      res.json({"status":"found","data":temp})
    }
    else{
      res.setStatus(500)
      res.json({"error":"not found"})
    }
  }catch(err){
      res.json({"error":"not found"})
      res.setStatus(500)
    
  }
})

// ADD USER
app.post("/user/add", function (req, res) {
  let {username,nik,password} = req.parsedBody
  let uniqid = v4.generate();
let hash = createHash("md5");
hash.update(password);
let hashResult = hash.toString();

   try{
    let query =  db.query(`insert into tbluser
     (id,username,password,nik,active) values ('${uniqid}','${username}','${hashResult}','${nik}','not')`)
    console.log(JSON.stringify(query))
    res.send("data created")
  }catch(err){
    res.setStatus = 500
  }});
// app.addEventListener("listen",()=>console.log("run on 8080"))
const {args, exit} = Deno;
const DEFAULT_PORT = 8000;
const argPort = flags.parse(args).port;
const port = argPort ? Number(argPort) : DEFAULT_PORT;
if (isNaN(port)){
console.log("This is not port number");
exit(1);
};
console.log("server runn on" +  port)
app.listen(
  port,
  () => console.log("server has started " + port),
);
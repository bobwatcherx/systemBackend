import { Application,Router  } from "https://deno.land/x/oak/mod.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts";
const db = new DB("datamain.sqlite");
const router = new Router()
const app = new Application();

router.get("/",(ctx)=>{
  let query = db.query("select * from tblsekolah");

  ctx.response.body =  JSON.stringify(query)
})
router.post("/add",async(ctx)=>{
   const body = ctx.request.body({ type: 'form' })
  const value = await body.value
  let nama = value.get('nama')
  let jurusan = value.get('jurusan')
  let judul = value.get("judul")
  try{
      let query = db.query(`insert into tblsekolah ('nama','judul','jurusan')values ('${nama}','${judul}','${jurusan}')`);
      console.log("created" +  query)
      ctx.response.body = "data created"
    }catch(err){
      console.log("errr" +  err)
      ctx.response.body =  err
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

router.put("/verified/:id/:nama",(ctx)=>{
  let params =  ctx.params.id
  let nama = ctx.params.nama.toString()
  let status = 'not'
  let input = [status,params]
    try{
    let query =  db.query("update tblsekolah SET status =? where id =?",['not',params])

    ctx.response.body = {"status":"data " + params + " terupdate"}
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

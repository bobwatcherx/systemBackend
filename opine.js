import { opine } from "https://deno.land/x/opine@1.9.1/mod.ts";
import { opineCors } from "https://deno.land/x/cors/mod.ts";
import * as flags from 'https://deno.land/std/flags/mod.ts';

const app = opine();

app.use(opineCors({
  origin:"*"
}))
app.get("/",(req,res)=>{
  res.send("run server")
})
app.post("/add", function (req, res) {
  res.send(req.body);
});
// app.addEventListener("listen",()=>console.log("run on 8080"))
const DEFAULT_PORT = parseInt(Deno.env.get('PORT') ?? '8000');
console.log("server runn on" +  DEFAULT_PORT)
app.listen(
  DEFAULT_PORT,
  () => console.log("server has started " +DEFAULT_PORT 🚀),
);
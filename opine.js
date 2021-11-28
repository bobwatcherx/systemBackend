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
  res.send(req.body.username);
});
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
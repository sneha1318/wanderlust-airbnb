const express=require("express");
const app=express();
const users=require("./classroom/route/user.js");
const posts=require("./classroom/route/post.js");
var cookieParser = require('cookie-parser')

app.use("/user",users);
app.use("/posts",posts);

app.get("/getcookies",(req,res)=>{
    res.cookie("name","val");
    res.send("1 cookie send");
})
app.get("/",(req,res)=>{
    console.dir(req.cookies);
    res.send("Hi I am root");

})
app.get("/greet",(req,res)=>{
    let {name="anonymous"}=req.cookies
    res.send(`hi my name is ${name}`);
})


app.get("/",(req,res)=>{
    res.send("hi i amroot");s
})

app.listen(3000,()=>{
    console.log("app is listening")
})
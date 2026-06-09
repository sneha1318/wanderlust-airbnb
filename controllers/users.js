
// const { model } = require("mongoose");
const User=require("../models/user.js");

module.exports.createuser=(req,res)=>{
    res.render("user/signup.ejs");
}
//postuser

module.exports.postuser=async (req,res)=>
        {try{
            let {username,email,password}=req.body;
    const newUser=new User({email,username});
    const registereduser=await User.register(newUser, password);
    console.log(registereduser);
    req.login(registereduser,(err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","Successfully registered !");
    res.redirect("/listing");

    })
    

}catch (e){
 req.flash("error",e.message);
 res.redirect("/signup");
}
 };
//render login
 module.exports.renderlogin=(req,res)=>{
    res.render("user/login.ejs")
 };

 //login
 module.exports.login=async(req,res)=>{

        req.flash("success","Welcome back to Wanderlust!")
     let redirectUrl = res.locals.redirectUrl || "/listing";

        res.redirect(redirectUrl);
 }
 //logout
 module.exports.logout=(req,res,next)=>{
    req.logout((err)=>{
        if(err){
            next(err);
        }
        req.flash("success","You are logged out!");
        res.redirect("/listing");
    })
 };
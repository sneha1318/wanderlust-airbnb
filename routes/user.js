const express=require("express");
const router=express.Router();
const User=require("../models/user.js");
const wrapAsync=require("../models/user.js");
const passport=require("passport");
const { saveredirecturl } = require("../middleware.js");
const usercontroller=require("../controllers/users.js");

router.route("/signup")
.get(usercontroller.createuser)
.post(usercontroller.postuser);

// //create user
// router.get("/signup",usercontroller.createuser);
// //post
// router.post("/signup",usercontroller.postuser);
router.route("/login")
.get(usercontroller.renderlogin)
.post(saveredirecturl,
    passport.authenticate("local", { 
    failureRedirect: "/login" ,
    failureFlash:true ,}),usercontroller.login);


    //logout
 router.get("/logout",usercontroller.logout)
 
    
 
 
module.exports=router;
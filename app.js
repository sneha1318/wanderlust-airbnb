if(process.env.NODE_ENV!="production"){
   require('dotenv').config() ;
}
// console.log(process.env.SECRET);


const express=require("express");
const app=express();
const mongoose=require("mongoose");
// const mongose_url="mongodb://127.0.0.1:27017/wanderlust";
const db_url=process.env.ATLASDB_URL;


const ejsMate=require("ejs-mate");
const path=require("path");
const methodOverride=require("method-override");
const ExpressError=require("./utils/ExpressError.js");
const listings=require("./routes/listing.js");
const reviews=require("./routes/review.js");
const users=require("./routes/user.js");
const session=require("express-session");
const MongoStore = require("connect-mongo");

console.log("MongoStore:", MongoStore);
const flash=require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/user");

const bookingRoutes = require("./routes/bookings");


app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.engine("ejs",ejsMate);

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"/public")));



main()
.then(()=>{
    console.log("connected to db");
})
.catch((err)=>{
    console.log(err);
})


async function main() {
    await mongoose.connect(db_url);
}

const store = MongoStore.create({
  mongoUrl: db_url,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});
store.on("error",(err)=>{
    console.log("ERROR IN MONGO SESSION STORE",err);
})


const sessionoptions={
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:false,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,

    },
};


app.use(session(sessionoptions));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// app.get("/demouser",async(req,res)=>{
//     let fakeuser=new User({
//         email:"sdhfbuw@gmail.com",
//         username:"nehul",
//     });
//   let registereduser=  await User.register(fakeuser,"helooworld");
//   res.send(registereduser);
// })







app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.curruser=req.user;
    console.log(res.locals.success);
    next();
})
app.use("/bookings", bookingRoutes);

app.use("/listing",listings);
app.use("/listing/:id/review",reviews);
app.use("/",users);


app.use((req, res, next) => {
    next(new ExpressError(404, "Page not found!"));
});

app.use((err,req,res,next)=>{
   let  {statusCode=500,message="something went wrong"}=err;
   res.status(statusCode).render("error.ejs",{err});
    // res.status(statusCode).send(message);

})


// app.listen(8080,(req,res)=>{
//     console.log("app is listening");
// })
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`App is listening on port ${PORT}`);
});
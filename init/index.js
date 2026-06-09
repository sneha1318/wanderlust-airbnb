const mongoose=require("mongoose");
 const mongose_url="mongodb://127.0.0.1:27017/wanderlust";
 const initData=require("./data.js");
 
 
 const Listing = require("../models/listing.js");
 
 
 main()
 .then(()=>{
     console.log("connected to db");
 })
 .catch((err)=>{
     console.log(err);
 })
 async function main() {
     await mongoose.connect(mongose_url);
 }
 const initDb=async ()=>{
    // await Listing.deleteMany({});
//     const newdata =initData.data.map((obj)=>({...obj,owner:"69af64199b1e013b636310d7"}));
//    await Listing.insertMany(newdata)
     
       await Listing.updateMany(
  { owner: { $exists: false } },
  { $set: { owner: new mongoose.Types.ObjectId("69af64199b1e013b636310d7") } }
);
    console.log("data was initialized");


 };
 initDb();
 
 
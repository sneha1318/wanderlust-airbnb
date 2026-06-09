const express=require("express");
const router=express.Router({mergeParams:true});

const wrapAsync=require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");

const Review=require("../models/review.js");
const {validateReview, IsloggedIn,isAuthor}=require("../middleware.js")


const reviewcontroller=require("../controllers/reviews.js");


router.post("/",
    IsloggedIn,
    validateReview,wrapAsync(reviewcontroller.createroute));
//review delete 
router.delete("/:reviewid",
    IsloggedIn,
    isAuthor,
    wrapAsync(reviewcontroller.deleteroute));
module.exports=router;
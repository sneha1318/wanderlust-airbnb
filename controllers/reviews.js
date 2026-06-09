const Listing=require("../models/listing.js");
const Review=require("../models/review.js");

//create
module.exports.createroute=async(req,res)=>{
       let listing=await Listing.findById(req.params.id);
       let newReview=new Review(req.body.review);
       newReview.author=req.user._id;
       listing.reviews.push(newReview);
       await newReview.save();
       await listing.save();
       console.log("new review saved");
       req.flash("success"," new review created! ")
       res.redirect(`/listing/${listing._id}`);
}

//delete
module.exports.deleteroute=async(req,res)=>{
    let { id,reviewid }=req.params;
    await Listing.findByIdAndUpdate(id,{ $pull: { reviews:reviewid }});
    await Review.findByIdAndDelete(reviewid);
    req.flash("success"," review deleted! ")
    res.redirect(`/listing/${id}`);

}
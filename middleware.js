const Listing = require("./models/listing.js");
const Review=require("./models/review.js");
const ExpressError=require("./utils/ExpressError.js");
const {listingSchema ,reviewSchema}=require("./schema.js");

module.exports.IsloggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        console.log(req.user);
        req.session.redirectUrl=req.originalUrl;
        req.flash("error","you must havo to logged in before!");
        return res.redirect("/login");
    }
    next();
}
module.exports.saveredirecturl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    next();
}
module.exports.isOwner=async(req,res,next)=>{
     let {id}=req.params;
    let listing= await Listing.findById(id);
   if(!listing.owner.equals(res.locals.curruser._id)){
    req.flash("error","You are not the Owner if this listing!");
    return res.redirect(`/listing/${id}`);
   }
   next();
}

module.exports.validateListing  =async(req,res,next)=>{
    let {error}=listingSchema.validate(req.body);
    if(error){
        let errmsg=error.details.map((el) => el.message).join(",");
        throw new ExpressError(400,errmsg);
     }
     else{
        next();
    }
}
module.exports.validateReview=(req,res,next)=>{
    let { error }=reviewSchema.validate(req.body);
    if(error){
        let errmsg=error.details.map((el) => el.message).join(",");
        throw new ExpressError(400,errmsg);
     }
     else{
        next();
    }
}
module.exports.isAuthor=async(req,res,next)=>{
     let {id,reviewid}=req.params;
    let review= await Review.findById(reviewid);
   if(!review.author.equals(res.locals.curruser._id)){
    req.flash("error","You are not the author of this review!");
    return res.redirect(`/listing/${id}`);
   }
   next();
}
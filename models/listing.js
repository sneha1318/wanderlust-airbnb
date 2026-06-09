

const mongoose = require("mongoose");
const Schema=mongoose.Schema;
const Review=require("./review.js");
const listSchema=new Schema({
        title:
        {
            type:String,
            required:true
        },
        owner:
            {
                type:Schema.Types.ObjectId,
                ref:"User",
            },
        description:String,
         image: {
            url:String,
            filename:String
    },
        price:Number,
        location:String,
        country:String,

        geometry: {
    lat: Number,
    lng: Number
},

        reviews:[
            {
                type:Schema.Types.ObjectId,
                ref:"Review",
            }
        ],
        
        

    })
    listSchema.post("findOneAndDelete",async(listing)=>{
        if(listing){
            await Review.deleteMany({_id :{$in :listing.reviews}})
        }
    })
    const Listing=mongoose.model("Listing",listSchema);
    module.exports= Listing;

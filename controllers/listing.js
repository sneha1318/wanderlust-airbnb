const Listing=require("../models/listing.js");


module.exports.index=async(req,res)=>{
    let allListing=await Listing.find({});
    res.render("listings/index.ejs",{allListing});
}

//new rpoute
module.exports.newroute=async(req,res)=>{
    res.render("listings/new.ejs");
}

//createroute

module.exports.createroute=async(req,res,next)=>{
     let url=req.file.path;
  let filename=req.file.filename;
         
        const newListing=new Listing(req.body.listing);

        newListing.owner = req.user._id;
       newListing.image={url,filename};
    
//map
let location = req.body.listing.location;

let response = await fetch(
  `https://nominatim.openstreetmap.org/search?format=json&q=${location}`,
  {
    headers: {
      "User-Agent": "airbnb-project"
    }
  }
);

let data = await response.json();

if (data.length > 0) {
    newListing.geometry = {
        lat: data[0].lat,
        lng: data[0].lon
    };
}




       await newListing.save();
       req.flash("success","new listing created successfully")
     
   res.redirect("/listing");
}
//show
module.exports.showinfo=async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id).populate({path:"reviews",
        populate:{
            path:"author",
        },
    })
    .populate("owner");
    
    if(!listing){
        req.flash("error"," listing you looking for does not exist! ");
      return  res.redirect("/listing");
    }
   console.log(listing);
    res.render("listings/show.ejs",{listing});
};

//edit
module.exports.editinfo=async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    
    if(!listing){
        req.flash("error","listing you looking for does not exist! ");
        return res.redirect("listing");
    }
//     let originalImageurl=listing.image.url;
//    originalImageurl= originalImageurl.replace("/upload", "/upload/w_250,h_200,c_fill");
let originalImageurl = "";

if (listing.image && listing.image.url) {
    originalImageurl = listing.image.url.replace(
        "/upload",
        "/upload/w_250,h_200,c_fill"
    );
}
   
    res.render("listings/edit.ejs",{listing,originalImageurl});

}
//update route
// module.exports.updateinfo=async(req,res)=>{
    
   
//     let {id}=req.params;

//  let listing = await Listing.findByIdAndUpdate(
//         id,
//         { ...req.body.listing },
//         { new: true }
//     );
//         if (req.file) {
//         listing.image = {
//             url: req.file.path,
//             filename: req.file.filename
//         };
//         await listing.save();
//     }
    
//      req.flash("success"," listing updated! ")
//     res.redirect(`/listing/${id}`);
// }


module.exports.updateinfo = async (req, res) => {
    let { id } = req.params;

    let listing = await Listing.findById(id);

    // ✅ update only text fields
    listing.title = req.body.listing.title;
    listing.description = req.body.listing.description;
    listing.price = req.body.listing.price;
    listing.country = req.body.listing.country;
    listing.location = req.body.listing.location;

    // ✅ update image ONLY if new file uploaded
    if (req.file) {
        listing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    }

    await listing.save();

    req.flash("success", "listing updated!");
    res.redirect(`/listing/${id}`);
};


//delete
module.exports.deleteinfo=async(req,res)=>{
    let {id}=req.params;
    const deletelisting=  await Listing.findByIdAndDelete(id);
    console.log(deletelisting);
    req.flash("success"," listing deleted! ")
    res.redirect("/listing");
};
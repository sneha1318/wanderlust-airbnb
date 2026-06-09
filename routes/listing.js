const express = require("express");
const router = express.Router({ mergeParams: true });

const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");

const {
  IsloggedIn,
  isOwner,
  validateListing
} = require("../middleware.js");

const listingcontrollers = require("../controllers/listing.js");

const multer = require("multer");
const { storage } = require("../cloudconfig.js");
const upload = multer({ storage });

const axios = require("axios");


// ==========================
// LISTING ROUTES
// ==========================

router
  .route("/")
  .get(wrapAsync(listingcontrollers.index))
  .post(
    IsloggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingcontrollers.createroute)
  );

// NEW LISTING PAGE
router.get("/new", IsloggedIn, listingcontrollers.newroute);


// ==========================
// SHOW / UPDATE / DELETE
// ==========================

router
  .route("/:id")
  .get(wrapAsync(listingcontrollers.showinfo))
  .put(
    IsloggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingcontrollers.updateinfo)
  )
  .delete(
    IsloggedIn,
    isOwner,
    wrapAsync(listingcontrollers.deleteinfo)
  );


// EDIT PAGE
router.get("/:id/edit", IsloggedIn, isOwner, wrapAsync(listingcontrollers.editinfo));


// ==========================
// NEARBY PLACES ROUTE (OSM)
// ==========================

router.get("/:id/nearby", wrapAsync(async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing || !listing.geometry || !listing.geometry.coordinates) {
    return res.status(404).json({ elements: [] });
  }

  // FIXED: correct GeoJSON format [lng, lat]
  const lng = listing.geometry.coordinates[0];
  const lat = listing.geometry.coordinates[1];

  const radius = 3000; // 3 km

  const query = `
  [out:json];
  (
    node["amenity"="restaurant"](around:${radius},${lat},${lng});
    node["amenity"="hospital"](around:${radius},${lat},${lng});
    node["shop"="supermarket"](around:${radius},${lat},${lng});
    node["tourism"](around:${radius},${lat},${lng});
    node["railway"="station"](around:${radius},${lat},${lng});
  );
  out center;
  `;

  try {
    const response = await axios.post(
      "https://overpass-api.de/api/interpreter",
      query,
      {
        headers: {
          "Content-Type": "text/plain"
        }
      }
    );

    const elements = response.data.elements || [];

    res.json({
      count: elements.length,
      elements
    });

  } catch (err) {
    console.error("Overpass API error:", err.message);
    res.status(500).json({ elements: [] });
  }
}));


module.exports = router;
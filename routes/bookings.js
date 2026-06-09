const express = require("express");
const router = express.Router();
const Booking = require("../models/bookings");
const Listing = require("../models/listing");

// Middleware (if you already have auth middleware)
const { IsloggedIn } = require("../middleware");

// ✅ 1. Create Booking
router.post("/:listingId", IsloggedIn, async (req, res) => {
  try {
    const { from, to } = req.body;
    const listingId = req.params.listingId;

    // Convert to Date
    const fromDate = new Date(from);
    const toDate = new Date(to);

    // ❗ Check invalid dates
    if (fromDate >= toDate) {
      req.flash("error", "Invalid date selection");
      return res.redirect(`/listings/${listingId}`);
    }

    // ✅ Check date conflict (VERY IMPORTANT)
    const existingBookings = await Booking.find({
      listing: listingId,
      status: "booked",
      $or: [
        {
          from: { $lte: toDate },
          to: { $gte: fromDate },
        },
      ],
    });

    if (existingBookings.length > 0) {
      req.flash("error", "Selected dates are already booked");
      return res.redirect(`/listings/${listingId}`);
    }

    // ✅ Get listing price
    const listing = await Listing.findById(listingId);

    // Calculate days
    const days = Math.ceil(
  (toDate - fromDate) / (1000 * 60 * 60 * 24)
);

    const totalPrice = days * listing.price;

    // ✅ Create booking
    const newBooking = new Booking({
      user: req.user._id,
      listing: listingId,
      from: fromDate,
      to: toDate,
      totalPrice,
      pricePerNight: listing.price
    });

    await newBooking.save();

    req.flash("success", "Booking successful!");
    res.redirect("/bookings/my");
  } catch (err) {
    console.log(err);
    req.flash("error", "Something went wrong");
    res.redirect("/listings");
  }
});


// ✅ 2. Show current user's bookings
router.get("/my", IsloggedIn, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("listing");

    res.render("bookings/index.ejs", { bookings });
  } catch (err) {
    console.log(err);
    res.redirect("/listings");
  }
});


// ✅ 4. Show Edit Booking Form
router.get("/:id/edit", IsloggedIn, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("listing");

    // ❗ Security check
    if (!booking.user.equals(req.user._id)) {
      req.flash("error", "Not authorized");
      return res.redirect("/bookings/my");
    }

    res.render("bookings/edit.ejs", { booking });

  } catch (err) {
    console.log(err);
    res.redirect("/bookings/my");
  }
});

// ✅ 5. Update Booking (EDIT LOGIC)
router.put("/:id", IsloggedIn, async (req, res) => {
  try {
    const { from, to } = req.body;
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId);

    // ❗ Security check
    if (!booking.user.equals(req.user._id)) {
      req.flash("error", "Not authorized");
      return res.redirect("/bookings/my");
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);

    // ❗ Invalid dates
    if (fromDate >= toDate) {
      req.flash("error", "Invalid date selection");
      return res.redirect("/bookings/my");
    }

    // ✅ Conflict check (IGNORE current booking)
    const conflicts = await Booking.find({
      listing: booking.listing,
      status: "booked",   
  
      _id: { $ne: bookingId }, // VERY IMPORTANT
      $or: [
        {
          from: { $lt: toDate },
          to: { $gt: fromDate },
        },
      ],
    });

    if (conflicts.length > 0) {
      req.flash("error", "Dates already booked");
      return res.redirect("/bookings/my");
    }

    // ✅ Get listing price again
    const listing = await Listing.findById(booking.listing);

    const days =
      (toDate - fromDate) / (1000 * 60 * 60 * 24);
    

    const totalPrice = days * listing.price;

    // ✅ Update booking
    booking.from = fromDate;
    booking.to = toDate;
    booking.totalPrice = totalPrice;
    booking.pricePerNight = listing.price;

    await booking.save();

    req.flash("success", "Booking updated successfully");
    res.redirect("/bookings/my");

  } catch (err) {
    console.log(err);
    req.flash("error", "Something went wrong");
    res.redirect("/bookings/my");
  }
});


// ✅ 3. Cancel booking
router.delete("/:id", IsloggedIn, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    // ❗ Security check
    if (!booking.user.equals(req.user._id)) {
      req.flash("error", "Not authorized");
      return res.redirect("/bookings/my");
    }

    booking.status = "cancelled";
await booking.save();

    req.flash("success", "Booking cancelled");
    res.redirect("/bookings/my");
  } catch (err) {
    console.log(err);
    res.redirect("/bookings/my");
  }
});

module.exports = router;
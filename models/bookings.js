// models/booking.js

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
  user: { 
    type: Schema.Types.ObjectId, 
    ref: "User",
    required: true
  },
  listing: { 
    type: Schema.Types.ObjectId, 
    ref: "Listing",
    required: true
  },
  from: {
    type: Date,
    required: true
  },
  to: {
    type: Date,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
     pricePerNight: {
    type: Number,
    required: true
  },

  
  status: {
    type: String,
    enum: ["booked", "cancelled"],
    default: "booked"
  }

}, { timestamps: true });


bookingSchema.index({ listing: 1, from: 1, to: 1 });





module.exports = mongoose.model("Bookings", bookingSchema);
const mongoose = require("mongoose");
const Listing = require("./models/listing");


const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function updateGeometry() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("MongoDB Connected");

    const listings = await Listing.find({});

    for (let listing of listings) {

      const query = `${listing.location}, ${listing.country}`;

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`,
          {
            headers: {
              "User-Agent": "wanderlust-app"
            }
          }
        );

        const data = await response.json();

        if (data.length > 0) {

          listing.geometry = {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon)
          };

          await listing.save();

          console.log(
            `Updated: ${listing.title} -> ${listing.geometry.lat}, ${listing.geometry.lng}`
          );
        } else {
          console.log(`No coordinates found for ${query}`);
        }

      } catch (err) {
        console.log(err.message);
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log("All listings updated!");
    mongoose.connection.close();

  } catch (err) {
    console.log(err);
  }
}

updateGeometry();
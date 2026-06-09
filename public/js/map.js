const lat = listing.geometry?.lat || 19.0760;
const lng = listing.geometry?.lng || 72.8777;

const map = L.map("map").setView([lat, lng], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
}).addTo(map);

// Property Marker
L.marker([lat, lng])
    .addTo(map)
    .bindPopup(`
        <b>${listing.title}</b>
        <br>
        ${listing.location}
    `)
    .openPopup();

// Fetch nearby places
fetch(`/listing/${listing._id}/nearby`)
    .then((res) => res.json())
    .then((data) => {

        data.elements.forEach((place) => {

            if (!place.lat || !place.lon) return;

            const name =
                place.tags?.name || "Unnamed Place";

            const type =
                place.tags?.amenity ||
                place.tags?.tourism ||
                place.tags?.shop ||
                "Place";

            L.marker([place.lat, place.lon])
                .addTo(map)
                .bindPopup(`
                    <b>${name}</b>
                    <br>
                    ${type}
                `);
        });
    })
    .catch((err) => {
        console.log(err);
    });
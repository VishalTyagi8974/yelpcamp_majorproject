const map = L.map("map").setView([lat, long], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
}).addTo(map);

const marker = L.marker([lat, long]).addTo(map);

marker.bindPopup(title).openPopup();


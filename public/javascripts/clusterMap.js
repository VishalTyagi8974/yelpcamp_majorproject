map = L.map("map").setView([20.5937, 78.9629], 4);
L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png").addTo(map);

const markers = L.markerClusterGroup();
const camps = JSON.parse(campgrounds);

for (let i = 0; i < camps.length; i++) {
    const [longitude, latitude] = camps[i].geometry.coordinates;
    const title = camps[i].title;
    const id = camps[i]._id; // Assuming each campground has a unique ID

    const marker = L.marker(new L.LatLng(latitude, longitude), {
        title: title,
    });

    const popupContent = `<b>${title}</b><br><a href="/campgrounds/${camps[i]._id}">View Details</a>`;
    marker.bindPopup(popupContent);

    markers.addLayer(marker);
}

map.addLayer(markers);

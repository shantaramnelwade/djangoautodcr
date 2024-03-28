var map = L.map('map').setView([51.505, -0.09], 10);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

fetch('http://127.0.0.1:8000/get_villages/')
    .then(response => response.json())
    .then(data => {
        L.geoJSON(data, {
            style: function (feature) {
                return { color: 'green' };
            },
            onEachFeature: function (feature, layer) {
                if (feature.properties && feature.properties.name) {
                    layer.bindPopup(feature.properties.name);
                }
            }
        }).addTo(map);
        map.fitBounds(L.geoJSON(data).getBounds()); // Optional: Zoom to the bounds of the GeoJSON data
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });

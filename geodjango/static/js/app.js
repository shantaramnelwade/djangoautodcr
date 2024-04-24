var map = L.map("map").setView([18.5204, 73.8567], 12);

var marker;

var googleSat = L.tileLayer(
    "http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
    {
        maxZoom: 20,
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
    }
);

var osm = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {}
).addTo(map);

var Esri_WorldImagery = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {}
);
var baseLayers = {};

var Revenue_Layer = L.tileLayer.wms(
    "https://portal.geopulsea.com/geoserver/AutoDCR/wms",
    {
        layers: "Revenue_1",
        format: "image/png",
        transparent: true,
        tiled: true,
        version: "1.1.0",
        opacity: 1,
    }
);

var Revenue_Layer1 = L.tileLayer.wms(
    "https://portal.geopulsea.com/geoserver/pmc/wms",
    {
        layers: "IWMS_point",
        format: "image/png",
        transparent: true,
        tiled: true,
        version: "1.1.0",
        opacity: 1,
    }
);

var world_photo = L.tileLayer
    .wms("http://localhost:8080/geoserver/pmc/wms", {
        layers: "world_photo",
        format: "image/png",
        transparent: true,
        tiled: true,
        version: "1.1.0",
        opacity: 1,
    })
    .addTo(map);

var roads = L.tileLayer
    .wms("https://pmc.geopulsea.com/geoserver/pmc/wms", {
        layers: "Exist_Road",
        format: "image/png",
        transparent: true,
        tiled: true,
        version: "1.1.0",
        maxZoom: 21,
        opacity: 1,
    })
    .addTo(map);

var WMSlayers = {
    OSM: osm,
    Esri: Esri_WorldImagery,
    Satellite: googleSat,
    Revenue: Revenue_Layer,
    Roads: Revenue_Layer1,
    photo: world_photo,
    roads: roads,
};

getLocation();

var control = new L.control.layers(baseLayers, WMSlayers).addTo(map);
control.setPosition("topright");

var button = L.control();

button.onAdd = function (map) {
    var div = L.DomUtil.create("div", "custom-button");
    div.innerHTML =
        '<button onclick="uploadphoto()" >upload photo  <i class="fa-regular fa-circle-right"></i></button>';
    return div;
};

button.addTo(map);

// for editing layers

var editableLayers = new L.FeatureGroup().addTo(map);

map.on("click", function (e) {
    let size = map.getSize();
    let bbox = map.getBounds().toBBoxString();
    let layer = "pmc:Exist_Road";
    var url = `https://pmc.geopulsea.com/geoserver/pmc/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetFeatureInfo&FORMAT=image%2Fpng&TRANSPARENT=true&QUERY_LAYERS=${layer}&STYLES&LAYERS=${layer}&exceptions=application%2Fvnd.ogc.se_inimage&INFO_FORMAT=application/json&FEATURE_COUNT=50&X=${Math.round(
        e.containerPoint.x
    )}&Y=${Math.round(e.containerPoint.y)}&SRS=EPSG%3A4326&WIDTH=${size.x
        }&HEIGHT=${size.y}&BBOX=${bbox}`;

    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            highlightFeature(data);
        });
});
function highlightFeature(featureData) {
    // Clear existing layers
    editableLayers.clearLayers();

    if (!featureData || !featureData.features || featureData.features.length === 0) {
        return;
    }

    var feature = featureData.features[0];

    var geojsonLayer = L.geoJSON(feature, {
        style: {
            color: "red",
            weight: 3,
            opacity: 1,
            fillOpacity: 0.5,
        },
    });

    editableLayers.addLayer(geojsonLayer);

    if (editableLayers.getLayers().length > 0) {
        map.fitBounds(editableLayers.getBounds());
    }
}


editableLayers.on("click", function (e) {
    var latlng = e.latlng;
    var popupContent = '<div>';
    popupContent += '<button id="saveDataButton" style="background-color:green; border:none; margin:5px; color:white; padding:10px;">Save Data</button>';
    popupContent += '<button id="editFeatureButton" style="background-color:green; border:none; margin:5px; color:white; padding:10px;">Edit Feature</button>';
    popupContent += '</div>';

    var popup = L.popup()
        .setLatLng(latlng)
        .setContent(popupContent)
        .openOn(map);

    document.getElementById("saveDataButton").addEventListener("click", function () {
        navigator.geolocation.getCurrentPosition(function (position) {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            var latLng = L.latLng(latitude, longitude);
            console.log(latlng)
            navigator.mediaDevices
                .getUserMedia({ video: true })
                .then(function (stream) {
                    var video = document.createElement("video");
                    video.srcObject = stream;
                    video.play();

                    var captureButton = document.createElement("button");
                    captureButton.textContent = "Capture Photo";
                    captureButton.onclick = function () {
                        var canvas = document.createElement("canvas");
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;
                        canvas
                            .getContext("2d")
                            .drawImage(video, 0, 0, canvas.width, canvas.height);

                        var img = document.createElement("img");
                        img.src = canvas.toDataURL("image/jpeg");
                        var saveButton = document.createElement("button");
                        saveButton.textContent = "Save";
                        saveButton.onclick = function () {
                            var formData = new FormData();
                            formData.append("image_data", canvas.toDataURL("image/jpeg"));
                            formData.append("latitude", latlng.lat);
                            formData.append("longitude", latlng.lng);

                            formData.append("clatitude", latitude);
                            formData.append("clongitude", longitude);


                            var csrftoken = getCookie("csrftoken");
                            $.ajax({
                                url: "/save_photo/",
                                type: "POST",
                                beforeSend: function (xhr, settings) {
                                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                                },
                                data: formData,
                                processData: false,
                                contentType: false,
                                success: function (data) {
                                    console.log("Photo saved successfully:", data);
                                },
                                error: function (xhr, status, error) {
                                    console.error("Error saving photo:", error);
                                },
                            });

                            function getCookie(name) {
                                var cookieValue = null;
                                if (document.cookie && document.cookie !== "") {
                                    var cookies = document.cookie.split(";");
                                    for (var i = 0; i < cookies.length; i++) {
                                        var cookie = cookies[i].trim();
                                        if (cookie.substring(0, name.length + 1) === name + "=") {
                                            cookieValue = decodeURIComponent(
                                                cookie.substring(name.length + 1)
                                            );
                                            break;
                                        }
                                    }
                                }
                                return cookieValue;
                            }
                        };

                        var popupContent = document.createElement("div");
                        popupContent.appendChild(img);
                        popupContent.appendChild(saveButton);

                        var popup = L.popup().setContent(popupContent);
                        L.marker(latlng).addTo(map).bindPopup(popup).openPopup();
                        popup.on("remove", function () {
                            stream.getTracks().forEach(function (track) {
                                track.stop();
                            });
                        });
                    };

                    var popupContent = document.createElement("div");
                    popupContent.appendChild(video);
                    popupContent.appendChild(captureButton);

                    var popup = L.popup().setContent(popupContent);
                    L.marker(latlng).addTo(map).bindPopup(popup).openPopup();
                })
                .catch(function (err) {
                    console.error("Error accessing the camera:", err);
                });
        });




        alert("Save data clicked");
    });

    document.getElementById("editFeatureButton").addEventListener("click", function () {
        alert("Edit feature clicked");
    });
});


var layers = ["pmc:world_photo", "pmc:Roads", "pmc:Reservations"];
map.on("contextmenu", (e) => {
    let bbox = map.getBounds().toBBoxString();
    let size = map.getSize();
    for (let i = 0; i < layers.length; i++) {
        let layer = layers[i];
        let url = `http://localhost:8080/geoserver/pmc/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetFeatureInfo&FORMAT=image%2Fpng&TRANSPARENT=true&QUERY_LAYERS=${layer}&STYLES&LAYERS=${layer}&exceptions=application%2Fvnd.ogc.se_inimage&INFO_FORMAT=application/json&FEATURE_COUNT=50&X=${Math.round(
            e.containerPoint.x
        )}&Y=${Math.round(e.containerPoint.y)}&SRS=EPSG%3A4326&WIDTH=${size.x
            }&HEIGHT=${size.y}&BBOX=${bbox}`;
        fetch(url)
            .then((response) => response.json())
            .then((data) => {
                if (data.features && data.features.length > 0) {
                    // console.log(data.features)
                    const feature = data.features[0];
                    const idd = feature.id;
                    let html = "<div>";
                    var formData1 = new FormData();
                    formData1.append("idd", idd);

                    const properties = feature.properties;

                    // console.log(properties, "properties", idd)
                    var csrftoken = getCookie("csrftoken");
                    $.ajax({
                        url: "/get_photo/",
                        type: "POST",
                        beforeSend: function (xhr, settings) {
                            xhr.setRequestHeader("X-CSRFToken", csrftoken);
                        },
                        data: formData1,
                        processData: false,
                        contentType: false,
                        success: function (data) {
                            console.log("Photo saved successfully:", data);

                            let html = "<div>";
                            html += ` <img src="data:image/png;base64,${data.image_data}" alt="Image"></img>`;
                            html += `<p> X:${data.X}</p>`;
                            html += `<p> Y:${data.Y}</p>`;

                            // Add other properties to the popup content
                            // for (let key in properties) {
                            //     if (key !== "image_data") {
                            //         html += `<p>${key}: ${properties[key]}</p>`;
                            //     }
                            // }
                            // html += `<p>${key}: ${properties[key]}</p>`;

                            html += "</div>";
                            // console.log(html)
                            L.popup().setLatLng(e.latlng).setContent(html).openOn(map);
                        },
                    });
                }
            });
    }
});

function uploadphoto() {
    navigator.geolocation.getCurrentPosition(function (position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        var latLng = L.latLng(latitude, longitude);
        // console.log(latLng)
        navigator.mediaDevices
            .getUserMedia({ video: true })
            .then(function (stream) {
                var video = document.createElement("video");
                video.srcObject = stream;
                video.play();

                var captureButton = document.createElement("button");
                captureButton.textContent = "Capture Photo";
                captureButton.onclick = function () {
                    var canvas = document.createElement("canvas");
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    canvas
                        .getContext("2d")
                        .drawImage(video, 0, 0, canvas.width, canvas.height);

                    var img = document.createElement("img");
                    img.src = canvas.toDataURL("image/jpeg");
                    var saveButton = document.createElement("button");
                    saveButton.textContent = "Save";
                    saveButton.onclick = function () {
                        var formData = new FormData();
                        formData.append("image_data", canvas.toDataURL("image/jpeg"));
                        formData.append("latitude", latitude);
                        formData.append("longitude", longitude);

                        var csrftoken = getCookie("csrftoken");
                        $.ajax({
                            url: "/save_photo/",
                            type: "POST",
                            beforeSend: function (xhr, settings) {
                                xhr.setRequestHeader("X-CSRFToken", csrftoken);
                            },
                            data: formData,
                            processData: false,
                            contentType: false,
                            success: function (data) {
                                console.log("Photo saved successfully:", data);
                            },
                            error: function (xhr, status, error) {
                                console.error("Error saving photo:", error);
                            },
                        });

                        function getCookie(name) {
                            var cookieValue = null;
                            if (document.cookie && document.cookie !== "") {
                                var cookies = document.cookie.split(";");
                                for (var i = 0; i < cookies.length; i++) {
                                    var cookie = cookies[i].trim();
                                    if (cookie.substring(0, name.length + 1) === name + "=") {
                                        cookieValue = decodeURIComponent(
                                            cookie.substring(name.length + 1)
                                        );
                                        break;
                                    }
                                }
                            }
                            return cookieValue;
                        }
                    };

                    var popupContent = document.createElement("div");
                    popupContent.appendChild(img);
                    popupContent.appendChild(saveButton);

                    var popup = L.popup().setContent(popupContent);
                    L.marker(latLng).addTo(map).bindPopup(popup).openPopup();
                    popup.on("remove", function () {
                        stream.getTracks().forEach(function (track) {
                            track.stop();
                        });
                    });
                };

                var popupContent = document.createElement("div");
                popupContent.appendChild(video);
                popupContent.appendChild(captureButton);

                var popup = L.popup().setContent(popupContent);
                L.marker(latLng).addTo(map).bindPopup(popup).openPopup();
            })
            .catch(function (err) {
                console.error("Error accessing the camera:", err);
            });
    });
}

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== "") {
        var cookies = document.cookie.split(";");
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === name + "=") {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

document.addEventListener("DOMContentLoaded", function () {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                console.log(
                    "User location:",
                    position.coords.latitude,
                    position.coords.longitude
                );
                // You can send this location to your Django backend if needed
            },
            function (error) {
                console.error("Error getting user location:", error);
            }
        );
    } else {
        console.error("Geolocation is not supported by this browser");
    }
});

navigator.geolocation.getCurrentPosition(
    function (position) {
        console.log(
            "User location:",
            position.coords.latitude,
            position.coords.longitude
        );
        // You can send this location to your Django backend if needed
    },
    function (error) {
        console.error("Error getting user location:", error);
    },
    { enableHighAccuracy: true }
);

let watchId = navigator.geolocation.watchPosition(
    function (position) {
        console.log(
            "User location:",
            position.coords.latitude,
            position.coords.longitude
        );
        // You can send this location to your Django backend if needed
    },
    function (error) {
        console.error("Error getting user location:", error);
    },
    { enableHighAccuracy: true }
);

// show location on map

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function showPosition(position) {
    var lat = position.coords.latitude;
    var lng = position.coords.longitude;
    var newLatLng = new L.LatLng(lat, lng);

    if (marker) {
        marker.setLatLng(newLatLng);
    } else {
        marker = L.marker(newLatLng).addTo(map);
    }

    map.setView(newLatLng, 13);
}

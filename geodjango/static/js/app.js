
 var map = L.map('map').setView([18.5204, 73.8567], 12);

var googleSat = L.tileLayer(
    "http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
    {
        maxZoom: 20,
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
    }
);

var osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {

}).addTo(map);

var Esri_WorldImagery = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
    }
);
var baseLayers = {};

var Revenue_Layer = L.tileLayer
    .wms("https://portal.geopulsea.com/geoserver/AutoDCR/wms", {
        layers: "Revenue_1",
        format: "image/png",
        transparent: true,
        tiled: true,
        version: "1.1.0",
        opacity: 1,
    });

var Revenue_Layer1 = L.tileLayer
    .wms("https://portal.geopulsea.com/geoserver/pmc/wms", {
        layers: "IWMS_point",
        format: "image/png",
        transparent: true,
        tiled: true,
        version: "1.1.0",
        opacity: 1,
    });

var WMSlayers = {
    "OSM": osm,
    "Esri": Esri_WorldImagery,
    "Satellite": googleSat,
    Revenue: Revenue_Layer,
    Roads: Revenue_Layer1,
};

var control = new L.control.layers(baseLayers, WMSlayers).addTo(map);
control.setPosition('topright');


var button = L.control();

button.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'custom-button');
    div.innerHTML = '<button onclick="uploadphoto()" >upload photo  <i class="fa-regular fa-circle-right"></i></button>';
    return div;
};

button.addTo(map);


function uploadphoto(){
    alert("heheh")
    // alert("heheh");
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(function (stream) {
            var video = document.createElement('video');
            video.srcObject = stream;
            video.play();

            var captureButton = document.createElement('button');
            captureButton.textContent = 'Capture Photo';
            captureButton.onclick = function () {
                var canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

                var img = document.createElement('img');
                img.src = canvas.toDataURL('image/jpeg');

                var saveButton = document.createElement('button');
                saveButton.textContent = 'Save';
                saveButton.onclick = function () {
                    var formData = new FormData();
                    formData.append('photo', canvas.toDataURL('image/jpeg'));

                    var csrftoken = getCookie('csrftoken');

                    $.ajax({
                        url: '/save_photo/',
                        type: 'POST',
                        beforeSend: function(xhr, settings) {
                            xhr.setRequestHeader("X-CSRFToken", csrftoken);
                        },
                        data: formData,
                        processData: false,
                        contentType: false,
                        success: function(data) {
                            console.log('Photo saved successfully:', data);
                        },
                        error: function(xhr, status, error) {
                            console.error('Error saving photo:', error);
                        }
                    });
                };

                var popupContent = document.createElement('div');
                popupContent.appendChild(img);
                popupContent.appendChild(saveButton);

                var popup = L.popup().setContent(popupContent);
                L.marker(map.getCenter()).addTo(map).bindPopup(popup).openPopup();

                // Close the stream when the popup is closed
                popup.on('remove', function () {
                    stream.getTracks().forEach(function (track) {
                        track.stop();
                    });
                });
            };

            var popupContent = document.createElement('div');
            popupContent.appendChild(video);
            popupContent.appendChild(captureButton);

            var popup = L.popup().setContent(popupContent);
            L.marker(map.getCenter()).addTo(map).bindPopup(popup).openPopup();
        })
        .catch(function (err) {
            console.error('Error accessing the camera:', err);
        });


}

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
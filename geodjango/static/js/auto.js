
var map, geojson;
// const API_URL = "http://localhost/autodcr/";
/
var map = L.map("map", {}).setView([18.52, 73.895], 12, L.CRS.EPSG4326);

var googleSat = L.tileLayer(
    "http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
    {
        maxZoom: 20,
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
    }
);

var osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    // attribution:
    //   '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

var Esri_WorldImagery = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
        // attribution:
        //   "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
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
        // attribution: "Revenue",
        opacity: 1,
    });

// .addTo(map);


// for only gut showing
var Revenue_Layer1 = L.tileLayer
    .wms("https://portal.geopulsea.com/geoserver/AutoDCR/wms", {
        layers: "Revenue_1",
        format: "image/png",
        transparent: true,
        tiled: true,
        version: "1.1.0",
        // attribution: "Revenue",
        opacity: 1,
    });

var PLU_Layer = L.tileLayer
    .wms("https://portal.geopulsea.com/geoserver/AutoDCR/wms", {
        layers: "PLU_Ward",
        format: "image/png",
        transparent: true,
        tiled: true,
        version: "1.1.0",
        // attribution: "Revenue",
        opacity: 1,
    });

var DPRoad_Layer = L.tileLayer
    .wms("https://portal.geopulsea.com/geoserver/AutoDCR/wms", {
        layers: "DP_Ward_Road",
        format: "image/png",
        transparent: true,
        tiled: true,
        version: "1.1.0",
        // attribution: "Revenue",
        opacity: 1,
    });

var Boundary_Layer = L.tileLayer
    .wms("https://portal.geopulsea.com/geoserver/AutoDCR/wms", {
        layers: "PMC_Boundary",
        format: "image/png",
        transparent: true,
        tiled: true,
        version: "1.1.0",
        // attribution: "Revenue",
        opacity: 1,
    }).addTo(map);

var Village_Boundary = L.tileLayer
    .wms("https://portal.geopulsea.com/geoserver/AutoDCR/wms", {
        layers: "Village_Boundary",
        format: "image/png",
        transparent: true,
        tiled: true,
        version: "1.1.0",
        // attribution: "Revenue",
        opacity: 1,
    }).addTo(map);


var WMSlayers = {
    "OSM": osm,
    "Esri": Esri_WorldImagery,
    "Satellite": googleSat,

    Revenue: Revenue_Layer,
    PLU: PLU_Layer,
    DPRoad: DPRoad_Layer,
    Boundary: Boundary_Layer,
    Village: Village_Boundary


};


var control = new L.control.layers(baseLayers, WMSlayers).addTo(map);
control.setPosition('topright');

// Remove the default zoom control
map.zoomControl.remove();

L.control.zoom({
    position: 'bottomright' // Set position to bottom right
}).addTo(map);


var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

var drawControl = new L.Control.Draw({
    edit: {
        featureGroup: drawnItems
    },
    draw: {
        polygon: {
            shapeOptions: {
                color: "red", // set the color for the polygon border
            },
            icon: new L.DivIcon({
                iconSize: new L.Point(6, 6), // set the size of the icon
                className: "leaflet-div-icon", // specify the icon class
            }),
        },

        polyline: false,
        rectangle: false,
        circle: false,
        marker: false
    }
});
map.addControl(drawControl);




// save polygons into database variable

var drawnPolygons = {};

map.on('draw:created', function (e) {
    var layer = e.layer;
    drawnItems.addLayer(layer);

    // var bounds = layer.getBounds().toBBoxString();
    var drawnPolygon = layer.toGeoJSON();
    console.log(drawnPolygon.geometry.type)

    // Ensure the drawn polygon is a valid Polygon
    if (drawnPolygon.geometry.type === 'Polygon') {
        var polygonId = 'polygon_draw'

        drawnPolygons[polygonId] = layer.toGeoJSON().geometry.coordinates;
        console.log(drawnPolygons, "drawnPolygons", "polygonCounter")
        // IntersectAreaWithPolygon(drawnPolygon, layers, url, propertyName, bounds, outputFormat);
    } else {
        console.log('Drawn geometry is not a valid Polygon.');
    }
});



$(document).ready(function () {
    trials();

    function trials() {
        var geoServerURL = "https://portal.geopulsea.com//geoserver/AutoDCR/wms?service=WFS&version=1.1.0&request=GetFeature&typeName=Revenue_1&propertyName=village_name&outputFormat=application/json";

        $.getJSON(geoServerURL)
            .done(function (data) {
                var villageSet = new Set();
                data.features.forEach(function (feature) {
                    villageSet.add(feature.properties.village_name);
                });

                var select = document.getElementById("search_type");
                villageSet.forEach(function (village) {
                    var option = document.createElement("option");
                    option.text = village;
                    option.value = village;
                    select.appendChild(option);
                });
            })
            .fail(function (jqxhr, textStatus, error) {
                var err = textStatus + ", " + error;
                console.log("Request Failed: " + err);
            });
    }
});
// autocompleteSuggestions

$("#search_type").change(function () {
    var selectedValueVillage = $(this).val();
    var Village_name = 'village_name'
    let filters = `${Village_name} = '${selectedValueVillage}'`;

    // Update Revenue_Layer with new CQL_FILTER

    FitbouCustomiseRevenue(filters)
    Revenue_Layer.setParams({
        CQL_FILTER: filters,
        maxZoom: 19.5,
        styles: "Highlight_polygon"
    }).addTo(map);

    function getvalues(callback) {
        var geoServerURL =
            "https://portal.geopulsea.com//geoserver/AutoDCR/wms?service=WFS&version=1.1.0&request=GetFeature&typeName=Revenue_1&propertyName=Gut_No&outputFormat=application/json";

        if (filters) {
            geoServerURL += "&CQL_FILTER=" + encodeURIComponent(filters);
        }

        $.getJSON(geoServerURL, function (data) {
            var gutvalues = new Set();

            // Populate the Set with gut numbers
            $.each(data.features, function (index, feature) {
                var gutss = feature.properties.Gut_No;
                gutvalues.add(gutss);
            });

            // Convert the Set to an array
            var Uniqueguts = Array.from(gutvalues);
            console.log(Uniqueguts, "Uniqueguts");

            // Call the callback function if it's provided
            if (callback && typeof callback === "function") {
                callback(Uniqueguts);
            }
        });
    }

    // Call getvalues function and pass a callback function to handle Uniqueguts
    getvalues(function (Uniqueguts) {
        console.log(Uniqueguts, "Uniqueguts");

        var stateList = $('#stateList');
        stateList.empty();
        // console.log(stateList,"stateList")
        _.each(Uniqueguts, function (state) {
            var listItem = $('<li><input name="' + state + '" type="checkbox"><label for="' + state + '">' + state + '</label></li>');
            stateList.append(listItem);
        });

        // Events
        $('.dropdown-container')
            .on('click', '.dropdown-button', function () {
                $(this).siblings('.dropdown-list').toggle();
            })
            .on('input', '.dropdown-search', function () {
                var target = $(this);
                var dropdownList = target.closest('.dropdown-list');
                var search = target.val().toLowerCase();

                if (!search) {
                    dropdownList.find('li').show();
                    return false;
                }

                dropdownList.find('li').each(function () {
                    var text = $(this).text().toLowerCase();
                    var match = text.indexOf(search) > -1;
                    $(this).toggle(match);
                });
            })
            .on('change', '[type="checkbox"]', function () {
                var container = $(this).closest('.dropdown-container');
                var numChecked = container.find('[type="checkbox"]:checked').length;
                container.find('.quantity').text(numChecked || 'Any');
            });


    });


    $(document).on('change', '#stateList input[type="checkbox"]', function () {
        var cqlFilter = getSelectedValues();
        console.log(cqlFilter, "Selected filters");

        // Update the map with the new filter
        FitbouCustomiseRevenue(cqlFilter);
        Revenue_Layer1.setParams({
            CQL_FILTER: cqlFilter,
            maxZoom: 23,
            styles: "Highlight_polygon1"
        }).addTo(map).bringToFront();
    });

    // Function to get the selected checkbox values and construct the CQL filter

    function getSelectedValues() {
        var selectedValues = [];
        $('input[type="checkbox"]:checked').each(function () {
            var name = $(this).attr('name');
            if (name !== undefined) {
                selectedValues.push("'" + name + "'");
            }
        });
        var cqlFilterGut = ""
        if (selectedValues.length > 0) {
            cqlFilterGut = "Gut_No IN (" + selectedValues.join(",") + ")";
        } else {
            cqlFilterGut = ""
        }
        console.log(cqlFilterGut, "cqlFilterGut")

        var cqlFilter = "";
        if (cqlFilterGut && filters) {
            cqlFilter = "(" + cqlFilterGut + ") AND (" + filters + ")";
        } else {
            cqlFilter = cqlFilterGut || filters;
        }
        localStorage.setItem('cqlFilter', cqlFilter);

        return cqlFilter;
    }

    var initialCqlFilter = getSelectedValues();




})

// Create a button element
var button = L.control({ position: 'bottomright' });

button.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'custom-button');
    div.innerHTML = '<button onclick="savevalues()" >Next  <i class="fa-regular fa-circle-right"></i></button>';
    return div;
};

button.addTo(map);



function FitbouCustomiseRevenue(filter) {
    layers = ["AutoDCR:Revenue_1"];
    layers.forEach(function (layerName) {
        var urlm =
            "https://portal.geopulsea.com//geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=" +
            layerName +
            "&CQL_FILTER=" +
            filter +
            "&outputFormat=application/json";
        $.getJSON(urlm, function (data) {
            geojson = L.geoJson(data, {});
            map.fitBounds(geojson.getBounds());
        });
    });
}


// for uploading kml/kmz file and loading on map 
document.getElementById('fileInput').addEventListener('change', function (e) {
    var file = e.target.files[0];
    if (!file) {
        return;
    }

    var reader = new FileReader();
    reader.onload = function (e) {
        var kmlContent = e.target.result;
        if (file.name.toLowerCase().endsWith('.kmz')) {
            JSZip.loadAsync(file).then(function (zip) {
                var kmlFound = false;
                for (var name in zip.files) {
                    if (name.toLowerCase().endsWith('.kml')) {
                        kmlFound = true;
                        zip.files[name].async('string').then(function (kmlString) {
                            processKML(kmlString);
                        });
                        break;
                    }
                }
                if (!kmlFound) {
                    alert('No valid KML file found in the KMZ archive.');
                }
            });
        } else if (file.name.toLowerCase().endsWith('.kml')) {
            processKML(kmlContent);
        } else if (file.name.toLowerCase().endsWith('.csv')) {

            processCSV(kmlContent)

        } else {
            alert('Invalid file file.');
        }
    };
    reader.readAsText(file);
});

function processKML(kmlString) {
    var layer = omnivore.kml.parse(kmlString);
    if (layer.getBounds().isValid()) {
        layer.addTo(map);
        console.log(layer.toGeoJSON())
        // for saving coordinates
        var polygonId = 'polygon_kml'
        drawnPolygons[polygonId] = layer.toGeoJSON().features[0].geometry.coordinates;
        console.log(drawnPolygons, "drawnPolygons", "polygonCounter");

        map.fitBounds(layer.getBounds());
    } else {
        alert('Invalid KML/KMZ file.');
    }
}

function processCSV(kmlContent) {
    var data = Papa.parse(kmlContent, { header: true, dynamicTyping: true }).data;
    data = data.filter(row => row.latitude !== null && row.longitude !== null);
    var polygon = L.polygon(data.map(coord => [coord.latitude, coord.longitude])).addTo(map);
    if (polygon.getBounds().isValid()) {

        // for saving coordinates
        var polygonId = 'polygon_csv'
        drawnPolygons[polygonId] = polygon.toGeoJSON().geometry.coordinates;
        console.log(drawnPolygons, "drawnPolygons", "polygonCounter");


        map.fitBounds(polygon.getBounds());
    } else {
        alert('Invalid csv file.');
    }
}


// for adding coordinates manulay



document.getElementById('toggleFormBtn').addEventListener('click', function () {
    var formContainer = document.getElementById('formContainer');
    formContainer.style.display = (formContainer.style.display === 'none') ? 'block' : 'none';
});

document.getElementById('closeFormBtn').addEventListener('click', function () {
    var formContainer = document.getElementById('formContainer');
    formContainer.style.display = 'none';
});
$('#formContainer').draggable();

// Show one row initially
var table = document.getElementById('coordinateTable');
addCoordinateRow(table);

// Event listener for adding more rows
document.getElementById('addRowBtn').addEventListener('click', function () {
    addCoordinateRow(table);
});





// Function to add a new coordinate row
function addCoordinateRow(table) {
    var row = table.insertRow();
    var longitudeCell = row.insertCell();
    var latitudeCell = row.insertCell();
    var actionCell = row.insertCell();

    var longitudeInput = document.createElement('input');
    longitudeInput.setAttribute('type', 'text');
    longitudeInput.setAttribute('placeholder', '73.856785778');
    longitudeInput.setAttribute('name', 'longitude[]');
    longitudeInput.classList.add('coordinate-input'); // Add CSS class to input

    var latitudeInput = document.createElement('input');
    latitudeInput.setAttribute('type', 'text');
    latitudeInput.setAttribute('placeholder', '18.856785778');
    latitudeInput.setAttribute('name', 'latitude[]');
    latitudeInput.classList.add('coordinate-input'); // Add CSS class to input

    longitudeCell.appendChild(longitudeInput);
    latitudeCell.appendChild(latitudeInput);

    actionCell.innerHTML = '<button type="button" class="deleteRowBtn"><i class="fa-solid fa-trash-can"></i></button>';

    // Add event listener to delete button
    var deleteBtn = actionCell.querySelector('.deleteRowBtn');
    deleteBtn.addEventListener('click', function () {
        row.remove();
    });
}

// 

document.getElementById('coordinateForm').addEventListener('submit', function (event) {
    event.preventDefault();
    var formData = new FormData(this);
    var coordinates = [];

    // Process form data here
    formData.getAll('longitude[]').forEach(function (longitude, index) {
        var latitude = formData.getAll('latitude[]')[index];
        coordinates.push([parseFloat(latitude), parseFloat(longitude)]);
    });

    console.log(coordinates, ",coordinates");
    markershow = [];
    // Add markers to the map
    if (coordinates.length < 4) {
        alert('Please enter at least four coordinates.');
        return;
    } else {
        var polygon = L.polygon(coordinates).addTo(map);
        map.fitBounds(polygon.getBounds());

        var polygonId = 'polygon_coors'
        // polygonCounter++;
        drawnPolygons[polygonId] = coordinates;

        console.log(drawnPolygons, "drawnPolygons", "polygonCounter");
    }


});

function savevalues() {
    console.log(drawnPolygons, "drawnPolygons")
    Object.keys(drawnPolygons).forEach(function (polygonId) {
        // checkBoxGutVillage();
        var coordinates = drawnPolygons[polygonId];
        console.log(coordinates, "cordinates")
        var pp = turf.polygon(coordinates);
        L.geoJSON(pp).addTo(map)
        var bounds = L.geoJSON(pp).getBounds();
        map.fitBounds(bounds);
        console.log(bounds)

        var layers = ["AutoDCR:Revenue_1"];
        var url = "https://portal.geopulsea.com//geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=";
        var propertyName = "village_name,TPS_Name,Gut_No,geom";
        var outputFormat = "application/json";
        IntersectAreaWithPolygon(pp, layers, url, propertyName, bounds.toBBoxString(), outputFormat)
        localStorage.setItem('coordinates', JSON.stringify(coordinates));



    });
    window.location.href = 'data.html';

    // alert("heheeh");
};

function IntersectAreaWithPolygon(drawnPolygon, layers, url, propertyName, bounds, outputFormat) {
    layers.forEach(function (layerName) {
        var urlm = url + layerName +
            "&propertyName=" + propertyName + "&bbox=" +
            bounds +
            "&outputFormat=" + outputFormat;

        $.getJSON(urlm, function (data) {
            console.log(data);

            if (data && data.features && data.features.length > 0) {
                var intersectedFeatures = [];
                data.features.forEach(function (feature) {
                    var intersectedFeature = turf.intersect(feature, drawnPolygon);
                    if (intersectedFeature && intersectedFeature.geometry.type !== 'GeometryCollection') {
                        // Copy the properties from the original feature to the intersected feature
                        intersectedFeature.properties = feature.properties;
                        intersectedFeatures.push(intersectedFeature);
                    }
                });
                var intersectedLayer = L.geoJSON(intersectedFeatures, {
                    style: {
                        color: 'red',
                        weight: 2
                    }
                });
                intersectedLayer.addTo(map);
                intersectedLayer.eachLayer(function (layer) {
                    var properties = layer.feature.properties;
                    var area = turf.area(layer.feature);
                    layer.bindPopup(`Area: ${area.toFixed(2)} sq meters<br>Properties: ${JSON.stringify(properties)}`);
                });

                // Log the properties of each intersected feature
                intersectedFeatures.forEach(function (feature) {
                    var properties = feature.properties;
                    // console.log('Intersected feature properties:', properties);
                    localStorage.setItem('properties', JSON.stringify(properties))
                });
            } else {
                console.log('No valid features found in the response.');
            }
        });
    });
}
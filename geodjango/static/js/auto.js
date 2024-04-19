
var map, geojson;
// const API_URL = "http://localhost/autodcr/";

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




var WMSlayers = {
    "OSM": osm,
    "Esri": Esri_WorldImagery,
    "Satellite": googleSat,
    Revenue: Revenue_Layer,



};


var control = new L.control.layers(baseLayers, WMSlayers).addTo(map);
control.setPosition('topright');



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
    
    // Retrieve the CSRF token from cookies
    const csrftoken = getCookie('csrftoken');

    $.ajax({
        url: '/save_data/',
        type: 'POST',
        data: {
            'Village': selectedValueVillage
        },
        headers: {
            'X-CSRFToken': csrftoken  // Include the CSRF token in the request headers
        },
        success: function (data) {
            console.log(data, "data");
            var stateList = $('#stateList');
            stateList.empty();
            var optionsArray = data.options;
            console.log(optionsArray);
            $.each(optionsArray, function (index, state) {
                var listItem = $('<li><input name="' + state + '" type="checkbox"><label for="' + state + '">' + state + '</label></li>');
                stateList.append(listItem);
            });
        },
        error: function (xhr, errmsg, err) {
            console.log(xhr.status + ": " + xhr.responseText);
        }
    });


    FitbouCustomiseRevenue(filters)
    Revenue_Layer.setParams({
        CQL_FILTER: filters,
        maxZoom: 19.5,
        styles: "Highlight_polygon"
    }).addTo(map);


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




function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Check if the cookie name matches the requested name
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

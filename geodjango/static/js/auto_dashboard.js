
map = L.map("map", { // Remove var to make it global
    center: [18.52, 73.89],
    zoom: 11,
    minZoom: 10,
    maxZoom: 18,
    boxZoom: true,
    trackResize: true,
    wheelPxPerZoomLevel: 40,
    zoomAnimation: true,
});

var googleSat = L.tileLayer(
    "http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
    {
        maxZoom: 20,
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
    }
);

var osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 20,
}).addTo(map);

var Esri_WorldImagery = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
        maxZoom: 20,
    }
);
var baseLayers = {
    "OSM": osm,
    "Esri": Esri_WorldImagery,
    "Satellite": googleSat,
};

var control = new L.control.layers(baseLayers).addTo(map);
control.setPosition('topright');


var acc = document.getElementsByClassName("accordion");
var i;

for (i = 0; i < acc.length; i++) {
    acc[i].addEventListener("click", function () {
        this.classList.toggle("active");
        var panel = this.nextElementSibling;
        if (panel.style.display === "block") {
            panel.style.display = "none";
        } else {
            panel.style.display = "block";
        }
    });
}


var values = ['Option 1', 'Option 2', 'Option 3', 'shantaram',"bhavana", "terana","duhaalna"];

    var checkboxContainer = document.getElementById('checkbox-container');

    // Add Select All checkbox
    var selectAllLabel = document.createElement('label');
    var selectAllCheckbox = document.createElement('input');
    selectAllCheckbox.type = 'checkbox';
    selectAllCheckbox.onclick = function() {
        var checkboxes = checkboxContainer.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(function(checkbox) {
            checkbox.checked = selectAllCheckbox.checked;
        });
        updateSelectedCount();
    };
    selectAllLabel.appendChild(selectAllCheckbox);
    selectAllLabel.appendChild(document.createTextNode(' Select All'));
    checkboxContainer.appendChild(selectAllLabel);
    checkboxContainer.appendChild(document.createElement('br'));

    // Add other checkboxes
    values.forEach(function(value) {
        var label = document.createElement('label');
        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = value;
        checkbox.onchange = function() {
            updateSelectedCount();
        };
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(' ' + value));
        checkboxContainer.appendChild(label);
        checkboxContainer.appendChild(document.createElement('br'));
    });

    function updateSelectedCount() {
        var checkboxes = checkboxContainer.querySelectorAll('input[type="checkbox"]:checked');
        var countSpan = checkboxContainer.closest('.panel').querySelector('.selected-count');
        countSpan.textContent = checkboxes.length + (checkboxes.length === 1 ? ' selected' : ' selected');
    }

    function filterOptions(input) {
        var filter = input.value.toUpperCase();
        var checkboxes = checkboxContainer.querySelectorAll('label');
        checkboxes.forEach(function(item) {
            var text = item.innerText.toUpperCase();
            if (text.indexOf(filter) > -1) {
                item.style.display = "";
            } else {
                item.style.display = "none";
            }
        });
    }

// </script>
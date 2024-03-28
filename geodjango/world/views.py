from django.shortcuts import render

# Create your views here.


from django.http import JsonResponse
from .models import Villages

def get_villages(request):
    print("hehe")
    # villagess = Villages.objects.all()
    # geojson_data = {
    #     'type': 'FeatureCollection',
    #     'features': []
    # }
    # for village1 in villagess:
    #     feature = {
    #         'type': 'Feature',
    #         'geometry': village1.geom.geojson,
    #         'properties': {
    #             'name': village1.village
    #         }
    #     }
    #     geojson_data['features'].append(feature)
    # return JsonResponse(geojson_data)


from django.shortcuts import render

def get_wms_data(request):
    # GeoServer WMS URL
    wms_url = 'https://geo.geopulsea.com/geoserver/wms'

    # Pass the WMS URL to the template context
    context = {
        'wms_url': wms_url,
    }

    return render(request, 'world/map.html', context)


def index(request):

    return render(request, 'index.html')














import requests
from django.shortcuts import render
def leaflet_map(request):
    # Fetch villages from GeoServer WFS service
    village_url = 'https://pmc.geopulsea.com/geoserver/pmc/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=pmc:Revenue&propertyName=Village_Name&outputFormat=application/json'
    village_response = requests.get(village_url)
    villages = set([feature['properties']['Village_Name'] for feature in village_response.json()['features']])

    # Fetch layer names from GeoServer REST API
    geoserver_url = 'https://pmc.geopulsea.com/geoserver/rest/workspaces/pmc/layers.json'
    response = requests.get(geoserver_url, auth=('admin', 'geoserver'))
    workspace_data = response.json()
    layer_names = [layer['name'] for layer in workspace_data['layers']['layer']]

    if request.method == 'POST':
        selected_village = request.POST.get('village', '')
        selected_gut = request.POST.get('gut', '')
        # Perform filtering on the WMS layer based on the selected village and gut

    context = {
        'villages': villages,
        'layer_names': layer_names
    }
    return render(request, 'world/leaflet_map.html', context)

from django.shortcuts import render

from django.http import JsonResponse
# from .models import Villages
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
# views.py
from django.shortcuts import render
from django.http import JsonResponse
from .models import PolygonData
import json




def save_data(request):
    if request.method == 'POST':
        coordinates = json.loads(request.POST.get('coordinates'))
        village_name = request.POST.get('village_name')
        TPS_Name = request.POST.get('TPS_Name')
        Gut_No = request.POST.get('Gut_No')
        geom = request.POST.get('geom')
        print(coordinates,"coordinates")

        # Save the data to the database
        polygon_data = PolygonData.objects.create(
            coordinates=json.dumps(coordinates),
            village_name=village_name,
            TPS_Name=TPS_Name,
            Gut_No=Gut_No,
            geom=geom
        )
        polygon_data.save()

        return JsonResponse({'message': 'Data saved successfully'}, status=200)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=400)


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

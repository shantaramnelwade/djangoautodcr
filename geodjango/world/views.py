from django.shortcuts import render
from django.http import JsonResponse
from urllib.parse import urlencode
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import requests
from django.shortcuts import render
from django.http import JsonResponse
from .models import PolygonData
import json
import requests
from django.shortcuts import render
from .models import Photo
from django.core.files.base import ContentFile
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.http import JsonResponse
import base64
import io
from django.contrib.gis.geos import Point



from django.http import JsonResponse

base_url = 'https://portal.geopulsea.com/geoserver/AutoDCR/wms?'
def save_data(request):
    # print("hehehehehe")
    if request.method == 'POST':
        Village_name = request.POST.get('Village')
        print(Village_name,"Village_name")  # Print the filters to the console
        filters = ""  
        if Village_name:
            filters = {'village_name': "'{}'".format(Village_name)}
            encoded_filters = urlencode(filters)
            
        cql_filter_url = f'{base_url}service=WFS&version=1.1.0&request=GetFeature&typeName=Revenue_1&propertyName=Gut_No&outputFormat=application/json&CQL_FILTER={encoded_filters}'
        response = requests.get(cql_filter_url)
        gut_noo = []
        if response.status_code == 200:
            data = response.json()
            for feature in data['features']:
                gut_no = feature['properties']['Gut_No']
                gut_noo.append(gut_no)
            # print(len(gut_noo))
        else:
            print("Failed to fetch data:", response.status_code)

        return JsonResponse({'options': gut_noo})
    return JsonResponse({'message': 'Invalid request method.'}, status=400)



def index(request):
    main_url = f'{base_url}service=WFS&version=1.1.0&request=GetFeature&typeName=Revenue_1&propertyName=village_name&outputFormat=application/json'
    response = requests.get(main_url)
    if response.status_code == 200:
        data = response.json()
        features = data['features']
        unique_village_names = set()
        for feature in features:
            village_name = feature['properties']['village_name']
            unique_village_names.add(village_name)
        unique_village_names = list(unique_village_names)
        print(unique_village_names)
        villagedata = {'villagedata': unique_village_names}

    return render(request, 'index.html',villagedata)





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

    context = {
        'villages': villages,
        'layer_names': layer_names
    }
    return render(request, 'world/leaflet_map.html', context)













# this is for geotagging of photos 

def geotagPhoto(request):

    return render(request, 'geotag.html',)

from django.http import JsonResponse
from .models import Photo
from io import BytesIO
from PIL import Image
import base64
from base64 import b64encode

from django.core.files.base import ContentFile
import base64
from .models import Photo
import tempfile
import os
import re

def save_photo(request):
    if request.method == 'POST':
        image_data = request.POST.get('image_data', '')
        longitude = request.POST.get('longitude')
        latitude = request.POST.get('latitude')
        clongitude = request.POST.get('clongitude')
        clatitude = request.POST.get('clatitude')
        print(longitude)
        if image_data:
            try:
                format, imgstr = image_data.split(';base64,')
                ext = format.split('/')[-1]
                data = ContentFile(base64.b64decode(imgstr), name='temp.' + ext)

                with tempfile.NamedTemporaryFile(delete=False) as temp_file:
                    temp_file.write(data.read())
                    temp_file.close()
                    with open(temp_file.name, 'rb') as f:
                        image_data = f.read()
                    clicked_point = Point(float(longitude), float(latitude))
                    cfeature = Point(float(clongitude), float(clatitude))
                    photo = Photo(image_data=image_data,clicked_points = clicked_point,feature=cfeature )
                    photo.save()
                    print("saved")

                print(data)
                return JsonResponse({'message': 'Image saved successfully'})
            except Exception as e:
                return JsonResponse({'error': str(e)}, status=400)
        else:
            return JsonResponse({'error': 'No image data found'}, status=400)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)

from django.contrib.gis.db import models
from django.contrib.gis.geos import GEOSGeometry
from django.contrib.gis.measure import Distance
from django.contrib.gis.geos import Point
import pytz


def get_photo(request):
    if request.method == 'POST':
        data = request.POST.get('idd')
        print(data,"image_data")
        id = re.sub(r'\D','',str(data))
        print(id,"oooooooooo")
        try:
            main_data = gettimephotos(id)
            return JsonResponse(main_data)
        except Photo.DoesNotExist:
            return JsonResponse({'error': 'WorldPhoto not found'}, status=404)
     
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)


from django.db.models.functions import TruncDate, TruncTime
from django.db.models import Min, Max
# from django.db import models

def timeseries_photo(request):
    dates_and_times = Photo.objects.annotate(date=TruncDate('timestamp'), time=TruncTime('timestamp')).values('id','date', 'time')
    min_timestamp = Photo.objects.annotate(date=TruncDate('timestamp')).aggregate(Min('date'))['date__min']
    max_timestamp = Photo.objects.annotate(date=TruncDate('timestamp')).aggregate(Max('date'))['date__max']
    datetimeValues = []
    for item in dates_and_times:
        formatted_date = item['date'].strftime('%B %d, %Y')
        formatted_time = item['time'].strftime('%H:%M')
        datetimeValues.append({'id': item['id'], 'date': formatted_date, 'time': formatted_time})
    if request.method == 'POST':
        id = request.POST.get('id')
        print(id,"oooooooooo")
        main_data = gettimephotos(id)
        return JsonResponse(main_data)
    
    return JsonResponse({'min_timestamp': min_timestamp, 'max_timestamp': max_timestamp,'datetimeValues':datetimeValues})
    


def index1(request):
    photo = Photo.objects.get(pk=22)  # Assuming id=1 for simplicity
    image_data = b64encode(photo.image_data).decode('utf-8')
    return render(request, 'index1.html', {'image_data': image_data})



def gettimephotos(id):
    world_photo = Photo.objects.get(id=id)
    image_data_bytes = bytes(world_photo.image_data)
    clicked_points = world_photo.clicked_points.coords
    date = world_photo.timestamp
    ist = pytz.timezone('Asia/Kolkata')
    dateist = date.astimezone(ist)
    print(dateist,"date and time")
    features = world_photo.feature.coords
    pnt = GEOSGeometry('POINT({} {})'.format(features[1], features[0]), srid=4326)
    pnt2 = GEOSGeometry('POINT({} {})'.format(clicked_points[1], clicked_points[0]), srid=4326)
    distance = pnt.distance(pnt2) * 100000  # Distance in meters
    print("Distance between the two points:", distance)
    x, y = clicked_points
    image_data_base64 = base64.b64encode(image_data_bytes).decode('utf-8')
    main_data = {'image_data': image_data_base64,'X':x,'Y':y,'distance':"{:.2f}".format(distance),'dateist':dateist,'features':features}

    return (main_data)


# retriving maximum and minimum data from database for slider

from django.db.models import Min, Max
from .models import Photo

def my_view(request):
    if request.method == 'GET':
        print("hehe")
    # Retrieve the minimum and maximum timestamp values
        min_timestamp = Photo.objects.aggregate(Min('timestamp'))['timestamp__min']
        max_timestamp = Photo.objects.aggregate(Max('timestamp'))['timestamp__max']
        print(min_timestamp,max_timestamp)
        context = {
            'min_timestamp': min_timestamp,
            'max_timestamp': max_timestamp,
        }

    return render(request, 'your_template.html', context)

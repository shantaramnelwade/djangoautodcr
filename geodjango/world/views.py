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
# from .models import ImageModel



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

    return render(request, 'index.html')





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




def geotagPhoto(request):

    return render(request, 'geotag.html')




# def save_photo(request):
#     print("111111111111")
#     # if request.method == 'POST':
#     #     print("222222222222")
#     #     # Assuming the base64 image is sent in the request body as 'image_data'
#     #     image_data = request.POST.get('photo', '')
#     #     if image_data:
#     #         print("3333333333333")
#     #         # Remove the 'data:image/jpeg;base64,' prefix
#     #         format, imgstr = image_data.split(';base64,')
#     #         ext = format.split('/')[-1]

#     #         # Decode base64 string into binary data
#     #         binary_data = base64.b64decode(imgstr)

#     #         # Create an InMemoryUploadedFile object
#     #         image_file = InMemoryUploadedFile(io.BytesIO(binary_data), None, f'image.{ext}', 'image/jpeg', len(binary_data), None)
#     #         print("5555555555")

#     #         # Save the image to a model
#     #         # For example, assuming you have a model named ImageModel with an ImageField named 'image'
#     #         image_model = Photo(image=image_file)
#     #         image_model.save()

#     #         return JsonResponse({'message': 'Image saved successfully'})
#     #     else:
#     #         return JsonResponse({'error': 'No image data found'}, status=400)
#     # else:
#     #     return JsonResponse({'error': 'Invalid request method'}, status=405)
#     if request.method == 'POST' :
#         image_file = request.FILES.get('photo')
#         image_data = image_file.read()
#         image_model = Photo(image_data=image_data)
#         image_model.save()
#         # image_data1 = request.POST.get('photo', '')
#         # photo_data = request.FILES.get('photo').read()
#         # photo = Photo(image_data=image_data1)
#         # print(photo, "photo")
#         # photo.save()
#         return JsonResponse({'message': 'Photo saved successfully'})
#     return JsonResponse({'error': 'Invalid request'}, status=400)

from django.http import JsonResponse
from .models import Photo
from io import BytesIO
from PIL import Image
import base64
from base64 import b64encode

def save_photo(request):
    if request.method == 'POST':
        image_data = request.POST.get('photo', '')
        if image_data:
            try:
                format, imgstr = image_data.split(';base64,')
                ext = format.split('/')[-1] 
                data = ContentFile(base64.b64decode(imgstr), name='temp.' + ext)
                image_model = Photo(image_data=data)
                image_model.save()
                return JsonResponse({'message': 'Image saved successfully'})
            except Exception as e:
                return JsonResponse({'error': str(e)}, status=400)
        else:
            return JsonResponse({'error': 'No image data found'}, status=400)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)



def index1(request):
    photo = Photo.objects.get(pk=22)  # Assuming id=1 for simplicity
    image_data = b64encode(photo.image_data).decode('utf-8')
    return render(request, 'index1.html', {'image_data': image_data})
from django.urls import path
from .views import index, leaflet_map,save_data, geotagPhoto,save_photo,index1


urlpatterns = [
    path('', index, name='index'),
    path('leaflet_map/', leaflet_map, name='leaflet_map'),
    path('save_data/', save_data, name='save_data'),
    path('geotagPhoto/', geotagPhoto, name='geotagPhoto'),
    path('save_photo/', save_photo, name='save_photo'),
    path('index1/', index1, name='index1'),
    
    # Add other URL patterns as needed

    
]


from django.urls import path
from .views import  geotagPhoto,save_photo,index1,get_photo,timeseries_photo


urlpatterns = [
    # path('', index, name='index'),
    # path('leaflet_map/', leaflet_map, name='leaflet_map'),
    # path('save_data/', save_data, name='save_data'),

    
    path('', geotagPhoto, name='geotagPhoto'),
    path('save_photo/', save_photo, name='save_photo'),
    path('get_photo/', get_photo, name='get_photo'),
    path('timeseries_photo/', timeseries_photo, name='timeseries_photo'),
    
    # path('index1/', index1, name='index1'),
    
    # Add other URL patterns as needed

    
]


from django.urls import path
from .views import get_villages,  get_wms_data , index, leaflet_map


urlpatterns = [
    path('get_wms_data/', get_wms_data, name='get_wms_data'),
    path('get_villages/', get_villages, name='get_villages'),
    path('', index, name='index'),
    path('leaflet_map/', leaflet_map, name='leaflet_map'),
    # Add other URL patterns as needed

    
]


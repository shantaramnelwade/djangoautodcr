from django.urls import path
from .views import index, leaflet_map,save_data


urlpatterns = [
    path('', index, name='index'),
    path('leaflet_map/', leaflet_map, name='leaflet_map'),
    path('save_data/', save_data, name='save_data'),
    # Add other URL patterns as needed

    
]


from pathlib import Path
from django.contrib.gis.utils import LayerMapping
from .models import Villages


village_mapping = {
 'perimeter': 'PERIMETER',
    'ccode': 'CCODE',
    'taluka': 'Taluka',
    'district': 'District',
    'village': 'Village',
    'remark': 'Remark',
    'shape_leng': 'Shape_Leng',
    'shape_area': 'Shape_Area',
    'geom': 'MULTIPOLYGON',

}



village_shp = Path(__file__).resolve().parent / "maps" / "Maharashtra_Village" / "Village_Maharashtra.shp"

def run(verbose=True):
    lm = LayerMapping(Villages, village_shp, village_mapping, transform=False)
    lm.save(strict=True, verbose=verbose)




    # python
    # manage.py
    # ogrinspect.\world\maps\Maharashtra_Village\Village_Maharashtra.shp
    # Villages - -mapping - -multi - -name - field
    # Village - -null
    # true

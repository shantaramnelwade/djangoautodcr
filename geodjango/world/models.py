from django.db import models
from django.contrib.gis.db import models
# Create your models here.



class Villages(models.Model):
    objectid_1 = models.BigIntegerField(null=True)
    objectid = models.BigIntegerField(null=True)
    area = models.FloatField(null=True)
    perimeter = models.FloatField(null=True)
    ccode = models.CharField(max_length=18, null=True)
    taluka = models.CharField(max_length=50, null=True)
    district = models.CharField(max_length=50, null=True)
    village = models.CharField(max_length=50, null=True)
    remark = models.CharField(max_length=50, null=True)
    shape_leng = models.FloatField(null=True)
    shape_area = models.FloatField(null=True)
    geom = models.MultiPolygonField(srid=4326, null=True)

    def __str__(self):
        return self.village


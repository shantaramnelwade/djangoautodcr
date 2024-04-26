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
    


class PolygonData(models.Model):
    coordinates = models.TextField()
    village_name = models.CharField(max_length=255)
    TPS_Name = models.CharField(max_length=255)
    Gut_No = models.CharField(max_length=255)
    geom = models.GeometryField()


from django.db import models
from django.contrib.gis.db import models
from django.utils.html import format_html
import base64

class Photo(models.Model):
    # image = models.ImageField(upload_to='images/')
    image_data = models.BinaryField()
    clicked_points = models.PointField()
    feature = models.PointField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def image_data_base64_display(self):
        if self.image_data:
            self.image_data1 = base64.b64encode(self.image_data).decode('utf-8')
            return format_html('<img src="data:image/png;base64,{}" width="100"/>', self.image_data1)


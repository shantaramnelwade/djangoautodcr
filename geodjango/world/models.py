from django.db import models
from django.contrib.gis.db import models
# Create your models here.


from django.db import models
from django.contrib.gis.db import models
from django.utils.html import format_html
import base64
from django.contrib.gis.geos import Point
from django.utils import timezone

class Photo(models.Model):
    # image = models.ImageField(upload_to='images/')
    image_data = models.BinaryField()
    clicked_points = models.PointField()
    feature = models.PointField(default=Point(0, 0))
    timestamp = models.DateTimeField(default=timezone.now)

    def image_data_base64_display(self):
        if self.image_data:
            self.image_data1 = base64.b64encode(self.image_data).decode('utf-8')
            return format_html('<img src="data:image/png;base64,{}" width="100"/>', self.image_data1)


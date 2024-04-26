from django.contrib import admin

# Register your models here.


from .models import Villages, Photo

@admin.register(Photo)
class PhotoAdmin(admin.ModelAdmin):
    list_display = ('id', 'image_data_base64_display', 'timestamp')
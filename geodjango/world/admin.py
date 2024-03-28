from django.contrib import admin

# Register your models here.


from .models import Villages



# from .models import WorldBorder

# admin.site.register(WorldBorder, admin.ModelAdmin)
admin.site.register(Villages, admin.ModelAdmin)
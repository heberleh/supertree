from django.contrib import admin
from home.models import (                        
                        SupertreeModel, 
                        Post)


# Register your models here.
admin.site.register(SupertreeModel)
admin.site.register(Post)

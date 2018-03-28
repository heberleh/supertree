from django.contrib import admin
from home.models import (
                        Tree, 
                        Supertree, 
                        Post)


# Register your models here.
admin.site.register(Supertree)
admin.site.register(Tree)
admin.site.register(Post)

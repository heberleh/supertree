from django.contrib import admin

from .models import Tree, Supertree, UserProfile

# Register your models here.

admin.site.register(UserProfile)
admin.site.register(Supertree)
admin.site.register(Tree)
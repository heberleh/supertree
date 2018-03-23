from django.contrib import admin

from .models import Tree, Supertree

# Register your models here.

admin.site.register(Supertree)
admin.site.register(Tree)
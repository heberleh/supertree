from django.urls import path

from . import views

app_name = 'app'
urlpatterns = [
    path('', views.index, name='index'),
    path('<int:supertree_id>/visualize/', views.visualize, name='visualize'),
    path('table/', views.table, name='table'),
    path('list/', views.list, name='list'),
]


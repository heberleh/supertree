from django.urls import path
from django.conf.urls import url
from . import views

from django.contrib.auth.views import login, logout


app_name = 'accounts'
urlpatterns = [
    url(r'^$', views.home, name="home"),
    url(r'^login/$', login, {'template_name':'accounts/login.html'}, name="login"),
    url(r'^logout/$', logout, {'template_name':'accounts/logout.html'}, name="logout"),
    url(r'^signin/$', logout, {'template_name':'accounts/signin.html'}, name="signin"),
    url(r'^profile/$', logout, {'template_name':'accounts/profile.html'}, name="profile"),


#     path('', views.IndexView.as_view(template_name='app/index.html'), name='index'),
#     path('<int:pk>/visualize/', views.ListOneView.as_view(template_name='app/detail.html'), name='list_one'),
#     # path('<int:pk>/visualize/', views.VisualizeView.as_view(), name='visualize'),
#     # path('table/', views.TableView.as_view(), name='table'),
#     path('list/', views.list, name='list'),
]

#from django.urls import path
from django.conf.urls import url
from . import views

from django.contrib.auth.views import (
                                login, 
                                logout, 
                                password_reset, 
                                password_reset_done,
                                password_reset_confirm,
                                password_reset_complete
                                )


app_name = 'accounts'
urlpatterns = [
    url(r'^$', views.home, name="home"),
    url(r'^login/$', login, {'template_name':'accounts/login.html'}, name="login"),
    url(r'^logout/$', logout, {'template_name':'accounts/logout.html'}, name="logout"),
    url(r'^register/$', views.register, name="register"),
    url(r'^profile/$', views.profile, name="profile"),
    url(r'^profile/edit/$', views.edit_profile, name="edit_profile"),
    url(r'^change-password/$', views.change_password, name="change_password"),
    url(r'^password-reset/$', password_reset, {'template_name':'accounts/password_reset.html', 'post_reset_redirect': 'accounts/password_reset_done'}, name="password_reset"),    
    url(r'^password-reset/done/$', password_reset_done, name="password_reset_done"),    
    url(r'^password-reset/confirm/(?P<uidb64>[0-9A-Za-z]+)-(?P<token>.+)/$', password_reset_confirm, name="password_reset_confirm"),
    url(r'^password-reset/complete/$', password_reset_complete, name="password_reset_complete"),        

#     path('', views.IndexView.as_view(template_name='app/index.html'), name='index'),
#     path('<int:pk>/visualize/', views.ListOneView.as_view(template_name='app/detail.html'), name='list_one'),
#     # path('<int:pk>/visualize/', views.VisualizeView.as_view(), name='visualize'),
#     # path('table/', views.TableView.as_view(), name='table'),
#     path('list/', views.list, name='list'),
]

from django.conf.urls import url
from home import views
from home.views import (
                        HomeView,
                        UploadTreesView,
                        AppView
                        )
urlpatterns = [
    url(r'^$', HomeView.as_view() ,name = 'home'),
    url(r'^app/$', AppView.as_view() ,name = 'app'),
    url(r'^trees/upload/$', UploadTreesView.as_view(), name = 'upload_trees')
]
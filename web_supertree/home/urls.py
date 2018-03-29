from django.conf.urls import url
from home import views
from home.views import (
                        HomeView,
                        UploadTreesView
                        )
urlpatterns = [
    url(r'^$', HomeView.as_view() ,name = 'home')
    url(r'/trees/upload/$', UploadTreesView.as_view(), name = 'upload_trees')
]
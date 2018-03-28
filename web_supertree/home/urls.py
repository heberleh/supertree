from django.conf.urls import url
from home import views
from home.views import (
                        HomeView
                        )
urlpatterns = [
    url(r'^$', HomeView.as_view() ,name = 'home')
]
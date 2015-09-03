from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^/?$', views.index, name='index'),
    url(r'^/?([0-9]{4})/([0-9]{1,2})/([0-9]{1,2})/?$', views.status_daily, name='status_daily')
]
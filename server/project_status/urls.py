from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^/?$', views.index, name='index'),
	url(r'^status/?$', views.index, name='index'),
    url(r'^status/([0-9]{4})/([0-9]{2})/([0-9]+)/?$', views.status_daily, name='status_daily')
]
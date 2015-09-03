from django.shortcuts import render
from django.http import JsonResponse
from django.conf import settings
from django.core.serializers.json import Serializer as JsonSerializer
from django.core.serializers.python import Serializer as PySerializer
import datetime, json
from .wrangle import IMAPClient, load_status_emails_for_date
from .models import Status, Developer, Project
# Create your views here.

class StatusSerializer(PySerializer):
    def end_object(self, obj):
        self._current['id'] = obj._get_pk_val()
        if isinstance(obj, Status):
            #custom serialize our project and developer fields to something readable
            #   if this were more full fledged I'd just leave them at pks and cross reference
            #   but I'm lazy and this is easier on the React side 
            self._current['project'] = Project.objects.get(pk=self._current['project']).name
            self._current['developer'] = Developer.objects.get(pk=self._current['developer']).full_name

        self.objects.append(self._current)

def json_statuses_for_date(status_date):
    existing = Status.objects.filter(date=status_date)
    statuses = existing if existing else load_status_emails_for_date(status_date)
    serializer = StatusSerializer()
    data = serializer.serialize(statuses)
    return JsonResponse(data, safe=False)

def index(request):
    statuses = load_status_emails_for_date(datetime.datetime.today())
    serializer = StatusSerializer()
    data = serializer.serialize(statuses)
    return JsonResponse(data, safe=False)

def status_daily(request, year, month, day):
    date_to_find = datetime.date(int(year), int(month), int(day))
    found = json_statuses_for_date(date_to_find)
    return found


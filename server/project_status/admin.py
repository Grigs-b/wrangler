from django.contrib import admin

# Register your models here.
from .models import Project, Developer, Status

class ProjectAdmin(admin.ModelAdmin):
	#list_display = ['Developers']
	list_filter = ['name']

class StatusAdmin(admin.ModelAdmin):
    date_hierarchy = 'date'
    list_display = ('developer', 'project', 'status')
	#list_filter = ['developer.name', 'project.name']

class DeveloperAdmin(admin.ModelAdmin):
	pass

admin.site.register(Project, ProjectAdmin)
admin.site.register(Developer, DeveloperAdmin)
admin.site.register(Status, StatusAdmin)
from django.db import models
from django.utils import timezone
# Create your models here.
class Project(models.Model):
    name = models.CharField(max_length=255, unique=True)

    def __repr__(self):
        return "<Project:{}>".format(self.name)

    def __str__(self):
        return "{}".format(self.name)

class Developer(models.Model):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    projects = models.ManyToManyField(Project, related_name="developers")

    @property
    def full_name(self):
        return '{} {}'.format(self.first_name, self.last_name)

    def __repr__(self):
        return "<Developer:{}>".format(self.email)

    def __str__(self):
        return "{}".format(self.full_name, self.email)

class Status(models.Model):
    developer = models.ForeignKey(Developer, related_name="statuses")
    project = models.ForeignKey(Project, related_name="statuses")
    status = models.CharField(max_length=4000, unique_for_date='date')
    date = models.DateField(default=timezone.now)

    def __repr__(self):
        return "<Status Object: {} - {}>".format(self.date, self.developer.email, self.status)

    def __str__(self):
        return "{} - {} said {}".format(self.date, self.developer.full_name, self.status.encode('ascii', 'ignore'))

    def to_dict(self):
        return {"developer": self.developer.full_name, "project": self.project.name, "status": self.status, "date": self.date}

    class Meta:
        verbose_name_plural = 'statuses'
        unique_together = (("developer", "project", "status"))
from django.db import models
from django.contrib.auth.models import User
import ete3 as ete

# Create your models here.

class Post(models.Model):
    post = models.CharField(max_length=500)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)


class SupertreeModel(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    reference_newick = models.CharField(max_length=100000000)
    forest_newicks = models.CharField(max_length=10000000000)
    pub_date = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.reference_newick
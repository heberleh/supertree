from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save

# Create your models here.
class UserProfile(models.Model):    
    user = models.OneToOneField(User,on_delete=models.CASCADE)
    description = models.CharField(max_length=100,default='')
    country = models.CharField(max_length=100,default='')
    state = models.CharField(max_length=100,default='')
    city = models.CharField(max_length=100,default='')
    website = models.URLField(default='')


def create_profile(sender, **kwargs):
    if kwargs['created']:
        user_profile= UserProfile.objects.create(user=kwargs['instance'])

post_save.connect(create_profile, sender=User)


class Supertree(models.Model):
    newick = models.CharField(max_length=100000000)
    pub_date = models.DateTimeField('date published')

    def __str__(self):
        return self.newick

class Tree(models.Model):
    newick = models.CharField(max_length=1000000)
    supertree = models.ForeignKey(Supertree, on_delete=models.CASCADE, blank=True, null=True)
    pub_date = models.DateTimeField('date published')

    def __str__(self):
        return self.newick

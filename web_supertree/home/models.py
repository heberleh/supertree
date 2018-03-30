from django.db import models
from django.contrib.auth.models import User
import ete3 as ete

# Create your models here.

class Post(models.Model):
    post = models.CharField(max_length=500)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)


class Supertree(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    newick = models.CharField(max_length=100000000)
    pub_date = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.newick

class Tree(models.Model):
    newick = models.CharField(max_length=1000000)
    supertree = models.ForeignKey(Supertree, on_delete=models.CASCADE, blank=True, null=True)    

    def __str__(self):
        return self.newick

    # def save(self, *args, **kwargs):
    #    # check if newick 
    #    Tree(self.newick)


    #    super(Tree, self).save(*args, **kwargs)

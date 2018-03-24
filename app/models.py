from django.db import models

# Create your models here.

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


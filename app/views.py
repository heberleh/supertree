from django.shortcuts import get_list_or_404, render, get_object_or_404

from django.http import HttpResponse # remove if not used.
from django.template import loader   # remove if not used.
from .models import Tree

def index(request):
    return HttpResponse("Hello, world. You're at the polls index.")

def visualize(request, supertree_id):
    return HttpResponse("Amazing %s Supertree." % supertree_id)

def table(request):
    trees =  get_list_or_404(Tree.objects.order_by('-pub_date')[:5]) 
    context = {'trees': trees,}
    page = 'app/index.html' 
    return render(request, page, context)

def list(request):    
    tree =  get_object_or_404(Tree,id=request.POST.get("tree_id")) 
    context = {'tree': tree,}
    page = 'app/index.html'
    return render(request, page, context)
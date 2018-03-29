from django.views.generic import TemplateView
from django.shortcuts import render, redirect
from django.urls import reverse
from home.forms import (
                        HomeForm
                        )
from home.models import Post, User, Supertree, Tree

class HomeView(TemplateView):
    template_name = 'home/home.html'
    
    def get(self, request):
        form = HomeForm()
        posts = Post.objects.all().order_by('created')
        users = User.objects.all()
        args = {'form': form, 'posts': posts, 'users': users}
        return render(request, self.template_name, args)

    def post(self, request):
        form = HomeForm(request.POST)
        if form.is_valid():
            post = form.save(commit=False)
            post.user = request.user
            post.save()
            text = form.cleaned_data['post']
            form = HomeForm()
            return redirect(reverse('home:home'))
        args = {'form': form, 'text': text}
        return render(request, self.template_name, args)


class UploadTreesView(TemplateView):
    template_name = 'home/upload_trees.html'

    def get(self, request):
        form = UploadTreesView()
        args = {
            'form': form
        }
        return render(request, self.template_name, args)
    
    def post(self, request):
        form = UploadTreesForm(request.POST, request.FILES)
        
        if form.is_valid():
            forest_file, forest_filename = request.FILES['forest'], str(request.FILES['forest'])
            supertree_file, supertree_filename = request.FILES['supertree'], str(request.FILES['supertree'])

            # IF SUPERTREE IS VALID
            supertree = SuperTree(newick=supertree_file)


            for t in file.read().split(';'):
                if ete.validate(t):
                    tree = Tree(newick=t)
                    tree.save()


from django.shortcuts import redirect, render
from django.urls import reverse
from django.views.generic import TemplateView

from home.forms import HomeForm, UploadTreesForm
from home.models import Post, SupertreeModel, User


class AppView(TemplateView):
    template_name = 'home/app.html'
    
    def get(self, request):        
        return render(request, self.template_name, {})

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
        form = UploadTreesForm()
        args = {
            'form': form
        }
        return render(request, self.template_name, args)
    
    def post(self, request):
        # form = UploadTreesForm(request.POST, request.FILES)
        
        if request.user.is_authenticated:
            forest_file, forest_filename = request.FILES['forest'], str(request.FILES['forest'])
            supertree_file, supertree_filename = request.FILES['supertree'], str(request.FILES['supertree'])
            
            supertree_newick = str(supertree_file.read(),'utf-8').replace('\n','')
            forest_newicks = str(forest_file.read(),'utf-8').replace('\n','')
            supertree = SupertreeModel(
                            reference_newick=supertree_newick,
                            forest_newicks=forest_newicks,
                            user=request.user
                        )        

            supertree.save()
            return redirect('/home/')

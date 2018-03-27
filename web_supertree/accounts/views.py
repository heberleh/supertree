from django.shortcuts import render, redirect
# from django.views import generic

from django.shortcuts import get_list_or_404
# from django.shortcuts import get_object_or_404
# from django.http import HttpResponse # remove if not used.
# from django.template import loader   # remove if not used.

from .models import Tree
# import sys
from django.contrib.auth.forms import (
                            UserCreationForm, 
                            PasswordChangeForm
                            ) 

from accounts.forms import (
                            RegistrationForm, 
                            EditProfileForm
                            )

from django.contrib.auth import update_session_auth_hash

from django.contrib.auth.decorators import login_required


def home(request):
    trees =  get_list_or_404(Tree.objects.order_by('-pub_date')[:5])
    context = {'trees': trees,}
    page = 'accounts/home.html'
    return render(request, page, context)



def register(request):
    if request.method == 'POST':
        form = RegistrationForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('/account')
    
    else: #if GET
        form = RegistrationForm()
        args = {'form': form}
        return render(request, 'accounts/reg_form.html', args)


def profile(request):
    args = {'user': request.user}
    return render(request, 'accounts/profile.html')


@login_required
def edit_profile(request):
    if request.method == 'POST':
        form = EditProfileForm(request.POST, instance=request.user)

        if form.is_valid():
            form.save()
            return redirect('/account/profile')

    else:
        form = EditProfileForm(instance=request.user)
        args = {'form': form}
        return render(request,'accounts/edit_profile.html', args)

@login_required
def change_password(request):
    if request.method == 'POST':
        form = PasswordChangeForm(data=request.POST, user=request.user)

        if form.is_valid():
            form.save()
            update_session_auth_hash(request, form.user)
            return redirect('/account/profile')
        else:
            return redirect('/account/change-password')

    else:
        form = PasswordChangeForm(user=request.user)
        args = {'form': form}
        return render(request,'accounts/change_password.html', args)


# class IndexView(generic.ListView):
#     template_name = 
#     context_object_name = 'trees'

#     def get_queryset(self):
#         """Return the last five published trees."""
#         return Tree.objects.order_by('-pub_date')[:5]


# class ListOneView(generic.DetailView):
#     model = Tree
#     template_name = 'app/detail.html'

# # def table(request):
# #     trees =  get_list_or_404(Tree.objects.order_by('-pub_date')[:5]) 
# #     context = {'trees': trees,}
# #     page = 'app/index.html' 
# #     return render(request, page, context)

# def list(request):
#     try:
#         tree =  get_object_or_404(Tree,id=request.POST.get("tree_id"))
#     except:
#         page = 'app/index.html'
#         context = {'error_message': "The is no tree with id " + request.POST.get("tree_id"),}
#         return render(request, page, context)
#     else:
#         context = {'tree': tree,}
#         page = 'app/detail.html'

#         # selected_choice.votes += 1
#         # selected_choice.save()
#         # Always return an HttpResponseRedirect after successfully dealing
#         # with POST data. This prevents data from being posted twice if a
#         # user hits the Back button.
#         # return HttpResponseRedirect(reverse('polls:results', args=(question.id,)))
#         return render(request, page, context)
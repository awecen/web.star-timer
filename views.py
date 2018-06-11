from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.shortcuts import get_object_or_404, get_list_or_404, render
from django.views import generic
from .models import TimerRecord


@method_decorator(login_required, name='dispatch')
class MainView(generic.ListView):
    model = TimerRecord
    template_name = 'star_timer/main.html'


@method_decorator(login_required, name='dispatch')
class LogsView(generic.ListView):
    model = TimerRecord
    paginate_by = 10
    template_name = 'star_timer/logs.html'


@method_decorator(login_required, name='dispatch')
class NewReleaseView(generic.ListView):
    model = TimerRecord
    template_name = 'star_timer/new_release.html'

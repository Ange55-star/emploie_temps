
from django.urls import path
from . import views

urlpatterns = [
    path('', views.timetable_view, name='home'),
    path('teacher/', views.teacher_space, name='teacher_space'),
    path('admin-arbitrage/', views.admin_arbitration, name='admin_arbitrage'),
]

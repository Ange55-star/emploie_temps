
from django.urls import path
from . import views

urlpatterns = [
    path('', views.timetable_view, name='home'),
    path('teacher/', views.teacher_space, name='teacher_space'),
    path('teacher/submit/', views.submit_vœu_teacher, name='submit_vœu'),
    path('admin-arbitrage/', views.admin_arbitration, name='admin_arbitrage'),
    path('admin-arbitrage/validate/<int:vœu_id>/', views.validate_vœu, name='validate_vœu'),
    path('admin-arbitrage/refuse/<int:vœu_id>/', views.admin_arbitrate_delete, name='refuse_vœu'),
]

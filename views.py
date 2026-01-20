
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import Availability, AuditLog, Teacher, User

@login_required
def toggle_availability_api(request):
    """
    Service Backend pour basculer une disponibilité et logger l'action.
    Sécurité : Vérifie si c'est l'enseignant lui-même ou un Admin.
    """
    if request.method == 'POST':
        teacher_id = request.POST.get('teacher_id')
        day = request.POST.get('day')
        slot = request.POST.get('slot')
        
        target_teacher = get_object_or_404(Teacher, id=teacher_id)
        
        # Règle de sécurité : Un enseignant ne peut modifier que ses vœux. L'Admin peut tout.
        if not request.user.is_staff and request.user.teacher != target_teacher:
            messages.error(request, "Accès refusé.")
            return redirect('home')

        avail, created = Availability.objects.get_or_create(
            teacher=target_teacher, day=day, slot=slot
        )

        action = 'ADD'
        if not created:
            avail.delete()
            action = 'REMOVE'
        
        # CRÉATION DU LOG D'AUDIT
        AuditLog.objects.create(
            changed_by=request.user,
            teacher_affected=target_teacher,
            action=action,
            details=f"{day} {slot}",
            user_role_at_time='ADMIN' if request.user.is_staff else 'TEACHER'
        )

        messages.success(request, f"Modification enregistrée et tracée.")
        return redirect('teacher_space')

@login_required
def audit_log_view(request):
    """
    L'Admin voit tout. L'enseignant voit ses propres logs.
    """
    if request.user.is_staff:
        logs = AuditLog.objects.all()
    else:
        logs = AuditLog.objects.filter(teacher_affected=request.user.teacher)
        
    return render(request, 'core/audit_logs.html', {'logs': logs})

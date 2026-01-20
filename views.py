
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required, user_passes_test
from django.core import serializers
from .models import Desiderata, AuditLog, Teacher, TimetableEntry

def is_admin(user):
    return user.is_staff

@login_required
def submit_vœu_teacher(request):
    if request.method == 'POST':
        teacher = request.user.teacher
        slots_data = request.POST.getlist('slots') # Reçoit une liste de strings "Jour|Plage"
        
        count = 0
        for slot_str in slots_data:
            try:
                day, slot = slot_str.split('|')
                
                # Éviter les doublons pour cet enseignant
                if not Desiderata.objects.filter(teacher=teacher, day=day, slot=slot).exists():
                    Desiderata.objects.create(teacher=teacher, day=day, slot=slot)
                    count += 1
            except ValueError:
                continue
        
        if count > 0:
            # Audit: Création groupée
            AuditLog.objects.create(
                performed_by=request.user,
                role_at_time='TEACHER',
                action='CREATE_MULTIPLE',
                resource_info=f"{count} vœu(x) ajoutés par {teacher}",
                new_value=f"Liste : {slots_data}"
            )
            
    return redirect('teacher_space')

@login_required
@user_passes_test(is_admin)
def validate_vœu(request, vœu_id):
    """Transforme un désidérata en entrée officielle d'emploi du temps."""
    v = get_object_or_404(Desiderata, id=vœu_id)
    
    # 1. Créer l'entrée officielle
    TimetableEntry.objects.create(
        teacher=v.teacher,
        day=v.day,
        slot=v.slot,
        room="Salle ICT 1",
        ue="ICT203"
    )
    
    # 2. Audit
    AuditLog.objects.create(
        performed_by=request.user,
        role_at_time='ADMIN',
        action='VALIDATE',
        resource_info=f"Validation vœu {v.teacher}",
        old_value="Désidérata",
        new_value="Entrée Emploi du temps"
    )
    
    # 3. Supprimer le vœu car il est validé
    v.delete()
    
    return redirect('admin_arbitrage')

@login_required
@user_passes_test(is_admin)
def admin_arbitrate_delete(request, vœu_id):
    v = get_object_or_404(Desiderata, id=vœu_id)
    AuditLog.objects.create(
        performed_by=request.user,
        role_at_time='ADMIN',
        action='REFUSE',
        resource_info=f"Refus vœu {v.teacher}",
        old_value=f"{v.day} {v.slot}",
        new_value="Supprimé"
    )
    v.delete()
    return redirect('admin_arbitrage')

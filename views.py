
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import TimetableEntry, StudentClass, Room, Teacher, ChangeLog, Notification

@login_required
def validate_vœu(request, vœu_id):
    """Valide un vœu et notifie l'enseignant."""
    # Simulation de la logique de validation
    # ... code de validation ici ...
    
    # Création de la notification pour l'enseignant
    Notification.objects.create(
        recipient=teacher_obj,
        message=f"Félicitations, votre demande de cours pour {v.day} a été acceptée."
    )
    
    # Journal d'audit
    ChangeLog.objects.create(
        action=f"Validation vœu Enseignant ID: {vœu_id}",
        modified_by=request.user
    )
    return redirect('admin_arbitrage')

@login_required
def refuse_vœu(request, vœu_id):
    """Refuse un vœu et notifie l'enseignant."""
    # Suppression du vœu
    # ... code suppression ...
    
    # Notification de refus
    Notification.objects.create(
        recipient=teacher_obj,
        message=f"Votre vœu pour {v.day} a été refusé car la salle est déjà occupée."
    )
    return redirect('admin_arbitrage')

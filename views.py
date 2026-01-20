
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from .models import TimetableEntry, UE, Room, Teacher, Desiderata

def timetable_view(request):
    """Vue publique de l'emploi du temps pour les étudiants."""
    entries = TimetableEntry.objects.all()
    context = {
        'entries': entries,
        'days': ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
        'slots': ['08h00 - 11h00', '11h30 - 14h30', '15h00 - 18h00']
    }
    return render(request, 'timetable.html', context)

@login_required
def teacher_space(request):
    """Espace permettant à l'enseignant de soumettre ses vœux."""
    teacher = request.user.teacher
    if request.method == 'POST':
        # Logique simplifiée de traitement des vœux envoyés par formulaire
        selected_slots = request.POST.getlist('slots')
        Desiderata.objects.filter(teacher=teacher).delete()
        for slot_data in selected_slots:
            day, slot = slot_data.split('|')
            Desiderata.objects.create(teacher=teacher, day=day, slot=slot)
        return redirect('teacher_space')
        
    my_entries = TimetableEntry.objects.filter(teacher=teacher)
    my_desiderata = Desiderata.objects.filter(teacher=teacher)
    return render(request, 'teacher.html', {'entries': my_entries, 'desiderata': my_desiderata})

@login_required
def admin_arbitration(request):
    """Vue d'arbitrage pour l'administrateur (staff uniquement)."""
    if not request.user.is_staff:
        return redirect('home')
    
    all_desiderata = Desiderata.objects.all().select_related('teacher')
    ues = UE.objects.all()
    rooms = Room.objects.all()
    
    return render(request, 'admin_arbitrage.html', {
        'desiderata': all_desiderata,
        'ues': ues,
        'rooms': rooms
    })

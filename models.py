
from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError

class Room(models.Model):
    """Salle définie par l'admin avec une capacité fixe"""
    name = models.CharField(max_length=50, unique=True)
    capacity = models.IntegerField()

    def __str__(self):
        return f"{self.name} ({self.capacity} places)"

class ClassGroup(models.Model):
    """Classe paramétrée par l'admin pour un semestre et une année donnés"""
    name = models.CharField(max_length=100)
    student_count = models.IntegerField()
    semester = models.IntegerField(choices=[(1, 'Semestre 1'), (2, 'Semestre 2')])
    academic_year = models.CharField(max_length=20, placeholder="Ex: 2024-2025")

    def __str__(self):
        return f"{self.name} (S{self.semester}) - {self.academic_year}"

class Teacher(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    specialty = models.CharField(max_length=100)
    
    def __str__(self):
        return f"Dr. {self.user.last_name}"

class CourseProposal(models.Model):
    """Séance proposée par l'enseignant, soumise à validation de capacité"""
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.PROTECT)
    class_group = models.ForeignKey(ClassGroup, on_delete=models.PROTECT)
    ue_code = models.CharField(max_length=20)
    day = models.CharField(max_length=20)
    slot = models.CharField(max_length=50)
    status = models.CharField(max_length=20, default='PENDING')

    def clean(self):
        # Validation impérative côté serveur
        if self.room.capacity < self.class_group.student_count:
            raise ValidationError(
                f"Capacité insuffisante : La salle {self.room.name} ({self.room.capacity}) "
                f"ne peut pas accueillir la classe {self.class_group.name} ({self.class_group.student_count})"
            )

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

class AuditLog(models.Model):
    """Système de traçabilité immuable des actions Admin et Enseignant"""
    user_action = models.CharField(max_length=100)
    timestamp = models.DateTimeField(auto_now_add=True)
    details = models.TextField()
    performed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    
    class Meta:
        ordering = ['-timestamp']

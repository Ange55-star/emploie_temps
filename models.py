
from django.db import models
from django.contrib.auth.models import User

class StudentClass(models.Model):
    name = models.CharField(max_length=50) # ex: ICT-L2
    headcount = models.IntegerField() # ex: 120
    
    def __str__(self):
        return f"{self.name} ({self.headcount} étudiants)"

class Teacher(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    specialty = models.CharField(max_length=100)
    
    def __str__(self):
        return f"Dr. {self.user.last_name}"

class Room(models.Model):
    name = models.CharField(max_length=50) # ex: Amphi 200
    capacity = models.IntegerField() # ex: 200

    def __str__(self):
        return f"{self.name} (Capacité: {self.capacity})"

class TimetableEntry(models.Model):
    student_class = models.ForeignKey(StudentClass, on_delete=models.CASCADE)
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    day = models.CharField(max_length=20)
    slot = models.CharField(max_length=50)

class Notification(models.Model):
    """Système de message pour les enseignants."""
    recipient = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

class ChangeLog(models.Model):
    """Historique des modifications administrateur."""
    entry = models.ForeignKey(TimetableEntry, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=200)
    modified_by = models.ForeignKey(User, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)


from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Teacher(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    specialty = models.CharField(max_length=100)
    
    def __str__(self):
        return f"Dr. {self.user.last_name}"

class Desiderata(models.Model):
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name="preferences")
    day = models.CharField(max_length=20)
    slot = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('teacher', 'day', 'slot')

class AuditLog(models.Model):
    """Système de traçabilité complet pour l'arbitrage."""
    timestamp = models.DateTimeField(auto_now_add=True)
    performed_by = models.ForeignKey(User, on_delete=models.CASCADE)
    role_at_time = models.CharField(max_length=20) # 'ADMIN' or 'TEACHER'
    action = models.CharField(max_length=50) # 'CREATE', 'UPDATE', 'DELETE'
    resource_info = models.CharField(max_length=200) # ex: "Desiderata Dr. Ebanda"
    old_value = models.TextField(null=True, blank=True)
    new_value = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.action} by {self.performed_by} at {self.timestamp}"

class TimetableEntry(models.Model):
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    day = models.CharField(max_length=20)
    slot = models.CharField(max_length=50)
    room = models.CharField(max_length=100)
    ue = models.CharField(max_length=50)

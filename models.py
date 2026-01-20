
from django.db import models
from django.contrib.auth.models import User

class Teacher(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone = models.CharField(max_length=20, blank=True)
    
    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name}"

class UE(models.Model):
    code = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=200)
    credits = models.IntegerField(default=4)

    def __str__(self):
        return f"{self.code} - {self.name}"

class Room(models.Model):
    name = models.CharField(max_length=50)
    capacity = models.IntegerField()

    def __str__(self):
        return self.name

class Desiderata(models.Model):
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    day = models.CharField(max_length=20)
    slot = models.CharField(max_length=50)
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('teacher', 'day', 'slot')

class TimetableEntry(models.Model):
    DAYS = [('LUN', 'Lundi'), ('MAR', 'Mardi'), ('MER', 'Mercredi'), ('JEU', 'Jeudi'), ('VEN', 'Vendredi'), ('SAM', 'Samedi')]
    SLOTS = [('S1', '08h00 - 11h00'), ('S2', '11h30 - 14h30'), ('S3', '15h00 - 18h00')]
    
    ue = models.ForeignKey(UE, on_delete=models.CASCADE)
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    day = models.CharField(max_length=3, choices=DAYS)
    slot = models.CharField(max_length=2, choices=SLOTS)
    group = models.CharField(max_length=10, default="G1")

    class Meta:
        unique_together = ('day', 'slot', 'room') # Empêche deux cours dans la même salle au même moment

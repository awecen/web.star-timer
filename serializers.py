from rest_framework import serializers
from .models import SwitchLog, TimerRecord
from django.contrib.auth.models import User


class SwitchLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = SwitchLog
        fields = '__all__'


class TimerRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimerRecord
        fields = '__all__'

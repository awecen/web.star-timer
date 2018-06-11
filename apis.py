from .models import SwitchLog, TimerRecord
from .serializers import SwitchLogSerializer, TimerRecordSerializer
from rest_framework import generics
from rest_framework import permissions
from datetime import datetime, timedelta, timezone, tzinfo


class TimerRecordList(generics.ListCreateAPIView):
    """
    List all TimerRecord
    """
    queryset = TimerRecord.objects.all().order_by('-start_time')
    serializer_class = TimerRecordSerializer
    permission_classes = (permissions.IsAuthenticated, )


class TimerRecordLatest(generics.ListAPIView):
    """
    Retrieve most recently TimerRecord
    """
    queryset = TimerRecord.objects.all().order_by('-start_time')[:1]
    serializer_class = TimerRecordSerializer
    permission_classes = (permissions.IsAuthenticated,)


class TimerRecordToday(generics.ListAPIView):
    """
    Retrieve most recently TimerRecord
    """
    today = datetime.now(timezone(timedelta(hours=+9), 'JST')).strftime('%Y-%m-%d')
    queryset = TimerRecord.objects.all().filter(end_time__gte=today+' 00:00:00').order_by('-id')
    serializer_class = TimerRecordSerializer
    permission_classes = (permissions.IsAuthenticated,)


class TimerRecordDetail(generics.RetrieveUpdateAPIView):
    """
    Update 1 record
    """
    queryset = TimerRecord.objects.all()
    serializer_class = TimerRecordSerializer
    permission_classes = (permissions.IsAuthenticated,)


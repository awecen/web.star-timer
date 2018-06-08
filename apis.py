from .models import SwitchLog, TimerRecord
from .serializers import SwitchLogSerializer, TimerRecordSerializer
from rest_framework import generics
from rest_framework import permissions
from datetime import datetime, timedelta, timezone, tzinfo


class SwitchLogList(generics.ListCreateAPIView):
    """
    List all Switch Log
    """
    queryset = SwitchLog.objects.all().order_by('-id')
    serializer_class = SwitchLogSerializer
    permission_classes = (permissions.IsAuthenticated, )


class SwitchLogDetail(generics.ListAPIView):
    """
    Retrieve most recently Switch Log
    """
    queryset = SwitchLog.objects.all().order_by('-id')[:1]
    serializer_class = SwitchLogSerializer
    permission_classes = (permissions.IsAuthenticated,)


class SwitchLogToday(generics.ListAPIView):
    """
    Retrieve most recently Switch Log
    """
    JST = timezone(timedelta(hours=+9), 'JST')
    today = datetime.now(JST).strftime('%Y-%m-%d')
    queryset = SwitchLog.objects.all().filter(switch_time__gte=today+' 00:00:00').order_by('-id')
    serializer_class = SwitchLogSerializer
    permission_classes = (permissions.IsAuthenticated,)


class TimerRecordList(generics.ListCreateAPIView):
    """
    List all TimerRecord
    """
    queryset = TimerRecord.objects.all().order_by('-id')
    serializer_class = TimerRecordSerializer
    permission_classes = (permissions.IsAuthenticated, )


class TimerRecordLatest(generics.ListAPIView):
    """
    Retrieve most recently TimerRecord
    """
    queryset = TimerRecord.objects.all().order_by('-id')[:1]
    serializer_class = TimerRecordSerializer
    permission_classes = (permissions.IsAuthenticated,)


class JST(tzinfo):
    def utcoffset(self, dt):
        return timedelta(hours=9)

    def dst(self, dt):
        return timedelta(0)

    def tzname(self, dt):
        return 'JST'


class TimerRecordToday(generics.ListAPIView):
    """
    Retrieve most recently TimerRecord
    """
    today = datetime.now(tz=JST()).strftime('%Y-%m-%d')
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


from django.db import models
from datetime import datetime


# ログ
class SwitchLog(models.Model):
    switch_time = models.DateTimeField('時間', default=datetime.now)
    is_worn = models.BooleanField('装着フラグ', default=False)
    note = models.TextField('メモ')


# タイムスパン版
class TimerRecord(models.Model):
    start_time = models.DateTimeField('開始時間', default=datetime.now)
    end_time = models.DateTimeField('終了時間', null=True, blank=True)
    is_worn = models.BooleanField('装着フラグ', default=False, null=False)
    note = models.TextField('メモ', null=True, blank=True)

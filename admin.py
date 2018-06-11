from django.contrib import admin
from .models import SwitchLog, TimerRecord


# ログ
class SwtichLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'switch_time', 'is_worn', 'note')
    list_display_links = ('id', 'switch_time')


admin.site.register(SwitchLog, SwtichLogAdmin)


# タイムスパン版
class TimerRecordAdmin(admin.ModelAdmin):
    list_display = ('id', 'start_time', 'end_time', 'is_worn', 'note')
    list_display_links = ('id', )
    ordering = ('-start_time', )


admin.site.register(TimerRecord, TimerRecordAdmin)

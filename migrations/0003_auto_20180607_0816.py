# Generated by Django 2.0.3 on 2018-06-06 23:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('star_timer', '0002_timerrecord'),
    ]

    operations = [
        migrations.AlterField(
            model_name='timerrecord',
            name='note',
            field=models.TextField(blank=True, verbose_name='メモ'),
        ),
    ]

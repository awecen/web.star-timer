# Generated by Django 2.0.3 on 2018-06-01 12:58

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='SwitchLog',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('switch_time', models.DateTimeField(default=datetime.datetime.now, verbose_name='時間')),
                ('is_worn', models.BooleanField(default=False, verbose_name='装着フラグ')),
                ('note', models.TextField(verbose_name='メモ')),
            ],
        ),
    ]
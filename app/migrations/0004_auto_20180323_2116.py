# Generated by Django 2.0.3 on 2018-03-23 21:16

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0003_auto_20180323_2111'),
    ]

    operations = [
        migrations.AlterField(
            model_name='tree',
            name='supertree',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='app.Supertree'),
        ),
    ]

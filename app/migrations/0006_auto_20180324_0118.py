# Generated by Django 2.0.3 on 2018-03-24 01:18

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0005_auto_20180323_2118'),
    ]

    operations = [
        migrations.RenameField(
            model_name='supertree',
            old_name='supertree',
            new_name='newick',
        ),
        migrations.RenameField(
            model_name='tree',
            old_name='tree',
            new_name='newick',
        ),
    ]

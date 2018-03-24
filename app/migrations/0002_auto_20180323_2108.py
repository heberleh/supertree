# Generated by Django 2.0.3 on 2018-03-23 21:08

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Supertree',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('supertree', models.CharField(max_length=100000000)),
                ('pub_date', models.DateTimeField(verbose_name='date published')),
            ],
        ),
        migrations.CreateModel(
            name='Trees',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('tree', models.CharField(max_length=1000000)),
                ('pub_date', models.DateTimeField(verbose_name='date published')),
                ('supertree', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='app.Supertree')),
            ],
        ),
        migrations.DeleteModel(
            name='ReferenceTree',
        ),
        migrations.DeleteModel(
            name='SmallTrees',
        ),
    ]
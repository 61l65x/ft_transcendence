# Generated by Django 5.1.3 on 2024-12-04 13:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='profile_picture',
            field=models.ImageField(blank=True, default='avatars/default.png', null=True, upload_to='avatars/'),
        ),
    ]
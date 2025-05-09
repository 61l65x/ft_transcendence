# Generated by Django 5.1.3 on 2025-03-20 21:22

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("tournaments", "0003_tournament_winner"),
    ]

    operations = [
        migrations.AlterField(
            model_name="tournament",
            name="status",
            field=models.CharField(
                choices=[
                    ("PENDING", "Pending"),
                    ("ACTIVE", "Active"),
                    ("COMPLETED", "Completed"),
                ],
                default="PENDING",
                max_length=10,
            ),
        ),
    ]

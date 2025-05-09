from django.urls import path
from . import views

app_name = "games"

urlpatterns = [
    # Create a local 1v1 game againt guest player (POST)
    path("local/guest/", views.create_local_game_guest, name="create_local_game_guest"),
    # Create a local 1v1 game against another logged-in user (POST)
    path("local/", views.create_local_game, name="create_local_game"),
    # Create a 1v1 game against AI (POST)
    path("ai/", views.create_ai_game, name="create_ai_game"),
    # Save the stats for a completed game (PATCH)
    path("<int:game_id>/stats/", views.save_game_stats, name="save_game_stats"),
]

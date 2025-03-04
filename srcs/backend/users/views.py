import json
from django.http import JsonResponse
from django.views.decorators.http import require_POST, require_GET, require_http_methods
from django.contrib.auth import authenticate, login, logout
from django.conf import settings
from django.db.models import Window, F, Q
from django.db.models.functions import Rank
import os
import shutil
from functools import wraps
from users.forms import (
    CustomUserCreationForm,
    AvatarUpdateForm,
    ProfileUpdateForm,
    PasswordUpdateForm,
)
from users.models import CustomUser
from games.models import Game


def login_required_json(view_func):
    """
    Custom decorator that ensures the user is authenticated.
    Returns a 401 JSON response instead of redirecting.
    """

    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({"errors": "User is not authenticated."}, status=401)
        return view_func(request, *args, **kwargs)

    return wrapper


@require_POST
def register_user(request):
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"errors": "Invalid JSON input."}, status=400)

    form = CustomUserCreationForm(data)
    if form.is_valid():
        try:
            form.save()
            user_id = form.instance.id
            username = form.cleaned_data.get("username")
            return JsonResponse(
                {"id": user_id, "username": username, "message": "User created."},
                status=201,
            )
        except Exception as e:
            return JsonResponse({"errors": str(e)}, status=500)
    else:
        return JsonResponse({"errors": form.errors}, status=400)


@require_POST
def login_user(request):
    if request.user.is_authenticated:
        return JsonResponse({"errors": "User is already logged in."}, status=400)

    try:
        body = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"errors": "Invalid JSON input."}, status=400)

    username = body.get("username")
    password = body.get("password")

    if not username or not password:
        return JsonResponse(
            {"errors": "Username and password are required."}, status=400
        )

    try:
        user = CustomUser.objects.get(username=username)
    except CustomUser.DoesNotExist:
        return JsonResponse({"errors": "Username does not exist."}, status=401)

    user = authenticate(request, username=username, password=password)

    if user is not None:
        login(request, user)
        return JsonResponse(
            {"id": user.id, "username": user.username, "message": "Login successful."},
            status=200,
        )
    else:
        return JsonResponse({"errors": "Invalid password."}, status=401)


@login_required_json
@require_POST
def logout_user(request):
    user_id = request.user.id
    username = request.user.username
    logout(request)
    return JsonResponse(
        {"id": user_id, "username": username, "message": "Logout successful."},
        status=200,
    )


@login_required_json
@require_GET
def get_profile(request):
    user = request.user

    return JsonResponse(
        {
            "id": user.id,
            "username": user.username,
            "avatar": user.get_avatar(),
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "total_wins": user.total_wins,
            "total_losses": user.total_losses,
            # friends
        },
        status=200,
    )


@login_required_json
@require_http_methods(["PATCH"])
def update_profile(request):
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"errors": "Invalid JSON input."}, status=400)

    user = request.user
    form = ProfileUpdateForm(data, instance=user)

    if form.is_valid():
        form.save()
        login(request, user, backend="django.contrib.auth.backends.ModelBackend")

        return JsonResponse(
            {
                "id": user.id,
                "username": user.username,
                "message": "User profile updated.",
            },
            status=200,
        )
    else:
        return JsonResponse({"errors": form.errors}, status=400)


@login_required_json
@require_http_methods(["PATCH"])
def deactivate_user_account(request):
    user_id = request.user.id
    username = request.user.username
    logout(request)
    CustomUser.objects.filter(pk=user_id).update(is_active=False)  # Soft delete

    return JsonResponse(
        {"id": user_id, "username": username, "message": "Account deactivated."},
        status=200,
    )


@login_required_json
@require_http_methods(["DELETE"])
def delete_user_account(request):
    user = request.user
    user_id = user.id
    username = user.username

    # If user has avatar in media directory, delete user's avatar and its related directory
    if user.avatar and user.avatar.name != user.default_avatar:
        user_folder = os.path.join(settings.MEDIA_ROOT, "avatars", str(user_id))
        if os.path.exists(user_folder):
            shutil.rmtree(user_folder)

    logout(request)
    user.delete()  # Hard delete, remove the user instance and all related data from database

    return JsonResponse(
        {"id": user_id, "username": username, "message": "Account deleted."}, status=200
    )


@login_required_json
@require_http_methods(["GET", "PATCH", "DELETE"])
def user_profile(request, user_id):
    if request.user.id != user_id:
        return JsonResponse(
            {"errors": "You do not have permission to access this user's profile."},
            status=403,
        )

    if request.method == "GET":
        return get_profile(request)

    elif request.method == "PATCH":
        try:
            body = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"errors", "Invalid JSON input."}, status=400)

        if body.get("deactivate") is True:
            return deactivate_user_account(request)

        return update_profile(request)

    elif request.method == "DELETE":
        return delete_user_account(request)


@login_required_json
@require_POST
def update_password(request, user_id):
    if request.user.id != user_id:
        return JsonResponse(
            {"errors": "You do not have permission to update password of this user."},
            status=403,
        )

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"errors": "Invalid JSON input."}, status=400)

    user = request.user
    form = PasswordUpdateForm(user, data)
    if form.is_valid():
        form.save()
        login(request, user, backend="django.contrib.auth.backends.ModelBackend")
        return JsonResponse(
            {
                "id": user.id,
                "username": user.username,
                "message": "User password updated.",
            },
            status=200,
        )
    else:
        return JsonResponse({"errors": form.errors}, status=400)


@login_required_json
@require_POST
def update_avatar(request):
    if "avatar" not in request.FILES:
        return JsonResponse({"errors": "No file uploaded."}, status=400)

    old_file_path = request.user.avatar.name  # Store old file path for cleanup
    form = AvatarUpdateForm(request.POST, request.FILES, instance=request.user)

    if form.is_valid():
        request.user.update_avatar(form.cleaned_data.get("avatar"), old_file_path)
        return JsonResponse(
            {
                "id": request.user.id,
                "username": request.user.username,
                "message": "Avatar updated.",
                "avatar_url": request.user.get_avatar(),
            },
            status=200,
        )

    return JsonResponse({"errors": form.errors}, status=400)


@login_required_json
@require_GET
def participated_tournaments(request, user_id):
    user = request.user
    if user.id != user_id:
        return JsonResponse(
            {
                "errors": "You do not have permission to view participated tournaments of this user."
            },
            status=403,
        )

    participated_tournaments = user.participated_tournaments.all()

    tournament_data = [
        {
            "id": tournament.id,
            "name": tournament.name,
            "status": tournament.status,
            "started_at": tournament.started_at,
            "players": tournament.get_players,
        }
        for tournament in participated_tournaments
    ]

    return JsonResponse(
        {
            "participated_tournaments": tournament_data,
        },
        status=200,
    )


@login_required_json
@require_GET
def match_history(request, user_id):
    user = request.user
    if user.id != user_id:
        return JsonResponse(
            {
                "errors": "You do not have permission to view match history of this user."
            },
            status=403,
        )

    games = Game.objects.filter(Q(player1=user) | Q(player2=user)).order_by(
        "-date_played"
    )

    game_data = [
        {
            "game_id": game.id,
            "date_played": game.date_played,
            "player1:": game.player1.username if game.player1 else "AI",
            "player2": game.player2.username if game.player2 else "AI",
            "winner": game.winner.username if game.winner else "AI",
            "player1_score": game.player1_score,
            "player2_score": game.player2_score,
        }
        for game in games
    ]

    return JsonResponse({"match_history": game_data})


@require_GET
def leaderboard(request):
    users = CustomUser.objects.annotate(
        rank=Window(expression=Rank(), order_by=F("score").desc())
    ).order_by("-score", "id")

    data = list(users.values("id", "username", "avatar", "score", "rank"))

    return JsonResponse(data, safe=False)

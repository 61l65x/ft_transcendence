from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from django.core.exceptions import ValidationError
from users.models import CustomUser
from backend.utils import get_deleted_user


class Tournament(models.Model):
    MAX_PLAYERS = 100

    class TournamentStatus(models.TextChoices):
        PENDING = "PENDING", _("Pending")
        ACTIVE = "ACTIVE", _("Active")
        COMPLETED = "COMPLETED", _("Completed")

    name = models.CharField(max_length=50, blank=True)  # Name of the tournament
    creator = models.ForeignKey(
        CustomUser,
        on_delete=models.SET(get_deleted_user),
        related_name="created_tournaments",
    )
    players = models.ManyToManyField(
        CustomUser, through="TournamentPlayer", related_name="participated_tournaments"
    )
    started_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(
        max_length=10,
        choices=TournamentStatus.choices,
        default=TournamentStatus.PENDING,
    )
    winner = models.ForeignKey(
        CustomUser, on_delete=models.SET(get_deleted_user), null=True, blank=True
    )

    @property
    def get_players(self):
        return [player.username for player in self.players.all()]

    def check_status(self):
        if self.status == Tournament.TournamentStatus.ACTIVE:
            raise ValidationError("Tournament has already started.")
        if self.status == Tournament.TournamentStatus.COMPLETED:
            raise ValidationError("Tournament has already completed.")

    def add_player(self, user):
        self.check_status()
        if self.players.count() >= Tournament.MAX_PLAYERS:
            raise ValidationError("Tournament is full")
        if user.username != "guest_player" and self.players.filter(id=user.id).exists():
            raise ValidationError("You are already in this tournament.")
        TournamentPlayer.objects.create(tournament=self, player=user)

    def start(self, user):
        self.check_status()
        if self.players.count() < 3:
            raise ValidationError("Cannot start tournament with less than 3 players.")
        if not (user == self.creator or user in self.players.all()):
            raise ValidationError("Only tournament players can start the tournament.")
        self.status = Tournament.TournamentStatus.ACTIVE
        self.started_at = timezone.now()  # UTC time
        self.save()

    def save_stats(self, user, winner):
        if not (user == self.creator or user in self.players.all()):
            raise ValidationError("Only tournament players can save stats.")
        if self.status != Tournament.TournamentStatus.ACTIVE:
            raise ValidationError("Tournament is not active.")
        if winner not in self.players.all():
            raise ValidationError("Winner must be a player in the tournament.")
        self.winner = winner
        self.status = Tournament.TournamentStatus.COMPLETED
        self.save()

    def __str__(self):
        players = ", ".join([f"{player.username}" for player in self.players.all()])
        return (
            f"Tournament(name={self.name}, "
            f"creator={self.creator.username}, "
            f"status: {self.status}, started_at={self.started_at}, "
            f"players: {players}"
        )


class TournamentPlayer(models.Model):
    tournament = models.ForeignKey("Tournament", on_delete=models.CASCADE)
    player = models.ForeignKey(CustomUser, on_delete=models.SET(get_deleted_user))

    def __str__(self):
        return f"{self.player.username} in {self.tournament.name}"

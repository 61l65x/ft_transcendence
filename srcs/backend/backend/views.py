from django.http import JsonResponse


def homepage(request):
    return JsonResponse({"message": "hello from backend."})


def lockout(request, credentials, *args, **kwargs):
    return JsonResponse(
        {"error": "Locked out due to too many login failures."}, status=403
    )


def custom_404(request, exception):
    return JsonResponse({"error": "Page not found."}, status=404)


def custom_500(request):
    return JsonResponse({"error": "Internal server error."}, status=500)

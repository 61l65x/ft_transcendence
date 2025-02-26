# livechat/middleware.py
from django.utils.deprecation import MiddlewareMixin

class WebSocketMiddleware(MiddlewareMixin):
    """Middleware that bypasses HTTP middleware for WebSocket connections."""
    def process_request(self, request):
        if request.headers.get('Upgrade') == 'websocket':
            # Return None, indicating that this request doesn't need to go through the HTTP middleware chain.
            return None
        return super().process_request(request)

import logging
import time
import uuid

logger = logging.getLogger("meditrack.middleware")


class RequestIDMiddleware:
    """
    Middleware that ensures every request has a unique X-Request-ID header,
    making distributed tracing and audit logging straightforward.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        request.id = request_id

        response = self.get_response(request)
        response["X-Request-ID"] = request_id
        return response


class AuditLoggingMiddleware:
    """
    Middleware that logs inbound HTTP requests with duration and user context.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start_time = time.time()
        response = self.get_response(request)
        duration_ms = (time.time() - start_time) * 1000

        user_info = (
            f"user_id={request.user.id}"
            if getattr(request, "user", None) and request.user.is_authenticated
            else "anon"
        )
        req_id = getattr(request, "id", "no-id")

        logger.info(
            f"[{req_id}] {request.method} {request.path} {response.status_code} "
            f"({duration_ms:.1f}ms) | {user_info}"
        )
        return response

import logging
from rest_framework import status
from rest_framework.exceptions import APIException
from rest_framework.response import Response
from rest_framework.views import exception_handler

logger = logging.getLogger("meditrack.exceptions")


def custom_exception_handler(exc, context):
    """
    Standardized DRF Exception Handler.
    Formats all error responses into:
    {
        "success": false,
        "error": {
            "code": "ERROR_CODE",
            "message": "Human readable summary",
            "details": { ... }
        }
    }
    """
    response = exception_handler(exc, context)

    if response is None:
        logger.exception("Unhandled Exception encountered: %s", str(exc), exc_info=context.get("request"))
        return Response(
            {
                "success": False,
                "error": {
                    "code": "INTERNAL_SERVER_ERROR",
                    "message": "An unexpected server error occurred. Please contact system support.",
                    "details": {"non_field_errors": [str(exc)]},
                },
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    # Determine structured error code
    status_code = response.status_code
    code_mapping = {
        status.HTTP_400_BAD_REQUEST: "VALIDATION_ERROR",
        status.HTTP_401_UNAUTHORIZED: "AUTHENTICATION_FAILED",
        status.HTTP_403_FORBIDDEN: "PERMISSION_DENIED",
        status.HTTP_404_NOT_FOUND: "NOT_FOUND",
        status.HTTP_405_METHOD_NOT_ALLOWED: "METHOD_NOT_ALLOWED",
        status.HTTP_429_TOO_MANY_REQUESTS: "THROTTLED",
    }
    error_code = code_mapping.get(status_code, "API_ERROR")

    # If exception itself defined a custom code
    if hasattr(exc, "default_code") and isinstance(exc.default_code, str):
        if exc.default_code in ["duplicate", "unique"]:
            error_code = "DUPLICATE_ENTRY"

    details = response.data
    message = "Request failed."

    # Parse details & message
    if isinstance(details, dict):
        if "detail" in details:
            message = str(details["detail"])
            # Remove detail if it's the only key
            details = {k: v for k, v in details.items() if k != "detail"}
            if not details:
                details = {}
        elif "non_field_errors" in details:
            first_err = details["non_field_errors"]
            message = str(first_err[0]) if isinstance(first_err, (list, tuple)) and first_err else str(first_err)
        else:
            first_field = next(iter(details))
            val = details[first_field]
            first_err = val[0] if isinstance(val, (list, tuple)) and val else str(val)
            message = f"{first_field}: {first_err}"
    elif isinstance(details, list):
        message = str(details[0]) if details else "Validation error occurred."
        details = {"non_field_errors": details}
    elif isinstance(details, str):
        message = details
        details = {}

    response.data = {
        "success": False,
        "error": {
            "code": error_code,
            "message": message,
            "details": details,
        },
    }

    return response

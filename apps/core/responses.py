from rest_framework import status
from rest_framework.response import Response


def api_success(data=None, message="Operation successful", status_code=status.HTTP_200_OK):
    """
    Standard envelope helper for API success responses.
    """
    payload = {
        "success": True,
        "message": message,
        "data": data if data is not None else {},
    }
    return Response(payload, status=status_code)

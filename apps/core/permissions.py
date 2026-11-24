from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Object-level permission to allow read access to any authenticated user,
    but only allow the creator (created_by) of an object to edit or delete it.
    """

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any authenticated request
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner of the object
        return getattr(obj, "created_by", None) == request.user


class IsOwner(permissions.BasePermission):
    """
    Object-level permission to only allow owners of an object to access it.
    """

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        return getattr(obj, "created_by", None) == request.user

from django.contrib.auth.models import User, Group, Permission
from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework_simplejwt.views import TokenObtainPairView
from .permissions import IsSuperUser
from .pagination import AllResultsPagination
from .serializers import (
    CustomTokenObtainPairSerializer,
    UserSerializer,
    UserCreateSerializer,
    GroupSerializer,
    PermissionSerializer,
)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class UserViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsSuperUser]
    queryset = User.objects.all().order_by('-date_joined')
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering_fields = ['username', 'email', 'date_joined', 'is_active']

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return UserCreateSerializer
        return UserSerializer

    def perform_destroy(self, instance):
        if instance == self.request.user:
            raise PermissionDenied('You cannot delete your own user account.')
        instance.delete()


class GroupViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsSuperUser]
    serializer_class = GroupSerializer
    queryset = Group.objects.all()
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name']


class PermissionViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated, IsSuperUser]
    serializer_class = PermissionSerializer
    queryset = Permission.objects.all().select_related('content_type')
    pagination_class = AllResultsPagination
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name', 'codename']
    ordering_fields = ['name', 'codename']


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        groups = user.groups.values('id', 'name')
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
            'is_active': user.is_active,
            'date_joined': user.date_joined,
            'groups': list(groups),
        })

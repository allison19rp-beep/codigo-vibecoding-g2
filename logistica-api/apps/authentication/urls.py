from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView,
    UserViewSet,
    GroupViewSet,
    PermissionViewSet,
    CurrentUserView,
)

router = DefaultRouter()
router.register(r'auth/users', UserViewSet, basename='user')
router.register(r'auth/groups', GroupViewSet, basename='group')
router.register(r'auth/permissions', PermissionViewSet, basename='permission')

urlpatterns = [
    path('auth/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', CurrentUserView.as_view(), name='current_user'),
]

urlpatterns += router.urls

from django.urls import path
from rest_framework.routers import SimpleRouter

from .addresses import AddressViewSet

from .views import (
    LoginView,
    RegisterView,
    VerifyEmailOTPView,
    ResendEmailOTPView,
    LogoutView,
    CurrentUserView,
    ChangePasswordView,
    RequestPasswordResetView,
    ConfirmPasswordResetView,
)

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='auth-register'),
    path('auth/verify-email/', VerifyEmailOTPView.as_view(), name='auth-verify-email'),
    path('auth/resend-otp/', ResendEmailOTPView.as_view(), name='auth-resend-otp'),
    path('auth/login/', LoginView.as_view(), name='auth-login'),
    path('auth/logout/', LogoutView.as_view(), name='auth-logout'),
    path('auth/me/', CurrentUserView.as_view(), name='auth-me'),
    path('auth/change-password/', ChangePasswordView.as_view(), name='auth-change-password'),
    path('auth/forgot-password/', RequestPasswordResetView.as_view(), name='auth-forgot-password'),
    path('auth/reset-password/', ConfirmPasswordResetView.as_view(), name='auth-reset-password'),
]

address_router = SimpleRouter()
address_router.register('account/addresses', AddressViewSet, basename='account-addresses')
urlpatterns += address_router.urls

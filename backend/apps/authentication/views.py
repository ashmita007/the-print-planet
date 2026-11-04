from django.contrib.auth import authenticate, logout
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.conf import settings
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token


def unique_username_for(email):
    base = ''.join(c for c in email.split('@')[0] if c.isalnum() or c in '._-')[:120] or 'buyer'
    username, idx = base, 1
    while User.objects.filter(username=username).exists():
        username = f"{base}{idx}"
        idx += 1
    return username


def user_payload(user):
    return {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'is_staff': user.is_staff,
        'is_superuser': user.is_superuser,
    }


def password_problem(password, user=None):
    try:
        validate_password(password, user=user)
    except DjangoValidationError as exc:
        return ' '.join(exc.messages)
    return ''


class LoginView(APIView):
    """Unified login endpoint for owners and bulk buyer clients."""
    permission_classes = [permissions.AllowAny]
    throttle_scope = 'auth'

    def post(self, request):
        username = request.data.get('username', '').strip()
        password = request.data.get('password', '')

        if not username or not password:
            return Response({'error': 'Username/email and password are required'}, status=status.HTTP_400_BAD_REQUEST)

        # Support login by username or email
        user = None
        if '@' in username:
            user_obj = User.objects.filter(email__iexact=username).first()
            if user_obj:
                user = authenticate(request, username=user_obj.username, password=password)
        else:
            user = authenticate(request, username=username, password=password)

        if not user:
            return Response({'error': 'Invalid email/username or password'}, status=status.HTTP_401_UNAUTHORIZED)

        # Create or retrieve DRF token
        # Token-only auth: no session cookie, so other sites cannot ride a signed-in browser.
        token, _ = Token.objects.get_or_create(user=user)
        role = 'owner' if (user.is_staff or user.is_superuser) else 'client'

        return Response({
            'token': token.key,
            'role': role,
            'user': user_payload(user),
        })


class RegisterView(APIView):
    """Customer registration endpoint for schools, corporates, and bulk buyers."""
    permission_classes = [permissions.AllowAny]
    throttle_scope = 'auth'

    def post(self, request):
        full_name = request.data.get('full_name', '').strip()
        company_name = request.data.get('company_name', '').strip()
        email = request.data.get('email', '').strip().lower()
        phone = request.data.get('phone', '').strip()
        password = str(request.data.get('password', ''))

        if not email or not password or not full_name:
            return Response(
                {'error': 'Full name, email, and password are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if user with this email already exists
        if User.objects.filter(email__iexact=email).exists():
            return Response(
                {'error': 'An account with this email already exists. Please sign in.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        name_parts = full_name.split()
        user = User(
            username=unique_username_for(email),
            email=email,
            first_name=name_parts[0] if name_parts else '',
            last_name=" ".join(name_parts[1:]),
            is_staff=False,
            is_superuser=False,
        )
        problem = password_problem(password, user)
        if problem:
            return Response({'error': problem, 'field': 'password'}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(password)
        user.save()

        token, _ = Token.objects.get_or_create(user=user)

        # Link any past guest enquiries made with this email address
        try:
            from apps.enquiries.models import Enquiry
            Enquiry.objects.filter(email__iexact=email, user__isnull=True).update(
                user=user,
                company_name=company_name or Enquiry.objects.filter(email__iexact=email).first().company_name
            )
        except Exception:
            pass

        return Response({
            'message': 'Account registered successfully',
            'token': token.key,
            'role': 'client',
            'user': user_payload(user),
        }, status=status.HTTP_201_CREATED)


class LogoutView(APIView):
    """Owner logout endpoint."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # Delete auth token if token auth is used
        try:
            token = Token.objects.filter(user=request.user).first()
            if token:
                token.delete()
        except Exception:
            pass

        logout(request)
        return Response({'message': 'Logged out successfully'})


class CurrentUserView(APIView):
    """Get current authenticated user info."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        payload = user_payload(user)
        payload['role'] = 'owner' if (user.is_staff or user.is_superuser) else 'client'
        return Response(payload)


class ChangePasswordView(APIView):
    """Allows authenticated owner to change password."""
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def post(self, request):
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')

        if not current_password or not new_password:
            return Response({'error': 'Both current and new password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        if not user.check_password(current_password):
            return Response({'error': 'Current password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)

        problem = password_problem(new_password, user)
        if problem:
            return Response({'error': problem}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()

        # Re-issue token
        Token.objects.filter(user=user).delete()
        new_token = Token.objects.create(user=user)

        return Response({
            'message': 'Password changed successfully',
            'token': new_token.key
        })


class RequestPasswordResetView(APIView):
    """Initiates a secure password reset link / reset token for any client or owner."""
    permission_classes = [permissions.AllowAny]
    throttle_scope = 'auth'

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        if not email:
            return Response({'error': 'Please provide your registered email address.'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email__iexact=email).first()
        if not user:
            # Prevent email enumeration by returning a generic success message
            return Response({
                'message': 'If this email is registered in our portal, a password reset link has been dispatched.',
            }, status=status.HTTP_200_OK)

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        # Dispatch via email provider if available
        try:
            from apps.enquiries.services import send_resend_email, send_brevo_email
            site = settings.FRONTEND_URL or request.build_absolute_uri('/').rstrip('/')
            reset_url = f"{site}/account/reset-password?uid={uid}&token={token}"
            subject = "Password Reset Request — The Print Planet"
            html_body = f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #E2E8F0; border-radius: 12px;">
              <h2 style="color: #17365D;">Password Reset Instructions</h2>
              <p style="color: #4A5568;">Hello {user.first_name or user.username},</p>
              <p style="color: #4A5568;">We received a request to reset your password on The Print Planet Official Portal.</p>
              <p style="text-align: center; margin: 30px 0;">
                <a href="{reset_url}" style="background-color: #E87832; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset My Password</a>
              </p>
              <p style="color: #718096; font-size: 12px;">If you did not request this, please disregard this email. This link is valid for 24 hours.</p>
            </div>
            """
            send_resend_email(to_email=user.email, subject=subject, html_content=html_body)
        except Exception:
            pass

        # Same response as an unknown email. The token is only echoed in local DEBUG;
        # returning it for staff handed anyone the owner's reset link.
        payload = {'message': 'If this email is registered in our portal, a password reset link has been dispatched.'}
        if settings.DEBUG:
            payload.update({'debug_reset_token': token, 'uid': uid})
        return Response(payload, status=status.HTTP_200_OK)


class ConfirmPasswordResetView(APIView):
    """Sets a new password using uid and token."""
    permission_classes = [permissions.AllowAny]
    throttle_scope = 'auth'

    def post(self, request):
        uidb64 = request.data.get('uid', '').strip()
        token = request.data.get('token', '').strip()
        new_password = str(request.data.get('new_password', ''))

        if not uidb64 or not token or not new_password:
            return Response({'error': 'UID, reset token, and new password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({'error': 'Invalid or expired password reset link.'}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({'error': 'Invalid or expired password reset token. Please request a new one.'}, status=status.HTTP_400_BAD_REQUEST)

        problem = password_problem(new_password, user)
        if problem:
            return Response({'error': problem}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()

        # Re-issue auth token
        Token.objects.filter(user=user).delete()
        new_token = Token.objects.create(user=user)

        return Response({
            'message': 'Your password has been successfully reset. You can now log in.',
            'token': new_token.key
        }, status=status.HTTP_200_OK)

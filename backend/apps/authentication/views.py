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

from . import otp
from .otp import OTPResult


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


def link_guest_enquiries(user, company_name=''):
    """Attach earlier guest enquiries to the account. Only call once the email is verified,
    otherwise anyone could register with a buyer's email and read their enquiries."""
    try:
        from apps.enquiries.models import Enquiry
        past = Enquiry.objects.filter(email__iexact=user.email, user__isnull=True)
        updates = {'user': user}
        if company_name:
            updates['company_name'] = company_name
        past.update(**updates)
    except Exception:
        pass


def signed_in_payload(user, message):
    token, _ = Token.objects.get_or_create(user=user)
    return {
        'message': message,
        'token': token.key,
        'role': 'owner' if (user.is_staff or user.is_superuser) else 'client',
        'user': user_payload(user),
    }


def send_new_code(user, company=''):
    """Issue and email a code. Returns (sent, debug_code_or_None)."""
    code = otp.issue_code(user, company)
    sent = otp.send_code_email(user, code)
    return sent, (code if settings.DEBUG else None)


def verification_response(user, sent, debug_code, http_status=status.HTTP_201_CREATED):
    if not sent:
        return Response({
            'error': "We couldn't send the verification email right now. Please try again in a minute, "
                     'or message us on WhatsApp.',
            'verification_required': True,
            'email': user.email,
        }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    payload = {
        'message': f'We sent a 6-digit code to {user.email}.',
        'verification_required': True,
        'email': user.email,
        'expires_in_minutes': otp.OTP_TTL_MINUTES,
        'resend_after': otp.OTP_RESEND_COOLDOWN_SECONDS,
    }
    if debug_code:
        payload['debug_otp'] = debug_code
    return Response(payload, status=http_status)


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
            # authenticate() refuses inactive users. If this is a sign-up that never confirmed its
            # email and the password is right, send them to the code step instead of "wrong password".
            candidate = (User.objects.filter(email__iexact=username).first() if '@' in username
                         else User.objects.filter(username=username).first())
            if candidate and otp.is_pending_verification(candidate) and candidate.check_password(password):
                sent = False
                if otp.seconds_until_resend(candidate) == 0 and otp.sent_last_hour(candidate) < otp.OTP_MAX_PER_HOUR:
                    sent, _ = send_new_code(candidate)
                return Response({
                    'error': 'Please verify your email to sign in. Enter the 6-digit code we emailed you.',
                    'code': 'email_unverified',
                    'email': candidate.email,
                    'code_sent': sent,
                }, status=status.HTTP_403_FORBIDDEN)
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

        name_parts = full_name.split()
        first, last = (name_parts[0] if name_parts else ''), ' '.join(name_parts[1:])

        existing = User.objects.filter(email__iexact=email).first()
        if existing and not otp.is_pending_verification(existing):
            return Response(
                {'error': 'An account with this email already exists. Please sign in.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = existing or User(
            username=unique_username_for(email),
            email=email,
            is_staff=False,
            is_superuser=False,
        )
        user.first_name, user.last_name = first, last
        problem = password_problem(password, user)
        if problem:
            return Response({'error': problem, 'field': 'password'}, status=status.HTTP_400_BAD_REQUEST)

        if existing:
            # Signing up again before confirming: keep the latest details, respect the resend limits.
            wait = otp.seconds_until_resend(existing)
            if wait or otp.sent_last_hour(existing) >= otp.OTP_MAX_PER_HOUR:
                user.set_password(password)
                user.save()
                return Response({
                    'message': f'We already sent a code to {email}. Check your inbox and spam folder.',
                    'verification_required': True,
                    'email': email,
                    'expires_in_minutes': otp.OTP_TTL_MINUTES,
                    'resend_after': wait or 3600,
                }, status=status.HTTP_200_OK)

        user.is_active = False  # becomes active once the emailed code is entered
        user.set_password(password)
        user.save()

        sent, debug_code = send_new_code(user, company_name)
        return verification_response(user, sent, debug_code)


class VerifyEmailOTPView(APIView):
    """Confirms the 6-digit code, activates the account and signs the buyer in."""
    permission_classes = [permissions.AllowAny]
    throttle_scope = 'auth'

    def post(self, request):
        email = str(request.data.get('email', '')).strip().lower()
        code = str(request.data.get('code', '')).strip()
        if not email or not code:
            return Response({'error': 'Enter the email and the 6-digit code.'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email__iexact=email).first()
        if user and user.is_active and user.email_otps.filter(used_at__isnull=False).exists():
            return Response({'error': 'This email is already verified. Please sign in.', 'code': 'already_verified'},
                            status=status.HTTP_400_BAD_REQUEST)
        if not user or not otp.is_pending_verification(user):
            return Response({'error': 'That code is invalid or has expired. Request a new one.'},
                            status=status.HTTP_400_BAD_REQUEST)

        result, left = otp.check_code(user, code)
        if result == OTPResult.OK:
            user.is_active = True
            user.save(update_fields=['is_active'])
            link_guest_enquiries(user, otp.signup_company(user))
            return Response(signed_in_payload(user, 'Email verified. Your account is ready.'), status=status.HTTP_200_OK)

        messages = {
            OTPResult.WRONG: f"That code doesn't match. {left} {'try' if left == 1 else 'tries'} left.",
            OTPResult.LOCKED: 'Too many wrong tries. Request a new code.',
            OTPResult.EXPIRED: 'That code has expired. Request a new one.',
            OTPResult.MISSING: 'That code is invalid or has expired. Request a new one.',
        }
        return Response({'error': messages[result], 'code': f'otp_{result}', 'attempts_left': left},
                        status=status.HTTP_400_BAD_REQUEST)


class ResendEmailOTPView(APIView):
    """Emails a fresh code to an account that is waiting for verification."""
    permission_classes = [permissions.AllowAny]
    throttle_scope = 'auth'

    def post(self, request):
        email = str(request.data.get('email', '')).strip().lower()
        if not email:
            return Response({'error': 'Enter your email address.'}, status=status.HTTP_400_BAD_REQUEST)

        generic = {
            'message': f'If {email} is waiting for verification, a new code is on its way.',
            'resend_after': otp.OTP_RESEND_COOLDOWN_SECONDS,
        }
        user = User.objects.filter(email__iexact=email).first()
        if not user or not otp.is_pending_verification(user):
            return Response(generic, status=status.HTTP_200_OK)

        wait = otp.seconds_until_resend(user)
        if wait:
            return Response({'error': f'Please wait {wait} seconds before asking for another code.',
                             'resend_after': wait}, status=status.HTTP_429_TOO_MANY_REQUESTS)
        if otp.sent_last_hour(user) >= otp.OTP_MAX_PER_HOUR:
            return Response({'error': 'Too many codes requested. Try again in an hour or message us on WhatsApp.',
                             'resend_after': 3600}, status=status.HTTP_429_TOO_MANY_REQUESTS)

        sent, debug_code = send_new_code(user)
        if not sent:
            return verification_response(user, sent, debug_code)
        if debug_code:
            generic['debug_otp'] = debug_code
        return Response(generic, status=status.HTTP_200_OK)


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

        # Accounts the owner switched off get no reset link; unverified sign-ups do
        # (opening the link proves they own the inbox).
        if not user.is_active and not otp.is_pending_verification(user):
            return Response({
                'message': 'If this email is registered in our portal, a password reset link has been dispatched.',
            }, status=status.HTTP_200_OK)

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        site = settings.FRONTEND_URL or 'https://theprintplanet.co.in'
        reset_url = f"{site}/account/reset-password?uid={uid}&token={token}"
        otp.send_reset_email(user, reset_url)

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

        if not user.is_active and not otp.is_pending_verification(user):
            return Response({'error': 'Invalid or expired password reset link.'}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({'error': 'Invalid or expired password reset token. Please request a new one.'}, status=status.HTTP_400_BAD_REQUEST)

        problem = password_problem(new_password, user)
        if problem:
            return Response({'error': problem}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        if not user.is_active:
            user.is_active = True  # the reset link proved they own this inbox
            otp.mark_verified(user)
            link_guest_enquiries(user, otp.signup_company(user))
        user.save()

        # Re-issue auth token (signs out other devices)
        Token.objects.filter(user=user).delete()
        new_token = Token.objects.create(user=user)

        return Response({
            'message': 'Your password has been successfully reset. You can now log in.',
            'token': new_token.key
        }, status=status.HTTP_200_OK)

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token


class LoginView(APIView):
    """Unified login endpoint for owners and bulk buyer clients."""
    permission_classes = [permissions.AllowAny]

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
        token, _ = Token.objects.get_or_create(user=user)
        login(request, user)

        role = 'owner' if (user.is_staff or user.is_superuser) else 'client'

        return Response({
            'token': token.key,
            'role': role,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
            }
        })


class RegisterView(APIView):
    """Customer registration endpoint for schools, corporates, and bulk buyers."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        full_name = request.data.get('full_name', '').strip()
        company_name = request.data.get('company_name', '').strip()
        email = request.data.get('email', '').strip().lower()
        phone = request.data.get('phone', '').strip()
        password = request.data.get('password', '').strip()

        if not email or not password or not full_name:
            return Response(
                {'error': 'Full name, email, and password are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(password) < 6:
            return Response(
                {'error': 'Password must be at least 6 characters long.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if user with this email already exists
        if User.objects.filter(email__iexact=email).exists():
            return Response(
                {'error': 'An account with this email already exists. Please sign in.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Generate unique username from email
        base_username = email.split('@')[0]
        base_username = ''.join(c for c in base_username if c.isalnum() or c in '._-') or 'buyer'
        username = base_username
        idx = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{idx}"
            idx += 1

        name_parts = full_name.split()
        first_name = name_parts[0] if name_parts else ''
        last_name = " ".join(name_parts[1:]) if len(name_parts) > 1 else ''

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            is_staff=False,
            is_superuser=False
        )

        token, _ = Token.objects.get_or_create(user=user)
        login(request, user)

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
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_staff': False,
                'is_superuser': False,
            }
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
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
        })


class ChangePasswordView(APIView):
    """Allows authenticated owner to change password."""
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def post(self, request):
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')

        if not current_password or not new_password:
            return Response({'error': 'Both current and new password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        if len(new_password) < 8:
            return Response({'error': 'New password must be at least 8 characters long.'}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        if not user.check_password(current_password):
            return Response({'error': 'Current password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()

        # Re-issue token
        Token.objects.filter(user=user).delete()
        new_token = Token.objects.create(user=user)

        return Response({
            'message': 'Password changed successfully',
            'token': new_token.key
        })

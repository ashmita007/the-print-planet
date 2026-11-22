from django.contrib.auth.models import User


def unique_username_for(email):
    base = ''.join(c for c in email.split('@')[0] if c.isalnum() or c in '._-')[:120] or 'buyer'
    username, idx = base, 1
    while User.objects.filter(username=username).exists():
        username = f"{base}{idx}"
        idx += 1
    return username

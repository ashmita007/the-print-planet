from django.conf import settings
from django.db import models


class EmailOTP(models.Model):
    """A one-time code emailed to confirm that a new account owns its email address.

    Only a keyed hash of the code is stored. Each code expires, allows a few wrong tries,
    and is used once; issuing a new code makes the older ones unusable.
    """

    PURPOSE_REGISTER = 'register'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='email_otps')
    purpose = models.CharField(max_length=20, default=PURPOSE_REGISTER)
    code_hash = models.CharField(max_length=64)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    attempts = models.PositiveSmallIntegerField(default=0)
    used_at = models.DateTimeField(null=True, blank=True)
    signup_company = models.CharField(max_length=200, blank=True, default='')

    class Meta:
        ordering = ['-created_at']
        indexes = [models.Index(fields=['user', 'purpose', '-created_at'])]

    def __str__(self):
        return f'{self.purpose} code for user {self.user_id}'

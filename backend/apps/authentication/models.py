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


class Address(models.Model):
    """A saved shipping/billing address. Only its owner can read or change it."""

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='addresses')
    label = models.CharField(max_length=50, blank=True, default='')
    full_name = models.CharField(max_length=200)
    phone = models.CharField(max_length=20)
    line1 = models.CharField(max_length=255)
    line2 = models.CharField(max_length=255, blank=True, default='')
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=6)
    gstin = models.CharField(max_length=15, blank=True, default='')
    is_default_shipping = models.BooleanField(default=False)
    is_default_billing = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-is_default_shipping', '-created_at']
        verbose_name_plural = 'addresses'

    def __str__(self):
        return f'{self.label or self.full_name}, {self.city} {self.pincode}'

    def snapshot(self):
        """Plain dict copied onto an order so later edits never alter it."""
        return {
            'label': self.label, 'full_name': self.full_name, 'phone': self.phone,
            'line1': self.line1, 'line2': self.line2, 'city': self.city, 'state': self.state,
            'pincode': self.pincode, 'gstin': self.gstin,
        }

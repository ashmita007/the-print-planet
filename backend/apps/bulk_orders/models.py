import random
from datetime import datetime
from django.db import models
from django.contrib.auth.models import User


class BulkOrder(models.Model):
    ORGANIZATION_TYPE_CHOICES = [
        ('school', 'School / Educational Institution'),
        ('corporate', 'Corporate Company / Enterprise'),
        ('college', 'College / University'),
        ('reseller', 'Printing Press / Wholesale Reseller'),
        ('other', 'Other Enterprise'),
    ]

    STATUS_CHOICES = [
        ('submitted', 'Inquiry Submitted'),
        ('reviewing', 'Under Technical Review'),
        ('quoted', 'Formal Quotation Ready'),
        ('proofing', 'Artwork & Sample Proofing'),
        ('in_production', 'In Production'),
        ('dispatched', 'Dispatched / In Transit'),
        ('completed', 'Delivered & Completed'),
        ('cancelled', 'Cancelled'),
    ]

    order_number = models.CharField(max_length=50, unique=True, db_index=True)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='bulk_orders'
    )
    organization_type = models.CharField(
        max_length=50,
        choices=ORGANIZATION_TYPE_CHOICES,
        default='corporate',
        db_index=True
    )
    organization_name = models.CharField(max_length=255)
    contact_person = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=50)
    city = models.CharField(max_length=100, blank=True, default='')
    state = models.CharField(max_length=100, blank=True, default='')
    gst_number = models.CharField(max_length=50, blank=True, default='')

    category_type = models.CharField(max_length=100, blank=True, default='custom_lanyards')
    product = models.ForeignKey(
        'catalog.Product',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='bulk_orders'
    )
    product_name_text = models.CharField(max_length=255, blank=True, default='')
    checked_products = models.ManyToManyField(
        'catalog.Product',
        blank=True,
        related_name='checked_in_bulk_orders',
        help_text='Products explored, sampled, or checked by user for this bulk requirement'
    )
    estimated_quantity = models.PositiveIntegerField(default=500)
    specifications = models.JSONField(default=dict, blank=True)
    requirements = models.TextField()

    attachment = models.FileField(upload_to='bulk_orders/%Y/%m/', blank=True, null=True)
    attachment_url = models.CharField(max_length=1000, blank=True, default='')

    status = models.CharField(
        max_length=50,
        choices=STATUS_CHOICES,
        default='submitted',
        db_index=True
    )
    quoted_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    quote_notes = models.TextField(blank=True, default='')
    tracking_consignment_number = models.CharField(max_length=100, blank=True, default='')
    tracking_courier_partner = models.CharField(max_length=100, blank=True, default='')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Bulk Order'
        verbose_name_plural = 'Bulk Orders'

    def __str__(self):
        return f"{self.order_number} — {self.organization_name} ({self.get_organization_type_display()})"

    def save(self, *args, **kwargs):
        if not self.order_number:
            year = datetime.now().year
            rand_suffix = random.randint(1000, 9999)
            prefix = "SCH" if self.organization_type == "school" else "CORP"
            self.order_number = f"PP-{prefix}-{year}-{rand_suffix}"
            while BulkOrder.objects.filter(order_number=self.order_number).exists():
                rand_suffix = random.randint(1000, 9999)
                self.order_number = f"PP-{prefix}-{year}-{rand_suffix}"
        super().save(*args, **kwargs)


class BulkOrderMessage(models.Model):
    SENDER_CHOICES = [
        ('client', 'Client / Buyer'),
        ('owner', 'Print Planet Support / Owner'),
        ('system', 'System Notification'),
    ]

    order = models.ForeignKey(
        BulkOrder,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    sender = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    sender_type = models.CharField(max_length=20, choices=SENDER_CHOICES, default='client')
    sender_name = models.CharField(max_length=255)
    message = models.TextField()
    attachment = models.FileField(upload_to='bulk_messages/%Y/%m/', blank=True, null=True)
    attachment_url = models.CharField(max_length=1000, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']
        verbose_name = 'Bulk Order Message'
        verbose_name_plural = 'Bulk Order Messages'

    def __str__(self):
        return f"Msg #{self.id} on {self.order.order_number} by {self.sender_name}"


class ConversationBackupArchive(models.Model):
    archive_code = models.CharField(max_length=100, unique=True)
    total_orders = models.PositiveIntegerField(default=0)
    total_messages = models.PositiveIntegerField(default=0)
    backup_data = models.JSONField(default=dict, blank=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Conversation Backup Archive'
        verbose_name_plural = 'Conversation Backup Archives'

    def __str__(self):
        return f"{self.archive_code} ({self.total_orders} orders, {self.total_messages} messages)"


class UserCheckedProduct(models.Model):
    """Tracks which catalog products a registered buyer or visitor browsed, checked, or quoted."""
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='checked_products'
    )
    product = models.ForeignKey(
        'catalog.Product',
        on_delete=models.CASCADE,
        related_name='user_views'
    )
    viewed_at = models.DateTimeField(auto_now=True)
    inquiry_count = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ['-viewed_at']
        unique_together = ('user', 'product')
        verbose_name = 'User Checked Product'
        verbose_name_plural = 'User Checked Products'

    def __str__(self):
        return f"{self.user.username} checked {self.product.name}"

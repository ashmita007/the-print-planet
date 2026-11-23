import random
from decimal import Decimal
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
        ('paid', 'Paid'),
        ('proofing', 'Artwork & Sample Proofing'),
        ('in_production', 'In Production'),
        ('dispatched', 'Dispatched / In Transit'),
        ('completed', 'Delivered & Completed'),
        ('cancelled', 'Cancelled'),
        ('returned', 'Returned'),
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
    # Address snapshots taken at request time; later edits to a saved Address never change them.
    shipping_address = models.JSONField(default=dict, blank=True)
    billing_address = models.JSONField(default=dict, blank=True)
    # Quote breakdown computed by the server (see commerce.compute_quote); quoted_amount is the total.
    quote_subtotal = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    quote_shipping = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    quote_gst_rate = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    quote_tax = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    quote_cgst = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    quote_sgst = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    quote_igst = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    quote_line_notes = models.JSONField(default=list, blank=True)
    tracking_consignment_number = models.CharField(max_length=100, blank=True, default='')
    tracking_courier_partner = models.CharField(max_length=100, blank=True, default='')

    # Set when an online payment (see QuotePayment) settles the current quote.
    razorpay_payment_id = models.CharField(max_length=64, blank=True, default='')
    paid_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Bulk Order'
        verbose_name_plural = 'Bulk Orders'

    def __str__(self):
        return f"{self.order_number} — {self.organization_name} ({self.get_organization_type_display()})"

    @property
    def is_paid(self):
        return self.paid_at is not None

    @property
    def payment_under_review(self):
        """An online payment arrived that did not settle the quote; the owner must resolve it."""
        return not self.is_paid and self.quote_payments.filter(captured_at__isnull=False).exists()

    def quote_paise(self):
        """The quote in paise, or None when there is nothing to pay."""
        if self.quoted_amount is None:
            return None
        amount = Decimal(str(self.quoted_amount))
        return int((amount * 100).to_integral_value()) if amount > 0 else None

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


class OrderEvent(models.Model):
    """One entry in an order's timeline. Created explicitly by fulfilment services, never by signals."""
    ACTOR_CHOICES = [('owner', 'Owner'), ('customer', 'Customer'), ('system', 'System')]

    order = models.ForeignKey(BulkOrder, on_delete=models.CASCADE, related_name='events')
    status = models.CharField(max_length=50)
    note = models.TextField(blank=True, default='')
    courier = models.CharField(max_length=100, blank=True, default='')
    awb = models.CharField(max_length=100, blank=True, default='')
    actor = models.CharField(max_length=20, choices=ACTOR_CHOICES, default='system')
    # Owner-only note: hidden from the customer's timeline and never emailed.
    internal = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at', 'id']

    def __str__(self):
        return f"{self.order.order_number}: {self.status} by {self.actor}"


class OrderRequest(models.Model):
    """A customer's request to cancel an order or return a completed one."""
    KIND_CHOICES = [('cancel', 'Cancel'), ('return', 'Return')]
    STATUS_CHOICES = [('pending', 'Pending'), ('approved', 'Approved'), ('declined', 'Declined')]

    order = models.ForeignKey(BulkOrder, on_delete=models.CASCADE, related_name='requests')
    kind = models.CharField(max_length=10, choices=KIND_CHOICES)
    reason = models.TextField(blank=True, default='')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending', db_index=True)
    refund_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    razorpay_refund_id = models.CharField(max_length=64, blank=True, default='')
    owner_note = models.TextField(blank=True, default='')
    decided_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.kind} request for {self.order.order_number} ({self.status})"


class Invoice(models.Model):
    """Tax invoice issued once when an order is paid. The snapshot is immutable."""
    order = models.OneToOneField(BulkOrder, on_delete=models.PROTECT, related_name='invoice')
    financial_year = models.CharField(max_length=7)
    sequence = models.PositiveIntegerField()
    number = models.CharField(max_length=64, unique=True)
    snapshot = models.JSONField(default=dict)
    issued_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-issued_at']
        constraints = [
            models.UniqueConstraint(fields=['financial_year', 'sequence'], name='uniq_invoice_fy_sequence'),
        ]

    def __str__(self):
        return self.number


class QuotePayment(models.Model):
    """
    One Razorpay order opened to pay a bulk order's quote. Rows are never overwritten, so a
    payment Razorpay reports can always be matched to its bulk order, even if the quote
    changed or the customer opened checkout twice.
    """
    order = models.ForeignKey(BulkOrder, on_delete=models.CASCADE, related_name='quote_payments')
    razorpay_order_id = models.CharField(max_length=64, unique=True)
    amount_paise = models.PositiveBigIntegerField()
    razorpay_payment_id = models.CharField(max_length=64, blank=True, default='')
    captured_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.razorpay_order_id} for {self.order.order_number} ({self.amount_paise / 100:.2f} INR)"


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


class PaymentGatewaySettings(models.Model):
    """
    Razorpay keys entered by the owner in the admin panel (a single row). Secrets are stored
    encrypted (see secret_box). When disabled or empty, RAZORPAY_* environment variables apply.
    """
    enabled = models.BooleanField(default=False)
    key_id = models.CharField(max_length=64, blank=True, default='')
    key_secret_encrypted = models.TextField(blank=True, default='')
    webhook_secret_encrypted = models.TextField(blank=True, default='')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Payment Gateway Settings'
        verbose_name_plural = 'Payment Gateway Settings'

    def __str__(self):
        return f"Razorpay ({'on' if self.enabled else 'off'})"

    @classmethod
    def load(cls):
        return cls.objects.order_by('pk').first() or cls()


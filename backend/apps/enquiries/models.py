from django.db import models


class Enquiry(models.Model):
    STATUS_CHOICES = [
        ('new', 'New'),
        ('in_progress', 'In Progress'),
        ('quoted', 'Quoted'),
        ('closed', 'Closed'),
        ('spam', 'Spam'),
    ]

    full_name = models.CharField(max_length=255)
    company_name = models.CharField(max_length=255, blank=True, default='')
    email = models.EmailField()
    phone = models.CharField(max_length=50)
    product = models.ForeignKey(
        'catalog.Product',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='enquiries'
    )
    product_name_text = models.CharField(max_length=255, blank=True, default='')
    requested_quantity = models.PositiveIntegerField(blank=True, null=True)
    message = models.TextField()
    source_page = models.CharField(max_length=255, blank=True, default='')
    status = models.CharField(max_length=50, default='new', choices=STATUS_CHOICES, db_index=True)
    admin_notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Enquiries'

    def __str__(self):
        return f"Enquiry #{self.id} from {self.full_name} ({self.company_name or 'Individual'})"

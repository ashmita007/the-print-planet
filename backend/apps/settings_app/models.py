from django.db import models


class SiteSettings(models.Model):
    business_name = models.CharField(max_length=255, default='The Print Planet')
    tagline = models.CharField(max_length=255, default='Industrial ID Card Solutions, Lanyards & Printing Machinery')
    logo_url = models.URLField(max_length=1000, blank=True, null=True)
    favicon_url = models.URLField(max_length=1000, blank=True, null=True)
    email = models.EmailField(default='sales@theprintplanet.in')
    phone = models.CharField(max_length=50, default='+91 98980 61569')
    whatsapp = models.CharField(max_length=50, default='+91 98980 61569')
    address = models.TextField(default='Plot 42, Industrial Area Phase II, Ahmedabad, Gujarat, India - 380004')
    gst_number = models.CharField(max_length=50, blank=True, default='')
    social_links = models.JSONField(default=dict, blank=True)
    footer_text = models.TextField(default='The Print Planet is a premier industrial manufacturer and distributor of identification systems, satin lanyard rolls, rigid badge holders, metal attachments, card fusing machinery, and RFID solutions.')
    seo_defaults = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Site Settings'
        verbose_name_plural = 'Site Settings'

    def __str__(self):
        return f"{self.business_name} Settings"

    @classmethod
    def get_settings(cls):
        obj, _ = cls.objects.get_or_create(id=1)
        return obj


class HomePageSection(models.Model):
    section_type = models.CharField(max_length=100)
    title = models.CharField(max_length=255)
    subtitle = models.TextField(blank=True, default='')
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    config = models.JSONField(default=dict, blank=True)
    featured_categories = models.ManyToManyField('catalog.Category', blank=True, related_name='homepage_sections')
    featured_products = models.ManyToManyField('catalog.Product', blank=True, related_name='homepage_sections')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['display_order', 'id']

    def __str__(self):
        return f"{self.title} ({self.section_type})"

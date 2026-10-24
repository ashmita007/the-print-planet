from django.db import models


class SiteSettings(models.Model):
    business_name = models.CharField(max_length=255, default='THE PRINT PLANET')
    tagline = models.CharField(max_length=255, default='Delivering Excellence in PVC Cards | Lens Packaging | Commercial Printing Solutions')
    logo_url = models.URLField(max_length=1000, blank=True, null=True)
    favicon_url = models.URLField(max_length=1000, blank=True, null=True)
    email = models.EmailField(default='theprintplanet01@gmail.com')
    phone = models.CharField(max_length=50, default='+91 97418 08034')
    whatsapp = models.CharField(max_length=50, default='+91 97418 08034')
    address = models.TextField(default='No. 33, 34, Srigandhadakaval, Byraveshwaranagar, Near Hanumanthnagar, Sunkadakatte, Bangalore - 560091, Karnataka, India')
    gst_number = models.CharField(max_length=50, blank=True, default='29AAQFT3909B1ZZ')
    hero_badge = models.CharField(max_length=255, blank=True, default="The Print Planet™ • India's Direct B2B Factory")
    hero_title = models.CharField(max_length=255, blank=True, default="Print Planet — Factory Direct")
    hero_subtitle = models.CharField(max_length=255, blank=True, default="Wholesale ID Cards, Lanyard Rolls & Machinery")
    hero_caption = models.TextField(blank=True, default="Official portal of The Print Planet (theprintplanet.co.in). India's leading B2B manufacturing hub for satin lanyard rolls, rigid PVC ID card holders, RFID smart cards, dog hooks, and card die cutting machinery with 24–48h pan-India dispatch.")
    about_data = models.JSONField(default=dict, blank=True)
    social_links = models.JSONField(default=dict, blank=True)
    footer_text = models.TextField(default='THE PRINT PLANET - Delivering Excellence in PVC Cards | Lens Packaging | Commercial Printing Solutions. ✱ Your Vision is Our Focus ✱. GSTIN: 29AAQFT3909B1ZZ | PAN: AAQFT3909B.')
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

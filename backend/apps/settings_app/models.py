from django.db import models


class SiteSettings(models.Model):
    business_name = models.CharField(max_length=255, default='THE PRINT PLANET')
    tagline = models.CharField(max_length=255, default='Specialist in PVC Cards | Lanyard Rolls & Commercial ID Machinery')
    logo_url = models.CharField(max_length=1000, blank=True, null=True, default='/logo.png')
    favicon_url = models.CharField(max_length=1000, blank=True, null=True, default='/favicon.ico')
    email = models.EmailField(default='theprintplanet01@gmail.com')
    phone = models.CharField(max_length=50, default='+91 97418 08034')
    whatsapp = models.CharField(max_length=50, default='+91 97418 08034')
    address = models.TextField(default='No. 33, 34, Srigandhadakaval, Byraveshwaranagar, Near Hanumanthnagar, Sunkadakatte, Bangalore - 560091, Karnataka, India')
    gst_number = models.CharField(max_length=50, blank=True, default='29AAQFT3909B1ZZ')
    hero_badge = models.CharField(max_length=255, blank=True, default="The Print Planet™ • Specialist in PVC Cards & ID Systems")
    hero_title = models.CharField(max_length=255, blank=True, default="The Print Planet — Factory Direct")
    hero_subtitle = models.CharField(max_length=255, blank=True, default="Specialist in PVC Cards, Lanyard Rolls & ID Machinery")
    hero_caption = models.TextField(blank=True, default="Official portal of The Print Planet (theprintplanet.co.in) — India's verified specialist in PVC cards, CR-80 fusing sheets, rigid ID card holders, satin lanyard rolls, RFID smart cards, and industrial card die-cutting machinery with 24–48h pan-India dispatch from Sunkadakatte, Bangalore.")
    about_data = models.JSONField(default=dict, blank=True)
    social_links = models.JSONField(default=dict, blank=True)
    footer_text = models.TextField(default='THE PRINT PLANET — Specialist in PVC Cards | Lanyard Rolls & Commercial ID Machinery. ✱ Your Vision is Our Focus ✱. GSTIN: 29AAQFT3909B1ZZ | PAN: AAQFT3909B.')
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
        obj = cls.objects.first()
        if not obj:
            obj = cls.objects.create(id=1)
        return obj

    def save(self, *args, **kwargs):
        # Guarantee singleton row: if record already exists and this is new, update the existing one
        if not self.pk and SiteSettings.objects.exists():
            self.pk = SiteSettings.objects.first().pk
        super().save(*args, **kwargs)


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

from django.db import migrations


def mark_paid_orders(apps, schema_editor):
    """Orders paid online before the 'paid' status existed sat in submitted, reviewing or quoted; move them so fulfilment can continue."""
    BulkOrder = apps.get_model('bulk_orders', 'BulkOrder')
    OrderEvent = apps.get_model('bulk_orders', 'OrderEvent')
    for order in BulkOrder.objects.filter(status__in=['submitted', 'reviewing', 'quoted'], paid_at__isnull=False):
        order.status = 'paid'
        order.save(update_fields=['status'])
        OrderEvent.objects.create(
            order=order, status='paid', actor='system',
            note='Payment received online (recorded before order tracking existed).',
        )


class Migration(migrations.Migration):
    dependencies = [('bulk_orders', '0005_bulkorder_billing_address_bulkorder_quote_cgst_and_more')]
    operations = [migrations.RunPython(mark_paid_orders, migrations.RunPython.noop)]

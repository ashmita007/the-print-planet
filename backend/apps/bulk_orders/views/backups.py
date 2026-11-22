from io import BytesIO
from datetime import datetime
from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import HttpResponse
from apps.bulk_orders.models import BulkOrder, BulkOrderMessage, ConversationBackupArchive


class OwnerConversationBackupDownloadView(APIView):
    """Separate dedicated backup generator for all user conversations and bulk orders in Excel format."""
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def get(self, request):
        import openpyxl
        from openpyxl.styles import Font, PatternFill, Alignment
        from openpyxl.utils import get_column_letter

        wb = openpyxl.Workbook()
        header_font = Font(name='Calibri', size=11, bold=True, color='FFFFFF')

        # ----------------------------------------------------
        # Sheet 1: Bulk Orders Overview
        # ----------------------------------------------------
        ws1 = wb.active
        ws1.title = "Bulk Orders Summary"
        h1 = [
            'Order #', 'Organization Name', 'Org Type', 'Contact Person', 'Email',
            'Phone', 'City', 'Category', 'Quantity', 'Status', 'Quoted Amount (INR)',
            'Tracking Courier', 'Tracking AWB', 'Messages Count', 'Created Date'
        ]
        ws1.append(h1)
        for c_idx in range(1, len(h1) + 1):
            cell = ws1.cell(row=1, column=c_idx)
            cell.fill = PatternFill(start_color='17365D', end_color='17365D', fill_type='solid')
            cell.font = header_font
            cell.alignment = Alignment(horizontal='center', vertical='center')

        orders = BulkOrder.objects.select_related('user', 'product').prefetch_related('messages').all()
        for o in orders:
            ws1.append([
                o.order_number,
                o.organization_name,
                o.get_organization_type_display(),
                o.contact_person,
                o.email,
                o.phone,
                o.city,
                o.category_type,
                o.estimated_quantity,
                o.get_status_display(),
                float(o.quoted_amount) if o.quoted_amount else '',
                o.tracking_courier_partner,
                o.tracking_consignment_number,
                o.messages.count(),
                o.created_at.strftime('%Y-%m-%d %H:%M:%S')
            ])

        for col in ws1.columns:
            ws1.column_dimensions[get_column_letter(col[0].column)].width = 24

        # ----------------------------------------------------
        # Sheet 2: All Conversation Messages
        # ----------------------------------------------------
        ws2 = wb.create_sheet(title="User Conversations Backup")
        h2 = ['Message ID', 'Order #', 'Organization', 'Sender Type', 'Sender Name', 'Message Content', 'Timestamp']
        ws2.append(h2)
        for c_idx in range(1, len(h2) + 1):
            cell = ws2.cell(row=1, column=c_idx)
            cell.fill = PatternFill(start_color='E87832', end_color='E87832', fill_type='solid')
            cell.font = header_font
            cell.alignment = Alignment(horizontal='center', vertical='center')

        msgs = BulkOrderMessage.objects.select_related('order').all().order_by('id')
        for m in msgs:
            ws2.append([
                m.id,
                m.order.order_number,
                m.order.organization_name,
                m.get_sender_type_display(),
                m.sender_name,
                m.message,
                m.created_at.strftime('%Y-%m-%d %H:%M:%S')
            ])

        for col in ws2.columns:
            ws2.column_dimensions[get_column_letter(col[0].column)].width = 26

        stream = BytesIO()
        wb.save(stream)
        buffer = stream.getvalue()
        timestamp = datetime.now().strftime('%Y%m%d-%H%M')
        filename = f"the-print-planet-bulk-orders-and-conversations-{timestamp}.xlsx"

        response = HttpResponse(
            buffer,
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response


class OwnerConversationBackupCreateSnapshotView(APIView):
    """Creates a persistent conversation archive record in database for safety audit."""
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def post(self, request):
        timestamp = datetime.now().strftime('%Y%m%d-%H%M%S')
        archive_code = f"ARCH-CONV-{timestamp}"

        orders_data = []
        for o in BulkOrder.objects.prefetch_related('messages').all():
            messages_list = [
                {
                    'id': m.id,
                    'sender_type': m.sender_type,
                    'sender_name': m.sender_name,
                    'message': m.message,
                    'created_at': m.created_at.isoformat()
                }
                for m in o.messages.all()
            ]
            orders_data.append({
                'order_number': o.order_number,
                'organization_name': o.organization_name,
                'organization_type': o.organization_type,
                'contact_person': o.contact_person,
                'email': o.email,
                'phone': o.phone,
                'status': o.status,
                'quantity': o.estimated_quantity,
                'requirements': o.requirements,
                'created_at': o.created_at.isoformat(),
                'messages': messages_list
            })

        total_orders = len(orders_data)
        total_messages = sum(len(o['messages']) for o in orders_data)

        archive = ConversationBackupArchive.objects.create(
            archive_code=archive_code,
            total_orders=total_orders,
            total_messages=total_messages,
            backup_data={'orders': orders_data},
            created_by=request.user,
            notes=request.data.get('notes', 'Manual owner conversation backup snapshot')
        )

        return Response({
            'message': 'Conversation snapshot backed up successfully',
            'archive_code': archive.archive_code,
            'total_orders': archive.total_orders,
            'total_messages': archive.total_messages,
            'created_at': archive.created_at
        }, status=status.HTTP_201_CREATED)

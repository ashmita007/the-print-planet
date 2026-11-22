import logging
from django.http import HttpResponse
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from apps.catalog.importing import ImportFileError, rows_from_upload, build_import_preview, import_rows
from apps.catalog.exporting import catalog_workbook_bytes

logger = logging.getLogger(__name__)


class OwnerBulkImportValidateView(APIView):
    """Validate CSV or JSON payload before importing."""
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request):
        if 'file' in request.FILES:
            try:
                rows = rows_from_upload(request.FILES['file'])
            except ImportFileError as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        elif 'products' in request.data:
            rows = request.data['products']
        else:
            return Response({'error': 'No file or products data provided'}, status=status.HTTP_400_BAD_REQUEST)

        if not isinstance(rows, list):
            return Response({'error': 'Expected a list of products'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(build_import_preview(rows))


class OwnerBulkImportExecuteView(APIView):
    """Execute validated bulk import with update or skip strategy."""
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def post(self, request):
        rows = request.data.get('rows', [])
        strategy = request.data.get('strategy', 'skip')  # 'skip' or 'update'

        if not rows:
            return Response({'error': 'No rows to import'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(import_rows(rows, strategy), status=status.HTTP_200_OK)


class OwnerCatalogExportExcelView(APIView):
    """Owner endpoint to download real-time catalogue and all product images as an Excel workbook."""
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def get(self, request):
        try:
            workbook = catalog_workbook_bytes()
        except ImportError:
            return Response({'error': 'openpyxl library not installed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        response = HttpResponse(
            workbook,
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename="The_Print_Planet_Catalogue_and_Images.xlsx"'
        return response

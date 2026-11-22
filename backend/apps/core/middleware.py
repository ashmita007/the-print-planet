from django.core.exceptions import RequestDataTooBig

# Catalogue import posts every row as one JSON body, far above Django's 2.5 MB default.
LARGE_BODY_PATHS = frozenset({
    '/api/v1/owner/import/validate/',
    '/api/v1/owner/import/execute/',
})
LARGE_BODY_LIMIT = 20 * 1024 * 1024


class LargeBodyForImportMiddleware:
    """Raise the request body limit for the import endpoints only; every other path keeps the default."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path in LARGE_BODY_PATHS:
            # Django has no per-view limit, so swap the size check on this request only.
            def check(length):
                if length > LARGE_BODY_LIMIT:
                    raise RequestDataTooBig('Request body exceeded the import size limit.')
            request._check_data_too_big = check
        return self.get_response(request)

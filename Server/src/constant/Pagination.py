from rest_framework.pagination import CursorPagination
from rest_framework.response import Response
from urllib.parse import urlparse


class CustomCursorPagination(CursorPagination):
    page_size = 12
    ordering = '-CreatedDate'
    
    def get_paginated_response(self, data):
        return Response(
            {
                "next": self.remove_host(self.get_next_link()),
                "previous": self.remove_host(self.get_previous_link()),
                "results": data,
            }
        )

    def remove_host(self, url):
        
        if url:
            parsed_url = urlparse(url)
            return (
                f"{parsed_url.path}?{parsed_url.query}"
                if parsed_url.query
                else parsed_url.path
            )
        return None

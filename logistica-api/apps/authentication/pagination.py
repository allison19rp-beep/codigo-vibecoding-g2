from rest_framework.pagination import PageNumberPagination


class AllResultsPagination(PageNumberPagination):
    page_size = 1000000
    page_size_query_param = 'page_size'
    max_page_size = 1000000

from datetime import datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated ,AllowAny
from .models import Products, StockTransaction
from .serializers import ProductSerializer, StockTransactionSerializer,StockGetTransactionSerializer
from src.constant.Pagination import CustomCursorPagination
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.generics import ListAPIView
from django.utils.dateparse import parse_date
from django.utils.timezone import make_aware
from datetime import datetime, time
from src.utils.product import generate_product_id_and_code
from src.utils.image_utils import decode_base64_image


from src.constant.Logging import get_logger

logger = get_logger(__name__)

    

class ProductListView(APIView):
    permission_classes = [AllowAny]
    pagination_class = CustomCursorPagination
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        try:
            queryset = Products.objects.filter(Active=True).order_by('-CreatedDate')
            
            paginator = self.pagination_class()
            page = paginator.paginate_queryset(queryset, request)
            serializer = ProductSerializer(page, many=True)
            
            logger.info("Returning %d products after pagination", len(serializer.data))
            return paginator.get_paginated_response(serializer.data)
        
        except Exception as e:
            logger.error(f"Error listing products: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        
class StockTransactionListView(ListAPIView):
    
    permission_classes = [AllowAny]
    pagination_class = CustomCursorPagination
    serializer_class = StockGetTransactionSerializer

    def get_queryset(self):
        
        start_date = self.request.query_params.get("start_date")
        end_date = self.request.query_params.get("end_date")

        logger.info("Fetching stock transactions: start_date=%s, end_date=%s", start_date, end_date)
        
        filters = {}

        if start_date:
            parsed_start_date = parse_date(start_date)
            if parsed_start_date:
                filters["CreatedDate__gte"] = make_aware(
                    datetime.combine(parsed_start_date, time.min)
                )
            else:
                logger.warning("Invalid start_date format: %s", start_date)
                raise ValueError("Invalid start_date format. Use YYYY-MM-DD")

        if end_date:
            parsed_end_date = parse_date(end_date)
            if parsed_end_date:
                filters["CreatedDate__lte"] = make_aware(
                    datetime.combine(parsed_end_date, time.max)
                )
            else:
                logger.warning("Invalid end_date format: %s", end_date)
                raise ValueError("Invalid end_date format. Use YYYY-MM-DD")

        queryset = StockTransaction.objects.filter(**filters).order_by('-CreatedDate')
        logger.info("Found %d stock transactions", queryset.count())
        return queryset
    
    
class AddStockView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        logger.info("Add stock request by user %s", request.user)
        
        serializer = StockTransactionSerializer(
            data=request.data,
            context={'request': request, 'transaction_type': 'IN'}
        )
        try:
            serializer.is_valid(raise_exception=True)
            serializer.create(serializer.validated_data)
            
            logger.info("Stock added successfully")
            return Response({'status': 'Stock added successfully'}, status=200)
    
        except Exception as e:
            logger.error("Add stock failed: %s", str(e))
            return Response({'error': str(e)}, status=400)


class RemoveStockView(APIView):
    
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        
        logger.info("Remove stock request by user %s", request.user)
        
        serializer = StockTransactionSerializer(
            data=request.data,
            context={'request': request, 'transaction_type': 'OUT'}
        )
        try:
            serializer.is_valid(raise_exception=True)
            serializer.create(serializer.validated_data)
            
            logger.info("Stock removed successfully")
            return Response({'status': 'Stock removed successfully'}, status=200)
   
        except Exception as e:
            logger.error("Remove stock failed: %s", str(e))
            return Response({'error': str(e)}, status=400)
        
        
        
class ProductCodePreviewView(APIView):
    
    permission_classes = [IsAuthenticated]

    def get(self, request):
        
        product_id, product_code = generate_product_id_and_code()
        return Response({
            "ProductID": product_id,
            "ProductCode": product_code
        })
        
        
class ProductRegisterView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        image_file = decode_base64_image(request.data.get("ProductImage"))
        if image_file:
            request.data["ProductImage"] = image_file

        request.data["CreatedUser"] = request.user.id

        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
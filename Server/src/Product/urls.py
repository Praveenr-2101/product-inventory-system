from django.urls import path
from .views import ProductRegisterView, ProductListView, AddStockView, RemoveStockView, StockTransactionListView,ProductCodePreviewView

urlpatterns = [
    path('register/', ProductRegisterView.as_view(), name='product_register'),  
    path('list/', ProductListView.as_view(), name='product_list'),       
    path('add_stock/', AddStockView.as_view(), name='add_stock'),            
    path('remove_stock/', RemoveStockView.as_view(), name='remove_stock'),   
    path('stock-report/', StockTransactionListView.as_view(), name='stock_transaction_list'),
     path('next-code/', ProductCodePreviewView.as_view(), name='product-next-code'), 
]
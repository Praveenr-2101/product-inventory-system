from src.Product.models import Products

def generate_product_id_and_code():
    
    last_product = Products.objects.order_by('-ProductID').first()
    product_id = (last_product.ProductID + 1) if last_product else 1000
    product_code = f'PROD-{product_id}'
    return product_id, product_code
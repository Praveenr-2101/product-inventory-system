import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _
from versatileimagefield.fields import VersatileImageField
from src.Usermgmt.models import CustomUser



class Products(models.Model):
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ProductID = models.BigIntegerField(unique=True)
    ProductCode = models.CharField(max_length=255, unique=True)
    ProductName = models.CharField(max_length=255)
    ProductImage = VersatileImageField(upload_to="uploads/", blank=True, null=True)
    CreatedDate = models.DateTimeField(auto_now_add=True)
    UpdatedDate = models.DateTimeField(blank=True, null=True)
    CreatedUser = models.ForeignKey(CustomUser, related_name="user%(class)s_objects", on_delete=models.CASCADE)
    IsFavourite = models.BooleanField(default=False)
    Active = models.BooleanField(default=True)
    HSNCode = models.CharField(max_length=255, blank=True, null=True)
    TotalStock = models.DecimalField(default=0.00, max_digits=20, decimal_places=8, blank=True, null=True)

    class Meta:
        db_table = "products_product"
        verbose_name = _("product")
        verbose_name_plural = _("products")
        unique_together = (("ProductCode", "ProductID"),)
        ordering = ("-CreatedDate", "ProductID")

class Variant(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Products, related_name='variants', on_delete=models.CASCADE)
    name = models.CharField(max_length=100) 
    CreatedDate = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "products_variant"
        indexes = [
            models.Index(fields=['product', 'name'])
        ]

class SubVariant(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    variant = models.ForeignKey(Variant, related_name='options', on_delete=models.CASCADE)
    value = models.CharField(max_length=100)
    stock = models.DecimalField(default=0.00, max_digits=20, decimal_places=8)
    sku = models.CharField(max_length=255, unique=True)
    CreatedDate = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "products_subvariant"
        indexes = [
            models.Index(fields=['variant', 'value'])
        ]

class StockTransaction(models.Model):
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sub_variant = models.ForeignKey(SubVariant, related_name='transactions', on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=20, decimal_places=8)
    transaction_type = models.CharField(max_length=20, choices=[('IN', 'Stock In'), ('OUT', 'Stock Out')])
    CreatedDate = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True)

    class Meta:
        db_table = "products_stock_transaction"
        indexes = [
            models.Index(fields=['sub_variant', 'CreatedDate'])
        ]
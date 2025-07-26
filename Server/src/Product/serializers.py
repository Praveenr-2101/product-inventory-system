from rest_framework import serializers
from .models import Products, Variant, SubVariant, StockTransaction
from src.Usermgmt.models import CustomUser
import uuid
from decimal import Decimal
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)


class SubVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubVariant
        fields = ['id', 'value', 'stock']

class VariantSerializer(serializers.ModelSerializer):
    options = SubVariantSerializer(many=True)

    class Meta:
        model = Variant
        fields = ['id', 'name', 'options']


class StockGetTransactionSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="sub_variant.variant.product.ProductName", read_only=True)
    variant_name = serializers.CharField(source="sub_variant.variant.name", read_only=True)
    option_value = serializers.CharField(source="sub_variant.value", read_only=True)

    class Meta:
        model = StockTransaction
        fields = [
            'id',
            'quantity',
            'transaction_type',
            'CreatedDate',
            'product_name',
            'variant_name',
            'option_value',
        ]

class ProductSerializer(serializers.ModelSerializer):
    variants = VariantSerializer(many=True, required=False)

    class Meta:
        model = Products
        fields = [
            'id', 'ProductID', 'ProductCode',
            'ProductName', 'HSNCode', 'IsFavourite',
            'TotalStock', 'ProductImage',
            'CreatedDate', 'UpdatedDate',
            'CreatedUser', 'variants'
        ]
        read_only_fields = ['CreatedDate', 'TotalStock']

    def create(self, validated_data):
        
        variants_data = validated_data.pop('variants', [])
        
        total_stock = 0

        product = Products.objects.create(**validated_data)

        for variant_data in variants_data:
            options_data = variant_data.pop('options', [])
            variant = Variant.objects.create(product=product, **variant_data)

            for option_data in options_data:
                sku = option_data.get("sku") or f"SKU-{uuid.uuid4().hex[:8]}"
                option_data["sku"] = sku
                stock = option_data.get('stock', 0)
                total_stock += float(stock)
                SubVariant.objects.create(variant=variant, **option_data)

        product.TotalStock = total_stock
        product.save(update_fields=["TotalStock"])
        logger.info(f"Set total stock for {product.ProductCode}: {total_stock}")

        return product


class StockTransactionSerializer(serializers.Serializer):
    sub_variant_id = serializers.UUIDField(required=True)
    quantity = serializers.DecimalField(max_digits=10, decimal_places=2, required=True)

    def validate_sub_variant_id(self, value):
        
        try:
            return SubVariant.objects.get(id=value)
        except SubVariant.DoesNotExist:
            raise serializers.ValidationError("Sub-variant not found")

    def validate(self, data):

        sub_variant = data['sub_variant_id']
        quantity = data['quantity']
        transaction_type = self.context.get('transaction_type')

        if transaction_type == 'OUT' and sub_variant.stock < quantity:
            raise serializers.ValidationError("Insufficient stock")

        return data

    def create(self, validated_data):
      
        sub_variant = validated_data['sub_variant_id']
        quantity = validated_data['quantity']
        transaction_type = self.context['transaction_type']
        user = self.context['request'].user

        if transaction_type == 'IN':
            sub_variant.stock += quantity
            product_total_stock = sub_variant.variant.product.TotalStock + quantity
        else:  
            sub_variant.stock -= quantity
            product_total_stock = sub_variant.variant.product.TotalStock - quantity

        sub_variant.save()

        transaction = StockTransaction.objects.create(
            sub_variant=sub_variant,
            quantity=quantity,
            transaction_type=transaction_type,
            created_by=user,
        )

        product = sub_variant.variant.product
        product.TotalStock = product_total_stock
        product.UpdatedDate = timezone.now()
        product.save()

        logger.info(f"Stock {transaction_type}: {quantity} for {sub_variant.sku})")
        return transaction
from django.contrib import admin

from .models import Products,Variant,SubVariant,StockTransaction
# Register your models here.

admin.site.register(Products)
admin.site.register(Variant)
admin.site.register(SubVariant)
admin.site.register(StockTransaction)

from decimal import Decimal
from django.test import TestCase
from apps.warehouses.models import Warehouse
from apps.warehouses.filters import WarehouseFilter


class WarehouseFilterTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        Warehouse.objects.create(
            name='Small WH',
            address='Address 1',
            city='Bogotá',
            capacity_m3=Decimal('100.00'),
        )
        Warehouse.objects.create(
            name='Medium WH',
            address='Address 2',
            city='Medellín',
            capacity_m3=Decimal('500.00'),
        )
        Warehouse.objects.create(
            name='Large WH',
            address='Address 3',
            city='Bogotá',
            capacity_m3=Decimal('1000.00'),
        )

    def test_filter_by_city_exact(self):
        qs = WarehouseFilter({'city': 'Bogotá'}, queryset=Warehouse.objects.all()).qs
        self.assertEqual(qs.count(), 2)

    def test_filter_by_country_exact(self):
        qs = WarehouseFilter({'country': 'Colombia'}, queryset=Warehouse.objects.all()).qs
        self.assertEqual(qs.count(), 3)

    def test_filter_capacity_m3_gte(self):
        qs = WarehouseFilter({'capacity_m3_gte': '500'}, queryset=Warehouse.objects.all()).qs
        self.assertEqual(qs.count(), 2)

    def test_filter_capacity_m3_lte(self):
        qs = WarehouseFilter({'capacity_m3_lte': '500'}, queryset=Warehouse.objects.all()).qs
        self.assertEqual(qs.count(), 2)

    def test_filter_capacity_m3_range(self):
        qs = WarehouseFilter(
            {'capacity_m3_gte': '200', 'capacity_m3_lte': '600'},
            queryset=Warehouse.objects.all()
        ).qs
        self.assertEqual(qs.count(), 1)

    def test_filter_no_params_returns_all(self):
        qs = WarehouseFilter({}, queryset=Warehouse.objects.all()).qs
        self.assertEqual(qs.count(), 3)

    def test_filter_unknown_city_returns_empty(self):
        qs = WarehouseFilter({'city': 'Nonexistent'}, queryset=Warehouse.objects.all()).qs
        self.assertEqual(qs.count(), 0)

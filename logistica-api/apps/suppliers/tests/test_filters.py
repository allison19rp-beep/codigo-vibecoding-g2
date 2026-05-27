from django.test import TestCase
from apps.suppliers.models import Supplier
from apps.suppliers.filters import SupplierFilter


class SupplierFilterTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        Supplier.objects.create(
            name='Tech Supplies',
            contact_name='Carlos',
            email='carlos@tech.com',
            phone='3001111111',
            address='Addr 1',
            city='Bogotá',
        )
        Supplier.objects.create(
            name='Office Gear',
            contact_name='María',
            email='maria@office.com',
            phone='3002222222',
            address='Addr 2',
            city='Medellín',
        )
        Supplier.objects.create(
            name='Digital World',
            contact_name='Luis',
            email='luis@digital.com',
            phone='3003333333',
            address='Addr 3',
            city='Bogotá',
        )

    def test_filter_by_city_exact(self):
        qs = SupplierFilter({'city': 'Bogotá'}, queryset=Supplier.objects.all()).qs
        self.assertEqual(qs.count(), 2)

    def test_filter_by_country_exact(self):
        qs = SupplierFilter({'country': 'Colombia'}, queryset=Supplier.objects.all()).qs
        self.assertEqual(qs.count(), 3)

    def test_filter_no_params_returns_all(self):
        qs = SupplierFilter({}, queryset=Supplier.objects.all()).qs
        self.assertEqual(qs.count(), 3)

    def test_filter_unknown_city_returns_empty(self):
        qs = SupplierFilter({'city': 'Nonexistent'}, queryset=Supplier.objects.all()).qs
        self.assertEqual(qs.count(), 0)

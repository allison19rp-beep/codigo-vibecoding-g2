from decimal import Decimal
from django.test import TestCase
from apps.warehouses.models import Warehouse


class WarehouseModelTest(TestCase):
    def setUp(self):
        self.warehouse = Warehouse.objects.create(
            name='Main Warehouse',
            address='Calle 123',
            city='Bogotá',
            country='Colombia',
            capacity_m3=Decimal('1000.00'),
        )

    def test_create_warehouse(self):
        self.assertEqual(Warehouse.objects.count(), 1)

    def test_str_representation(self):
        self.assertEqual(str(self.warehouse), 'Main Warehouse — Bogotá')

    def test_default_country(self):
        wh = Warehouse.objects.create(
            name='Default Country WH',
            address='Default Address',
            city='Medellín',
            capacity_m3=Decimal('500.00'),
        )
        self.assertEqual(wh.country, 'Colombia')

    def test_is_active_default_true(self):
        self.assertTrue(self.warehouse.is_active)

    def test_latitude_longitude_nullable(self):
        self.assertIsNone(self.warehouse.latitude)
        self.assertIsNone(self.warehouse.longitude)

    def test_latitude_longitude_with_values(self):
        wh = Warehouse.objects.create(
            name='Geo WH',
            address='Geo Address',
            city='Cali',
            capacity_m3=Decimal('200.00'),
            latitude=Decimal('4.711000'),
            longitude=Decimal('-74.072000'),
        )
        self.assertEqual(wh.latitude, Decimal('4.711000'))
        self.assertEqual(wh.longitude, Decimal('-74.072000'))

    def test_capacity_m3_required(self):
        with self.assertRaises(Exception):
            Warehouse.objects.create(
                name='No Capacity WH',
                address='Address',
                city='City',
            )

    def test_name_max_length(self):
        long_name = 'W' * 255
        wh = Warehouse.objects.create(
            name=long_name,
            address='Address',
            city='City',
            capacity_m3=Decimal('100.00'),
        )
        self.assertEqual(len(wh.name), 255)

    def test_address_max_length(self):
        long_address = 'A' * 500
        wh = Warehouse.objects.create(
            name='Long Address WH',
            address=long_address,
            city='City',
            capacity_m3=Decimal('100.00'),
        )
        self.assertEqual(len(wh.address), 500)

    def test_db_table(self):
        self.assertEqual(Warehouse._meta.db_table, 'warehouses')

    def test_ordering_desc_by_created_at(self):
        self.assertEqual(Warehouse._meta.ordering, ['-created_at'])

    def test_capacity_m3_precision(self):
        wh = Warehouse.objects.create(
            name='Precision WH',
            address='Address',
            city='City',
            capacity_m3=Decimal('12345.67'),
        )
        self.assertEqual(wh.capacity_m3, Decimal('12345.67'))

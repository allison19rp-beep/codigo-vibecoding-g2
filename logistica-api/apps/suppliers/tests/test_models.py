from django.test import TestCase
from django.db import IntegrityError
from apps.suppliers.models import Supplier


class SupplierModelTest(TestCase):
    def setUp(self):
        self.supplier = Supplier.objects.create(
            name='Tech Supplies SAS',
            contact_name='Carlos Pérez',
            email='carlos@techsupplies.com',
            phone='3001234567',
            address='Calle 50 #20-30',
            city='Bogotá',
        )

    def test_create_supplier(self):
        self.assertEqual(Supplier.objects.count(), 1)

    def test_str_representation(self):
        self.assertEqual(str(self.supplier), 'Tech Supplies SAS')

    def test_default_country(self):
        s = Supplier.objects.create(
            name='Default Country Supplier',
            contact_name='Ana',
            email='ana@test.com',
            phone='3000000000',
            address='Addr',
            city='Medellín',
        )
        self.assertEqual(s.country, 'Colombia')

    def test_is_active_default_true(self):
        self.assertTrue(self.supplier.is_active)

    def test_tax_id_nullable_and_unique(self):
        self.assertIsNone(self.supplier.tax_id)
        s2 = Supplier.objects.create(
            name='Another Supplier',
            contact_name='Luis',
            email='luis@test.com',
            phone='3000000001',
            address='Addr',
            city='Cali',
            tax_id='123456789',
        )
        self.assertEqual(s2.tax_id, '123456789')
        with self.assertRaises(IntegrityError):
            Supplier.objects.create(
                name='Duplicate Tax ID',
                contact_name='Test',
                email='dup@test.com',
                phone='3000000002',
                address='Addr',
                city='City',
                tax_id='123456789',
            )

    def test_create_supplier_without_contact_raises_error(self):
        s = Supplier(
            name='No Contact',
            email='no@test.com',
            phone='3000000000',
            address='Addr',
            city='City',
        )
        with self.assertRaises(Exception):
            s.full_clean()

    def test_name_max_length(self):
        long_name = 'S' * 255
        s = Supplier.objects.create(
            name=long_name,
            contact_name='Test',
            email='long@test.com',
            phone='3000000000',
            address='Addr',
            city='City',
        )
        self.assertEqual(len(s.name), 255)

    def test_email_max_length(self):
        long_email = 'e' * 245 + '@test.com'
        s = Supplier.objects.create(
            name='Long Email',
            contact_name='Test',
            email=long_email,
            phone='3000000000',
            address='Addr',
            city='City',
        )
        self.assertEqual(len(s.email), 254)

    def test_db_table(self):
        self.assertEqual(Supplier._meta.db_table, 'suppliers')

    def test_ordering_desc_by_created_at(self):
        self.assertEqual(Supplier._meta.ordering, ['-created_at'])

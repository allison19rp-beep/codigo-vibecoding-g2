from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from apps.suppliers.models import Supplier


class SupplierViewSetTest(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_superuser(
            username='testuser',
            password='testpass123',
            email='test@test.com',
        )
        cls.supplier = Supplier.objects.create(
            name='Tech Supplies SAS',
            contact_name='Carlos Pérez',
            email='carlos@techsupplies.com',
            phone='3001234567',
            address='Calle 50 #20-30',
            city='Bogotá',
        )
        cls.list_url = reverse('supplier-list')
        cls.detail_url = reverse('supplier-detail', kwargs={'pk': cls.supplier.pk})

    def setUp(self):
        self.client = APIClient()

    def test_list_unauthenticated_returns_401(self):
        res = self.client.get(self.list_url)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_unauthenticated_returns_401(self):
        data = {
            'name': 'Unauth Supplier',
            'contact_name': 'Test',
            'email': 'test@test.com',
            'phone': '3000000000',
            'address': 'Addr',
            'city': 'City',
        }
        res = self.client.post(self.list_url, data)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_detail_unauthenticated_returns_401(self):
        res = self.client.get(self.detail_url)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_delete_unauthenticated_returns_401(self):
        res = self.client.delete(self.detail_url)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_authenticated_returns_200(self):
        self.client.force_authenticate(user=self.user)
        res = self.client.get(self.list_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data['results']), 1)

    def test_create_supplier_returns_201(self):
        self.client.force_authenticate(user=self.user)
        data = {
            'name': 'New Supplier',
            'contact_name': 'Ana Martínez',
            'email': 'ana@newsupplier.com',
            'phone': '3009876543',
            'address': 'Carrera 15 #30-20',
            'city': 'Medellín',
        }
        res = self.client.post(self.list_url, data)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['name'], 'New Supplier')
        self.assertEqual(res.data['city'], 'Medellín')

    def test_create_supplier_without_required_fields_returns_400(self):
        self.client.force_authenticate(user=self.user)
        res = self.client.post(self.list_url, {}, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_retrieve_supplier_returns_200(self):
        self.client.force_authenticate(user=self.user)
        res = self.client.get(self.detail_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['name'], 'Tech Supplies SAS')

    def test_retrieve_nonexistent_returns_404(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('supplier-detail', kwargs={'pk': 9999})
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_supplier_returns_200(self):
        self.client.force_authenticate(user=self.user)
        data = {
            'name': 'Updated Supplier',
            'contact_name': 'Updated Contact',
            'email': 'updated@test.com',
            'phone': '3000000000',
            'address': 'Updated Address',
            'city': 'Updated City',
        }
        res = self.client.put(self.detail_url, data)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['name'], 'Updated Supplier')

    def test_partial_update_supplier_returns_200(self):
        self.client.force_authenticate(user=self.user)
        res = self.client.patch(self.detail_url, {'name': 'Patched Supplier'})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['name'], 'Patched Supplier')

    def test_soft_delete_returns_204(self):
        self.client.force_authenticate(user=self.user)
        res = self.client.delete(self.detail_url)
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.supplier.refresh_from_db()
        self.assertFalse(self.supplier.is_active)

    def test_deleted_supplier_not_listed(self):
        self.client.force_authenticate(user=self.user)
        self.client.delete(self.detail_url)
        res = self.client.get(self.list_url)
        self.assertEqual(len(res.data['results']), 0)

    def test_deleted_supplier_detail_returns_404(self):
        self.client.force_authenticate(user=self.user)
        self.client.delete(self.detail_url)
        res = self.client.get(self.detail_url)
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_filter_by_city(self):
        self.client.force_authenticate(user=self.user)
        Supplier.objects.create(
            name='Medellin Supplier',
            contact_name='Test',
            email='med@test.com',
            phone='3000000000',
            address='Addr',
            city='Medellín',
        )
        res = self.client.get(self.list_url, {'city': 'Medellín'})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data['results']), 1)

    def test_filter_by_country(self):
        self.client.force_authenticate(user=self.user)
        res = self.client.get(self.list_url, {'country': 'Colombia'})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data['results']), 1)

    def test_search_by_name(self):
        self.client.force_authenticate(user=self.user)
        Supplier.objects.create(
            name='Office Supplies',
            contact_name='Test',
            email='office@test.com',
            phone='3000000000',
            address='Addr',
            city='Cali',
        )
        res = self.client.get(self.list_url, {'search': 'Office'})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data['results']), 1)

    def test_search_by_contact_name(self):
        self.client.force_authenticate(user=self.user)
        res = self.client.get(self.list_url, {'search': 'Carlos'})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data['results']), 1)

    def test_search_by_email(self):
        self.client.force_authenticate(user=self.user)
        res = self.client.get(self.list_url, {'search': 'carlos@techsupplies'})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data['results']), 1)

    def test_search_by_tax_id(self):
        self.client.force_authenticate(user=self.user)
        Supplier.objects.create(
            name='Tax ID Supplier',
            contact_name='Test',
            email='taxid@test.com',
            phone='3000000000',
            address='Addr',
            city='City',
            tax_id='TAX-001',
        )
        res = self.client.get(self.list_url, {'search': 'TAX-001'})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data['results']), 1)

    def test_ordering_by_name_asc(self):
        self.client.force_authenticate(user=self.user)
        Supplier.objects.create(
            name='Alpha Supplies',
            contact_name='Test',
            email='alpha@test.com',
            phone='3000000000',
            address='Addr',
            city='City',
        )
        res = self.client.get(self.list_url, {'ordering': 'name'})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['results'][0]['name'], 'Alpha Supplies')

    def test_pagination_default_page_size(self):
        self.client.force_authenticate(user=self.user)
        Supplier.objects.all().delete()
        for i in range(25):
            Supplier.objects.create(
                name=f'Supplier {i}',
                contact_name=f'Contact {i}',
                email=f'supplier{i}@test.com',
                phone='3000000000',
                address=f'Addr {i}',
                city='City',
            )
        res = self.client.get(self.list_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data['results']), 20)

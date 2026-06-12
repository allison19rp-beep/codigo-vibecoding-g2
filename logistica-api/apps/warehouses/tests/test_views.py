from decimal import Decimal
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from apps.warehouses.models import Warehouse


class WarehouseViewSetTest(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_superuser(
            username='testuser',
            password='testpass123',
            email='test@test.com',
        )
        cls.warehouse = Warehouse.objects.create(
            name='Test Warehouse',
            address='Calle 123',
            city='Bogotá',
            capacity_m3=Decimal('1000.00'),
        )
        cls.list_url = reverse('warehouse-list')
        cls.detail_url = reverse('warehouse-detail', kwargs={'pk': cls.warehouse.pk})

    def setUp(self):
        self.client = APIClient()

    def test_list_unauthenticated_returns_401(self):
        res = self.client.get(self.list_url)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_unauthenticated_returns_401(self):
        data = {
            'name': 'Unauth WH',
            'address': 'Address',
            'city': 'City',
            'capacity_m3': '500.00',
        }
        res = self.client.post(self.list_url, data)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_detail_unauthenticated_returns_401(self):
        res = self.client.get(self.detail_url)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_update_unauthenticated_returns_401(self):
        data = {'name': 'Hacked Name'}
        res = self.client.put(self.detail_url, data)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_delete_unauthenticated_returns_401(self):
        res = self.client.delete(self.detail_url)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_authenticated_returns_200(self):
        self.client.force_authenticate(user=self.user)
        res = self.client.get(self.list_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data['results']), 1)

    def test_create_warehouse_returns_201(self):
        self.client.force_authenticate(user=self.user)
        data = {
            'name': 'New Warehouse',
            'address': 'Carrera 45',
            'city': 'Medellín',
            'capacity_m3': '2500.00',
        }
        res = self.client.post(self.list_url, data)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['name'], 'New Warehouse')
        self.assertEqual(res.data['city'], 'Medellín')

    def test_create_warehouse_without_required_fields_returns_400(self):
        self.client.force_authenticate(user=self.user)
        res = self.client.post(self.list_url, {}, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_retrieve_warehouse_returns_200(self):
        self.client.force_authenticate(user=self.user)
        res = self.client.get(self.detail_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['name'], 'Test Warehouse')

    def test_retrieve_nonexistent_returns_404(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('warehouse-detail', kwargs={'pk': 9999})
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_warehouse_returns_200(self):
        self.client.force_authenticate(user=self.user)
        data = {
            'name': 'Updated WH',
            'address': 'Updated Address',
            'city': 'Updated City',
            'capacity_m3': '999.99',
        }
        res = self.client.put(self.detail_url, data)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['name'], 'Updated WH')

    def test_partial_update_warehouse_returns_200(self):
        self.client.force_authenticate(user=self.user)
        res = self.client.patch(self.detail_url, {'name': 'Patched WH'})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['name'], 'Patched WH')

    def test_soft_delete_returns_204(self):
        self.client.force_authenticate(user=self.user)
        res = self.client.delete(self.detail_url)
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.warehouse.refresh_from_db()
        self.assertFalse(self.warehouse.is_active)

    def test_deleted_warehouse_not_listed(self):
        self.client.force_authenticate(user=self.user)
        self.client.delete(self.detail_url)
        res = self.client.get(self.list_url)
        self.assertEqual(len(res.data['results']), 0)

    def test_deleted_warehouse_detail_returns_404(self):
        self.client.force_authenticate(user=self.user)
        self.client.delete(self.detail_url)
        res = self.client.get(self.detail_url)
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_filter_by_city(self):
        self.client.force_authenticate(user=self.user)
        Warehouse.objects.create(
            name='Medellin WH',
            address='Address',
            city='Medellín',
            capacity_m3=Decimal('500.00'),
        )
        res = self.client.get(self.list_url, {'city': 'Medellín'})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data['results']), 1)

    def test_filter_by_country(self):
        self.client.force_authenticate(user=self.user)
        res = self.client.get(self.list_url, {'country': 'Colombia'})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data['results']), 1)

    def test_filter_capacity_m3_gte(self):
        self.client.force_authenticate(user=self.user)
        Warehouse.objects.create(
            name='Large WH',
            address='Address',
            city='Cali',
            capacity_m3=Decimal('2000.00'),
        )
        res = self.client.get(self.list_url, {'capacity_m3_gte': '1500'})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data['results']), 1)

    def test_filter_capacity_m3_lte(self):
        self.client.force_authenticate(user=self.user)
        res = self.client.get(self.list_url, {'capacity_m3_lte': '500'})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data['results']), 0)

    def test_search_by_name(self):
        self.client.force_authenticate(user=self.user)
        Warehouse.objects.create(
            name='Central Hub',
            address='Address',
            city='Bogotá',
            capacity_m3=Decimal('3000.00'),
        )
        res = self.client.get(self.list_url, {'search': 'Central'})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data['results']), 1)

    def test_search_by_city(self):
        self.client.force_authenticate(user=self.user)
        res = self.client.get(self.list_url, {'search': 'Bogotá'})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data['results']), 1)

    def test_ordering_by_name_asc(self):
        self.client.force_authenticate(user=self.user)
        Warehouse.objects.create(
            name='Alpha WH',
            address='Address',
            city='City',
            capacity_m3=Decimal('100.00'),
        )
        res = self.client.get(self.list_url, {'ordering': 'name'})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['results'][0]['name'], 'Alpha WH')

    def test_ordering_by_name_desc(self):
        self.client.force_authenticate(user=self.user)
        Warehouse.objects.create(
            name='Zeta WH',
            address='Address',
            city='City',
            capacity_m3=Decimal('100.00'),
        )
        res = self.client.get(self.list_url, {'ordering': '-name'})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['results'][0]['name'], 'Zeta WH')

    def test_pagination_default_page_size(self):
        self.client.force_authenticate(user=self.user)
        Warehouse.objects.all().delete()
        for i in range(25):
            Warehouse.objects.create(
                name=f'Warehouse {i}',
                address=f'Address {i}',
                city='City',
                capacity_m3=Decimal('100.00'),
            )
        res = self.client.get(self.list_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data['results']), 20)

    def test_read_only_fields_not_writable(self):
        self.client.force_authenticate(user=self.user)
        data = {
            'name': 'Test RO',
            'address': 'Address',
            'city': 'City',
            'capacity_m3': '100.00',
            'id': 999,
            'created_at': '2020-01-01T00:00:00Z',
        }
        res = self.client.post(self.list_url, data)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertNotEqual(res.data['id'], 999)

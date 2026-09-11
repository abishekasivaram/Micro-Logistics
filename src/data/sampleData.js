export const vendors = [
  { id: 'v1', name: 'Namma Chennai Grocers', address: '12 T. Nagar Main Rd, Chennai', lat: 13.0418, lng: 80.2341 },
  { id: 'v2', name: 'Sri Lakshmi Organics', address: '45 Adyar Bridge Rd, Chennai', lat: 13.0012, lng: 80.2565 },
  { id: 'v3', name: 'Kovai Fresh Mart', address: '88 Velachery Bypass Rd, Chennai', lat: 12.9815, lng: 80.2180 },
];

export const customers = [
  { id: 'c1', name: 'Priya Rajan', phone: '9876543210', address: '101 Anna Nagar East, Chennai', lat: 13.0850, lng: 80.2101 },
  { id: 'c2', name: 'Ramesh Kumar', phone: '9876543211', address: '202 Besant Nagar, Chennai', lat: 13.0003, lng: 80.2739 },
  { id: 'c3', name: 'Anita Sharma', phone: '9876543212', address: '303 Mylapore, Chennai', lat: 13.0368, lng: 80.2676 },
  { id: 'c4', name: 'Karthik Sivaram', phone: '9876543213', address: '404 OMR Phase 1, Chennai', lat: 12.9716, lng: 80.2536 },
];

export const deliveryPersonnel = [
  { id: 'dp1', name: 'Muthu Vel', phone: '9988776655', status: 'Available', lat: 13.0400, lng: 80.2300 },
  { id: 'dp2', name: 'Suresh Babu', phone: '9988776656', status: 'On Delivery', lat: 13.0050, lng: 80.2600 },
  { id: 'dp3', name: 'Vijay Anand', phone: '9988776657', status: 'Available', lat: 12.9800, lng: 80.2200 },
];

export const products = [
  { id: 'p1', name: 'Aavin Green Milk 500ml', category: 'Dairy', price: 22.0, stock: 150, vendorId: 'v1', status: 'In Stock' },
  { id: 'p2', name: 'Modern Bread (White)', category: 'Bakery', price: 40.0, stock: 25, vendorId: 'v1', status: 'In Stock' },
  { id: 'p3', name: 'India Gate Basmati Rice 5kg', category: 'Grains', price: 650.0, stock: 10, vendorId: 'v2', status: 'Low Stock' },
  { id: 'p4', name: 'Haldiram Bhujia 400g', category: 'Snacks', price: 95.0, stock: 0, vendorId: 'v2', status: 'Out of Stock' },
  { id: 'p5', name: 'Farm Fresh Tomatoes 1kg', category: 'Vegetables', price: 35.0, stock: 50, vendorId: 'v3', status: 'In Stock' },
  { id: 'p6', name: 'Urad Dal (Premium) 1kg', category: 'Grains', price: 140.0, stock: 40, vendorId: 'v3', status: 'In Stock' },
  { id: 'p7', name: 'Nandini Ghee 200ml', category: 'Dairy', price: 125.0, stock: 5, vendorId: 'v1', status: 'Low Stock' },
];

export const orders = [
  {
    id: 'ORD-1021',
    customerId: 'c1',
    vendorId: 'v1',
    items: [
      { productId: 'p1', name: 'Aavin Green Milk 500ml', qty: 2, price: 22.00 },
      { productId: 'p2', name: 'Modern Bread (White)', qty: 1, price: 40.00 }
    ],
    total: 84.00,
    status: 'PREPARING',
    date: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    deliveryGroupId: null
  },
  {
    id: 'ORD-1022',
    customerId: 'c2',
    vendorId: 'v3',
    items: [
      { productId: 'p5', name: 'Farm Fresh Tomatoes 1kg', qty: 2, price: 35.00 },
    ],
    total: 70.00,
    status: 'PLACED',
    date: new Date(Date.now() - 1800000).toISOString(), // 30 mins ago
    deliveryGroupId: null
  },
  {
    id: 'ORD-1025',
    customerId: 'c3',
    vendorId: 'v2',
    items: [
      { productId: 'p3', name: 'India Gate Basmati Rice 5kg', qty: 1, price: 650.00 },
    ],
    total: 650.00,
    status: 'READY_FOR_DELIVERY',
    date: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    deliveryGroupId: null
  },
  {
    id: 'ORD-1032',
    customerId: 'c1',
    vendorId: 'v2',
    items: [
      { productId: 'p4', name: 'Haldiram Bhujia 400g', qty: 3, price: 95.00 }
    ],
    total: 285.00,
    status: 'DELIVERED',
    date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    deliveryGroupId: 'DG-1001'
  }
];

export const deliveryGroups = [
  { 
    id: 'DG-1001', 
    orderIds: ['ORD-1032'], 
    personnelId: 'dp1', 
    status: 'DELIVERED',
    date: new Date(Date.now() - 86400000).toISOString()
  }
];

export const initialNotifications = [
  { id: 1, message: 'Welcome to Micro-Logistics Network!', type: 'system', isRead: false, date: new Date().toISOString() },
  { id: 2, message: 'ORD-1032 has been successfully delivered.', type: 'delivery', isRead: true, date: new Date(Date.now() - 86000000).toISOString() },
  { id: 3, message: 'Low stock alert: Nandini Ghee 200ml (Vendor: Namma Chennai Grocers)', type: 'inventory', isRead: false, date: new Date(Date.now() - 3600000).toISOString() }
];

export const mockUsers = [
  { id: 'u1', name: 'Demo Customer', role: 'customer' },
  { id: 'u2', name: 'Demo Vendor', role: 'vendor' },
  { id: 'u3', name: 'Demo Admin', role: 'admin' }
];

export const deliverySlots = [
  '7:00 AM – 11:00 AM',
  '9:00 AM – 1:00 PM',
  '12:00 PM – 4:00 PM',
  '3:00 PM – 7:00 PM',
  '6:00 PM – 10:00 PM'
];

export const vendors = [
  { 
    id: 'v1', 
    name: 'Namma Chennai Grocers', 
    ownerName: 'Subramaniam V.',
    email: 'contact@nammachennai.com',
    phone: '9840123456',
    category: 'Local Grocery Store',
    rating: 4.8,
    prepTime: '15-25 mins',
    isOpen: true,
    operatingHours: '7:00 AM - 9:00 PM',
    address: '12 T. Nagar Main Rd, Chennai', 
    area: 'T. Nagar',
    lat: 13.0418, 
    lng: 80.2341,
    logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&auto=format&fit=crop&q=80',
    description: 'Fresh daily essentials, rice, pulses, traditional masalas, and household goods delivered straight from T. Nagar.'
  },
  { 
    id: 'v2', 
    name: 'Sri Lakshmi Organics', 
    ownerName: 'Lakshmi Narayanan',
    email: 'sales@lakshmiorganics.in',
    phone: '9840987654',
    category: 'Fresh Fruits & Vegetables',
    rating: 4.7,
    prepTime: '10-20 mins',
    isOpen: true,
    operatingHours: '6:30 AM - 8:30 PM',
    address: '45 Adyar Bridge Rd, Chennai', 
    area: 'Adyar',
    lat: 13.0012, 
    lng: 80.2565,
    logo: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=150&auto=format&fit=crop&q=80',
    description: 'Certified organic vegetables, cold-pressed oils, farm-fresh fruits and heritage rice varieties.'
  },
  { 
    id: 'v3', 
    name: 'Kovai Fresh Mart', 
    ownerName: 'Karthikeyan P.',
    email: 'info@kovaifresh.com',
    phone: '9790112233',
    category: 'Fresh Fruits & Vegetables',
    rating: 4.6,
    prepTime: '20-30 mins',
    isOpen: true,
    operatingHours: '7:00 AM - 9:30 PM',
    address: '88 Velachery Bypass Rd, Chennai', 
    area: 'Velachery',
    lat: 12.9815, 
    lng: 80.2180,
    logo: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=150&auto=format&fit=crop&q=80',
    description: 'Farm-picked greens, exotic veggies, seasonal fruits, and fresh coconut water.'
  },
  {
    id: 'v4',
    name: 'Royal Bakery & Sweets',
    ownerName: 'Jahangir Ahmed',
    email: 'royalbakery@gmail.com',
    phone: '9841223344',
    category: 'Bakery',
    rating: 4.9,
    prepTime: '15-30 mins',
    isOpen: true,
    operatingHours: '8:00 AM - 10:00 PM',
    address: '15 Mylapore High Rd, Chennai',
    area: 'Mylapore',
    lat: 13.0368,
    lng: 80.2676,
    logo: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=150&auto=format&fit=crop&q=80',
    description: 'Artisanal breads, puffs, fresh cakes, traditional tea cakes, and South Indian savories.'
  },
  {
    id: 'v5',
    name: 'Apex Care Pharmacy',
    ownerName: 'Dr. R. Sundaram',
    email: 'care@apexpharmacy.in',
    phone: '9840556677',
    category: 'Pharmacy',
    rating: 4.9,
    prepTime: '10-15 mins',
    isOpen: true,
    operatingHours: '24 Hours',
    address: '102 Anna Salai, Chennai',
    area: 'Anna Nagar',
    lat: 13.0850,
    lng: 80.2101,
    logo: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=150&auto=format&fit=crop&q=80',
    description: 'Essential wellness items, vitamins, first aid kits, healthcare devices, and baby care products.'
  },
  {
    id: 'v6',
    name: 'City Tech & Electronics',
    ownerName: 'Anand Kumar',
    email: 'support@citytechelectronics.com',
    phone: '9840889900',
    category: 'Electronics Store',
    rating: 4.5,
    prepTime: '30-45 mins',
    isOpen: true,
    operatingHours: '10:00 AM - 9:00 PM',
    address: '55 Ritchie St, Chennai',
    area: 'Triplicane',
    lat: 13.0674,
    lng: 80.2785,
    logo: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=150&auto=format&fit=crop&q=80',
    description: 'Mobile accessories, power banks, cables, PC peripherals, smart wearables, and chargers.'
  }
];

export const customers = [
  { 
    id: 'c1', 
    name: 'Priya Rajan', 
    username: 'priyarajan',
    email: 'priya@example.com',
    phone: '9876543210', 
    address: '101 Anna Nagar East, Chennai', 
    area: 'Anna Nagar',
    lat: 13.0850, 
    lng: 80.2101,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
  },
  { 
    id: 'c2', 
    name: 'Ramesh Kumar', 
    username: 'rameshk',
    email: 'ramesh@example.com',
    phone: '9876543211', 
    address: '202 Besant Nagar, Chennai', 
    area: 'Besant Nagar',
    lat: 13.0003, 
    lng: 80.2739,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  { 
    id: 'c3', 
    name: 'Anita Sharma', 
    username: 'anitasharma',
    email: 'anita@example.com',
    phone: '9876543212', 
    address: '303 Mylapore, Chennai', 
    area: 'Mylapore',
    lat: 13.0368, 
    lng: 80.2676,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  { 
    id: 'c4', 
    name: 'Karthik Sivaram', 
    username: 'karthiks',
    email: 'karthik@example.com',
    phone: '9876543213', 
    address: '404 OMR Phase 1, Chennai', 
    area: 'OMR',
    lat: 12.9716, 
    lng: 80.2536,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  }
];

export const deliveryPersonnel = [
  { id: 'dp1', name: 'Muthu Vel', phone: '9988776655', status: 'Available', vehicle: 'TVS XL 100', lat: 13.0400, lng: 80.2300 },
  { id: 'dp2', name: 'Suresh Babu', phone: '9988776656', status: 'On Delivery', vehicle: 'Hero Electric Scooter', lat: 13.0050, lng: 80.2600 },
  { id: 'dp3', name: 'Vijay Anand', phone: '9988776657', status: 'Available', vehicle: 'Ather 450X', lat: 12.9800, lng: 80.2200 }
];

export const products = [
  { 
    id: 'p1', 
    name: 'Aavin Green Milk 500ml', 
    category: 'Dairy', 
    price: 22.0, 
    stock: 150, 
    vendorId: 'v1', 
    vendorName: 'Namma Chennai Grocers',
    prepTime: '5 mins',
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300&auto=format&fit=crop&q=80',
    description: 'Pasteurized standardized milk, rich in calcium and essential vitamins.'
  },
  { 
    id: 'p2', 
    name: 'Modern White Bread 400g', 
    category: 'Bakery', 
    price: 40.0, 
    stock: 25, 
    vendorId: 'v1', 
    vendorName: 'Namma Chennai Grocers',
    prepTime: '5 mins',
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&auto=format&fit=crop&q=80',
    description: 'Soft and freshly baked white sliced bread.'
  },
  { 
    id: 'p3', 
    name: 'India Gate Basmati Rice 5kg', 
    category: 'Grains', 
    price: 650.0, 
    stock: 10, 
    vendorId: 'v2', 
    vendorName: 'Sri Lakshmi Organics',
    prepTime: '10 mins',
    status: 'Low Stock',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&auto=format&fit=crop&q=80',
    description: 'Long grain aromatic basmati rice aged to perfection.'
  },
  { 
    id: 'p4', 
    name: 'Cold-Pressed Groundnut Oil 1L', 
    category: 'Oil & Ghee', 
    price: 240.0, 
    stock: 30, 
    vendorId: 'v2', 
    vendorName: 'Sri Lakshmi Organics',
    prepTime: '10 mins',
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&auto=format&fit=crop&q=80',
    description: 'Traditional wood-pressed organic unrefined groundnut oil.'
  },
  { 
    id: 'p5', 
    name: 'Farm Fresh Country Tomatoes 1kg', 
    category: 'Vegetables', 
    price: 35.0, 
    stock: 50, 
    vendorId: 'v3', 
    vendorName: 'Kovai Fresh Mart',
    prepTime: '15 mins',
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300&auto=format&fit=crop&q=80',
    description: 'Juicy, naturally grown country tomatoes sourced directly from local farmers.'
  },
  { 
    id: 'p6', 
    name: 'Organic Red Onions 1kg', 
    category: 'Vegetables', 
    price: 45.0, 
    stock: 40, 
    vendorId: 'v3', 
    vendorName: 'Kovai Fresh Mart',
    prepTime: '15 mins',
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8ce?w=300&auto=format&fit=crop&q=80',
    description: 'Crisp and pungent organic red onions.'
  },
  { 
    id: 'p7', 
    name: 'Fresh Butter Croissant (Pack of 2)', 
    category: 'Bakery', 
    price: 90.0, 
    stock: 15, 
    vendorId: 'v4', 
    vendorName: 'Royal Bakery & Sweets',
    prepTime: '20 mins',
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=300&auto=format&fit=crop&q=80',
    description: 'Flaky, buttery French style oven-fresh croissants.'
  },
  { 
    id: 'p8', 
    name: 'Multivitamin Tablets (60 Count)', 
    category: 'Pharmacy', 
    price: 350.0, 
    stock: 20, 
    vendorId: 'v5', 
    vendorName: 'Apex Care Pharmacy',
    prepTime: '10 mins',
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80',
    description: 'Daily essential immunity boost multivitamin tablets.'
  },
  { 
    id: 'p9', 
    name: 'Fast-Charging Power Bank 20000mAh', 
    category: 'Electronics', 
    price: 1499.0, 
    stock: 8, 
    vendorId: 'v6', 
    vendorName: 'City Tech & Electronics',
    prepTime: '20 mins',
    status: 'Low Stock',
    image: 'https://images.unsplash.com/photo-1609592424074-0f2c41793740?w=300&auto=format&fit=crop&q=80',
    description: 'Dual USB output high-capacity fast charging power bank.'
  }
];

export const orders = [
  {
    id: 'ORD-1021',
    orderId: 'ORD-1021',
    customerId: 'c1',
    customerName: 'Priya Rajan',
    vendorId: 'v1',
    vendorName: 'Namma Chennai Grocers',
    items: [
      { productId: 'p1', name: 'Aavin Green Milk 500ml', qty: 2, price: 22.00 },
      { productId: 'p2', name: 'Modern White Bread 400g', qty: 1, price: 40.00 }
    ],
    total: 84.00,
    orderStatus: 'PREPARING',
    status: 'PREPARING',
    deliveryStatus: 'Waiting for Aggregation',
    aggregationStatus: 'Waiting for Aggregation',
    pickupLocation: '12 T. Nagar Main Rd, Chennai',
    deliveryLocation: '101 Anna Nagar East, Chennai',
    deliveryDate: '2026-09-12',
    deliveryTimeSlot: '9:00 AM – 1:00 PM',
    date: new Date(Date.now() - 3600000).toISOString(),
    deliveryGroupId: null,
    groupedWith: [],
    assignedAgent: null
  },
  {
    id: 'ORD-1022',
    orderId: 'ORD-1022',
    customerId: 'c2',
    customerName: 'Ramesh Kumar',
    vendorId: 'v3',
    vendorName: 'Kovai Fresh Mart',
    items: [
      { productId: 'p5', name: 'Farm Fresh Country Tomatoes 1kg', qty: 2, price: 35.00 },
      { productId: 'p6', name: 'Organic Red Onions 1kg', qty: 1, price: 45.00 }
    ],
    total: 115.00,
    orderStatus: 'PLACED',
    status: 'PLACED',
    deliveryStatus: 'Pending Vendor Confirmation',
    aggregationStatus: 'Unassigned',
    pickupLocation: '88 Velachery Bypass Rd, Chennai',
    deliveryLocation: '202 Besant Nagar, Chennai',
    deliveryDate: '2026-09-12',
    deliveryTimeSlot: '12:00 PM – 4:00 PM',
    date: new Date(Date.now() - 1800000).toISOString(),
    deliveryGroupId: null,
    groupedWith: [],
    assignedAgent: null
  },
  {
    id: 'ORD-1025',
    orderId: 'ORD-1025',
    customerId: 'c3',
    customerName: 'Anita Sharma',
    vendorId: 'v2',
    vendorName: 'Sri Lakshmi Organics',
    items: [
      { productId: 'p3', name: 'India Gate Basmati Rice 5kg', qty: 1, price: 650.00 },
      { productId: 'p4', name: 'Cold-Pressed Groundnut Oil 1L', qty: 1, price: 240.00 }
    ],
    total: 890.00,
    orderStatus: 'READY_FOR_DELIVERY',
    status: 'READY_FOR_DELIVERY',
    deliveryStatus: 'Grouped',
    aggregationStatus: 'Grouped',
    pickupLocation: '45 Adyar Bridge Rd, Chennai',
    deliveryLocation: '303 Mylapore, Chennai',
    deliveryDate: '2026-09-12',
    deliveryTimeSlot: '9:00 AM – 1:00 PM',
    date: new Date(Date.now() - 7200000).toISOString(),
    deliveryGroupId: 'DG-1002',
    groupedWith: ['ORD-1026', 'ORD-1031'],
    assignedAgent: 'Muthu Vel (DA014)'
  },
  {
    id: 'ORD-1032',
    orderId: 'ORD-1032',
    customerId: 'c1',
    customerName: 'Priya Rajan',
    vendorId: 'v4',
    vendorName: 'Royal Bakery & Sweets',
    items: [
      { productId: 'p7', name: 'Fresh Butter Croissant (Pack of 2)', qty: 2, price: 90.00 }
    ],
    total: 180.00,
    orderStatus: 'DELIVERED',
    status: 'DELIVERED',
    deliveryStatus: 'Delivered',
    aggregationStatus: 'Delivered',
    pickupLocation: '15 Mylapore High Rd, Chennai',
    deliveryLocation: '101 Anna Nagar East, Chennai',
    deliveryDate: '2026-09-11',
    deliveryTimeSlot: '3:00 PM – 7:00 PM',
    date: new Date(Date.now() - 86400000).toISOString(),
    deliveryGroupId: 'DG-1001',
    groupedWith: [],
    assignedAgent: 'Muthu Vel (DA014)'
  }
];

export const deliveryGroups = [
  { 
    id: 'DG-1001', 
    orderIds: ['ORD-1032'], 
    personnelId: 'dp1', 
    status: 'DELIVERED',
    date: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'DG-1002',
    orderIds: ['ORD-1025', 'ORD-1026', 'ORD-1031'],
    personnelId: 'dp1',
    status: 'READY',
    date: new Date(Date.now() - 3600000).toISOString()
  }
];

export const initialNotifications = [
  { id: 1, message: 'Welcome to Smart Micro-Logistics Management Network!', type: 'system', isRead: false, date: new Date().toISOString() },
  { id: 2, message: 'ORD-1032 has been successfully delivered by Muthu Vel.', type: 'delivery', isRead: true, date: new Date(Date.now() - 86000000).toISOString() },
  { id: 3, message: 'Order ORD-1025 is marked Ready for Delivery in Adyar region.', type: 'order', isRead: false, date: new Date(Date.now() - 3600000).toISOString() },
  { id: 4, message: 'Low stock alert: India Gate Basmati Rice 5kg (Sri Lakshmi Organics)', type: 'inventory', isRead: false, date: new Date(Date.now() - 1800000).toISOString() }
];

export const mockUsers = [
  { id: 'c1', name: 'Priya Rajan', username: 'priyarajan', email: 'priya@example.com', role: 'customer', phone: '9876543210', address: '101 Anna Nagar East, Chennai' },
  { id: 'v1', name: 'Namma Chennai Grocers', username: 'nammachennai', email: 'contact@nammachennai.com', role: 'vendor', phone: '9840123456', address: '12 T. Nagar Main Rd, Chennai' },
  { id: 'u3', name: 'System Admin', username: 'admin', email: 'admin@micrologi.com', role: 'admin', phone: '9000000000' }
];


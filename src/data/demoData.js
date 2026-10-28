// Isolated Mock Data for Quick Demo Personas
// This data is strictly used when currentUser.isDemo === true
// It never mutates or connects to the live Supabase production database.

export const demoVendors = [
  {
    id: 'demo-vend',
    legacy_id: 'v1',
    uuid: 'demo-vend',
    name: 'Namma Chennai Naturals',
    shopName: 'Namma Chennai Naturals',
    ownerName: 'Contact',
    email: 'contact_auth@nammachennai.com',
    phone: '9840123456',
    category: 'GROCERIES',
    rating: 4.8,
    prepTime: '15-25 mins',
    isOpen: true,
    status: 'Active',
    operatingHours: '7:00 AM - 9:00 PM',
    address: '22 Velachery Main Rd, Chennai',
    area: 'Velachery',
    joinDate: '2025-11-10',
    lat: 12.98,
    lng: 80.22,
    logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&auto=format&fit=crop&q=80',
    description: 'Fresh daily essentials, premium rice, cooking essentials, and household goods.'
  },
  {
    id: 'demo-vend2',
    legacy_id: 'v2',
    uuid: 'demo-vend2',
    name: 'Fresh Dairy & Bakes',
    shopName: 'Fresh Dairy & Bakes',
    ownerName: 'Vendor Two',
    email: 'v2@example.com',
    phone: '9840987654',
    category: 'Dairy',
    rating: 4.9,
    prepTime: '10-20 mins',
    isOpen: true,
    status: 'Active',
    operatingHours: '6:30 AM - 9:30 PM',
    address: '12 Cathedral Road, Chennai',
    area: 'Gopalapuram',
    joinDate: '2025-12-05',
    lat: 13.045,
    lng: 80.252,
    logo: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=150&auto=format&fit=crop&q=80',
    description: 'Fresh farm milk, curd, malai paneer, and oven-fresh artisan breads.'
  },
  {
    id: 'demo-vend3',
    legacy_id: 'v3',
    uuid: 'demo-vend3',
    name: 'Organic Farm Harvest',
    shopName: 'Organic Farm Harvest',
    ownerName: 'Vendor Three',
    email: 'v3@example.com',
    phone: '9840555666',
    category: 'Fruits & Veg',
    rating: 4.8,
    prepTime: '10-15 mins',
    isOpen: true,
    status: 'Active',
    operatingHours: '6:00 AM - 8:00 PM',
    address: '54 Anna Salai, Chennai',
    area: 'Guindy',
    joinDate: '2026-01-10',
    lat: 13.010,
    lng: 80.215,
    logo: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=150&auto=format&fit=crop&q=80',
    description: 'Farm-fresh local vegetables, juicy tomatoes, and crisp organic Shimla apples.'
  },
  {
    id: 'demo-vend4',
    legacy_id: 'v4',
    uuid: 'demo-vend4',
    name: 'Chennai Daily Essentials',
    shopName: 'Chennai Daily Essentials',
    ownerName: 'Vendor Four',
    email: 'v4@example.com',
    phone: '9840777888',
    category: 'Grocery',
    rating: 4.7,
    prepTime: '15-20 mins',
    isOpen: true,
    status: 'Active',
    operatingHours: '7:30 AM - 9:30 PM',
    address: '77 Velachery Main Rd, Chennai',
    area: 'Velachery',
    joinDate: '2026-02-15',
    lat: 12.975,
    lng: 80.225,
    logo: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=150&auto=format&fit=crop&q=80',
    description: 'Whole wheat chakki atta, premium cooking sunflower oil, and everyday kitchen staples.'
  }
];

export const demoProducts = [
  // 1. Fresh Dairy & Bakes (Dairy & Bakery)
  {
    id: 'demo-p1',
    uuid: '55555555-5555-5555-5555-555555555551',
    legacy_id: 'p1',
    vendorId: 'demo-vend2',
    vendorName: 'Fresh Dairy & Bakes',
    name: 'Aavin Green Milk 500ml',
    category: 'Dairy',
    price: 22.0,
    stock: 145,
    prepTime: '5 mins',
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80',
    description: 'Fresh pasteurized toned milk 500ml packet. Daily cold-chain delivery.'
  },
  {
    id: 'demo-p2',
    uuid: '55555555-5555-5555-5555-555555555553',
    legacy_id: 'p3',
    vendorId: 'demo-vend2',
    vendorName: 'Fresh Dairy & Bakes',
    name: 'Amul Fresh Malai Paneer 200g',
    category: 'Dairy',
    price: 85.0,
    stock: 45,
    prepTime: '5 mins',
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=80',
    description: 'Fresh and soft malai paneer cubes, rich in protein and pure dairy goodness.'
  },
  {
    id: 'demo-p3',
    uuid: '55555555-5555-5555-5555-555555555552',
    legacy_id: 'p2',
    vendorId: 'demo-vend2',
    vendorName: 'Fresh Dairy & Bakes',
    name: 'Modern White Bread 400g',
    category: 'Bakery',
    price: 40.0,
    stock: 25,
    prepTime: '5 mins',
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80',
    description: 'Freshly baked soft white sliced bread loaf for daily morning breakfast.'
  },

  // 2. Namma Chennai Naturals (Groceries)
  {
    id: 'demo-p4',
    uuid: '55555555-5555-5555-5555-555555555554',
    legacy_id: 'p4',
    vendorId: 'demo-vend',
    vendorName: 'Namma Chennai Naturals',
    name: 'India Gate Basmati Rice 1kg',
    category: 'Grocery',
    price: 135.0,
    stock: 60,
    prepTime: '10 mins',
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80',
    description: 'Aged long-grain aromatic basmati rice for delicious biryani and everyday meals.'
  },
  {
    id: 'demo-p5',
    uuid: '55555555-5555-5555-5555-555555555555',
    legacy_id: 'p5',
    vendorId: 'demo-vend',
    vendorName: 'Namma Chennai Naturals',
    name: 'Tata Salt Vacuum Evaporated 1kg',
    category: 'Grocery',
    price: 28.0,
    stock: 120,
    prepTime: '5 mins',
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1518110903495-cd99c12921c5?w=500&auto=format&fit=crop&q=80',
    description: 'Iodized cooking salt vacuum evaporated with guaranteed purity.'
  },

  // 3. Organic Farm Harvest (Fruits & Veg)
  {
    id: 'demo-p6',
    uuid: '55555555-5555-5555-5555-555555555557',
    legacy_id: 'p7',
    vendorId: 'demo-vend3',
    vendorName: 'Organic Farm Harvest',
    name: 'Farm Fresh Red Tomatoes 1kg',
    category: 'Fruits & Veg',
    price: 38.0,
    stock: 80,
    prepTime: '5 mins',
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=80',
    description: 'Ripe, juicy country tomatoes harvested fresh from organic local farms.'
  },
  {
    id: 'demo-p7',
    uuid: '55555555-5555-5555-5555-555555555558',
    legacy_id: 'p8',
    vendorId: 'demo-vend3',
    vendorName: 'Organic Farm Harvest',
    name: 'Fresh Shimla Apples (4 pcs / 500g)',
    category: 'Fruits & Veg',
    price: 120.0,
    stock: 50,
    prepTime: '5 mins',
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=80',
    description: 'Sweet and crunchy hand-picked Shimla red apples packed with natural antioxidants.'
  },

  // 4. Chennai Daily Essentials (Grocery)
  {
    id: 'demo-p8',
    uuid: '55555555-5555-5555-5555-555555555559',
    legacy_id: 'p9',
    vendorId: 'demo-vend4',
    vendorName: 'Chennai Daily Essentials',
    name: 'Aashirvaad Shudh Chakki Atta 1kg',
    category: 'Grocery',
    price: 55.0,
    stock: 70,
    prepTime: '5 mins',
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop&q=80',
    description: '100% whole wheat chakki ground flour for fluffy, super-soft rotis.'
  },
  {
    id: 'demo-p9',
    uuid: '55555555-5555-5555-5555-555555555560',
    legacy_id: 'p10',
    vendorId: 'demo-vend4',
    vendorName: 'Chennai Daily Essentials',
    name: 'Fortune Sunlite Sunflower Oil 1L',
    category: 'Grocery',
    price: 145.0,
    stock: 40,
    prepTime: '5 mins',
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=80',
    description: 'Light, healthy refined sunflower cooking oil fortified with Vitamins A & D.'
  }
];

export const demoCustomers = [
  {
    id: 'demo-cust',
    legacy_id: 'c1',
    name: 'Priya Rajan',
    username: 'c1',
    email: 'priya_auth@example.com',
    phone: '9876543210',
    address: '101, 2nd Avenue, Anna Nagar East, Chennai - 600102',
    area: 'Anna Nagar East',
    status: 'Active',
    totalOrders: 6,
    activeOrders: 1
  },
  {
    id: 'demo-cust2',
    legacy_id: 'c2',
    name: 'Ramesh Kumar',
    username: 'c2',
    email: 'c2@example.com',
    phone: '9876543202',
    address: '15 Gandhi Road, Mylapore, Chennai - 600004',
    area: 'Mylapore',
    status: 'Active',
    totalOrders: 3,
    activeOrders: 1
  },
  {
    id: 'demo-cust3',
    legacy_id: 'c3',
    name: 'Ananya Sharma',
    username: 'c3',
    email: 'c3@example.com',
    phone: '9876543203',
    address: '42 Besant Avenue, Adyar, Chennai - 600020',
    area: 'Adyar',
    status: 'Active',
    totalOrders: 5,
    activeOrders: 1
  },
  {
    id: 'demo-cust4',
    legacy_id: 'c4',
    name: 'Karthik V',
    username: 'c4',
    email: 'c4@example.com',
    phone: '9876543204',
    address: '88 OMR IT Highway, Thoraipakkam, Chennai - 600097',
    area: 'Thoraipakkam',
    status: 'Active',
    totalOrders: 4,
    activeOrders: 0
  },
  {
    id: 'demo-cust5',
    legacy_id: 'c5',
    name: 'Arun Kumar',
    username: 'arun_kumar',
    email: 'arun@example.com',
    phone: '9840456789',
    address: '27 Panagal Park, T. Nagar, Chennai - 600017',
    area: 'T. Nagar',
    status: 'Active',
    totalOrders: 7,
    activeOrders: 0
  },
  {
    id: 'demo-cust6',
    legacy_id: 'c6',
    name: 'Meera Krishnan',
    username: 'meera_k',
    email: 'meera@example.com',
    phone: '9840567890',
    address: '53 100 Feet Bypass Road, Velachery, Chennai - 600042',
    area: 'Velachery',
    status: 'Active',
    totalOrders: 2,
    activeOrders: 1
  }
];

export const demoAgents = [
  {
    id: 'demo-dp',
    legacy_id: 'da1',
    agentCode: 'DA-4091',
    name: 'David Anand',
    username: 'demo_dp',
    email: 'demo@delivery.local',
    phone: '9840123456',
    currentArea: 'T. Nagar & Central Chennai',
    availability: 'Available',
    status: 'Available',
    vehicle: 'Electric Cargo Scooter',
    rating: 4.9,
    capacity: 5,
    currentOrders: 2
  },
  {
    id: 'demo-dp2',
    legacy_id: 'da2',
    agentCode: 'DA-4092',
    name: 'Karthik Raja',
    username: 'karthik_raja',
    email: 'karthik@delivery.local',
    phone: '9988776655',
    currentArea: 'Anna Nagar West',
    availability: 'Available',
    status: 'Available',
    vehicle: 'TVS XL 100',
    rating: 4.8,
    capacity: 5,
    currentOrders: 1
  }
];

export const demoOrders = [
  {
    id: 'ORD-1001',
    uuid: 'demo-ord-1',
    orderId: 'ORD-1001',
    orderCode: 'ORD-1001',
    customerId: 'demo-cust',
    customerName: 'Priya Rajan',
    customerPhone: '9876543210',
    vendorId: 'demo-vend',
    vendorName: 'Namma Fresh Mart',
    pickupLocation: '12 T. Nagar Main Rd, Chennai',
    deliveryLocation: '101, 2nd Avenue, Anna Nagar East, Chennai - 600102',
    deliveryAddress: '101, 2nd Avenue, Anna Nagar East, Chennai - 600102',
    deliveryDate: new Date().toISOString().split('T')[0],
    deliveryTimeSlot: '9:00 AM – 1:00 PM',
    status: 'PLACED',
    orderStatus: 'PLACED',
    aggregationStatus: 'Waiting for Aggregation',
    deliveryStatus: 'Pending Assignment',
    total: 89.0,
    items: [
      { productId: 'demo-p1', name: 'Aavin Green Milk 500ml', qty: 2, price: 22.0 },
      { productId: 'demo-p2', name: 'Modern Whole Wheat Bread 400g', qty: 1, price: 45.0 }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'ORD-1002',
    uuid: 'demo-ord-2',
    orderId: 'ORD-1002',
    orderCode: 'ORD-1002',
    customerId: 'demo-cust2',
    customerName: 'Sivakumar R',
    customerPhone: '9840123456',
    vendorId: 'demo-vend',
    vendorName: 'Namma Fresh Mart',
    pickupLocation: '12 T. Nagar Main Rd, Chennai',
    deliveryLocation: '14/2, 4th Cross St, Mandaveli, Chennai - 600028',
    deliveryAddress: '14/2, 4th Cross St, Mandaveli, Chennai - 600028',
    deliveryDate: new Date().toISOString().split('T')[0],
    deliveryTimeSlot: '9:00 AM – 1:00 PM',
    status: 'READY_FOR_DELIVERY',
    orderStatus: 'READY_FOR_DELIVERY',
    aggregationStatus: 'Batch Created',
    deliveryStatus: 'Pending Assignment',
    batchId: 'B-8041',
    total: 320.0,
    items: [
      { productId: 'demo-p3', name: 'Ponni Boiled Rice 5kg', qty: 1, price: 320.0 }
    ],
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'ORD-1003',
    uuid: 'demo-ord-3',
    orderId: 'ORD-1003',
    orderCode: 'ORD-1003',
    customerId: 'demo-cust3',
    customerName: 'Kavitha Mohan',
    customerPhone: '9840234567',
    vendorId: 'demo-vend',
    vendorName: 'Namma Fresh Mart',
    pickupLocation: '12 T. Nagar Main Rd, Chennai',
    deliveryLocation: '42/1 Besant Avenue, Adyar, Chennai - 600020',
    deliveryAddress: '42/1 Besant Avenue, Adyar, Chennai - 600020',
    deliveryDate: new Date().toISOString().split('T')[0],
    deliveryTimeSlot: '12:00 PM – 4:00 PM',
    status: 'OUT_FOR_DELIVERY',
    orderStatus: 'OUT_FOR_DELIVERY',
    aggregationStatus: 'Assigned',
    deliveryStatus: 'Out for Delivery',
    assignedAgent: 'David Anand',
    assignedAgentId: 'demo-dp',
    batchId: 'B-8041',
    total: 180.0,
    items: [
      { productId: 'demo-p5', name: 'Cold Pressed Sesame Oil 500ml', qty: 1, price: 180.0 }
    ],
    createdAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'ORD-1004',
    uuid: 'demo-ord-4',
    orderId: 'ORD-1004',
    orderCode: 'ORD-1004',
    customerId: 'demo-cust4',
    customerName: 'Deepak Soundar',
    customerPhone: '9840345678',
    vendorId: 'demo-vend',
    vendorName: 'Namma Fresh Mart',
    pickupLocation: '12 T. Nagar Main Rd, Chennai',
    deliveryLocation: '88 Rajiv Gandhi Salai (OMR), Thoraipakkam, Chennai - 600097',
    deliveryAddress: '88 Rajiv Gandhi Salai (OMR), Thoraipakkam, Chennai - 600097',
    deliveryDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    deliveryTimeSlot: '9:00 AM – 1:00 PM',
    status: 'DELIVERED',
    orderStatus: 'DELIVERED',
    aggregationStatus: 'Delivered',
    deliveryStatus: 'Delivered to Customer',
    assignedAgent: 'David Anand',
    assignedAgentId: 'demo-dp',
    total: 134.0,
    items: [
      { productId: 'demo-p1', name: 'Aavin Green Milk 500ml', qty: 2, price: 22.0 },
      { productId: 'demo-p5', name: 'Cold Pressed Sesame Oil 500ml', qty: 1, price: 90.0 }
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

export const demoBatches = [
  {
    id: 'B-8041',
    batchId: 'B-8041',
    batchCode: 'B-8041',
    agentId: 'demo-dp',
    agentName: 'David Anand',
    deliveryDate: new Date().toISOString().split('T')[0],
    deliverySlot: '9:00 AM – 1:00 PM',
    orderCount: 2,
    orderIds: ['ORD-1002', 'ORD-1003'],
    estimatedDistance: 4.2,
    estimatedTime: 35,
    status: 'Out for Delivery',
    aggregationStatus: 'Assigned',
    orders: [
      {
        id: 'ORD-1002',
        orderCode: 'ORD-1002',
        pickupLocation: '12 T. Nagar Main Rd, Chennai',
        deliveryLocation: '14/2, 4th Cross St, Mandaveli, Chennai - 600028',
    deliveryAddress: '14/2, 4th Cross St, Mandaveli, Chennai - 600028',
        vendor: { id: 'demo-vend', shopName: 'Namma Fresh Mart' }
      },
      {
        id: 'ORD-1003',
        orderCode: 'ORD-1003',
        pickupLocation: '12 T. Nagar Main Rd, Chennai',
        deliveryLocation: '42/1 Besant Avenue, Adyar, Chennai - 600020',
    deliveryAddress: '42/1 Besant Avenue, Adyar, Chennai - 600020',
        vendor: { id: 'demo-vend', shopName: 'Namma Fresh Mart' }
      }
    ]
  }
];

export const demoNotifications = [
  {
    id: 1,
    message: 'Welcome to Smart Micro-Logistics Management System.',
    type: 'system',
    isRead: false,
    date: new Date().toISOString()
  },
  {
    id: 2,
    message: 'Batch B-8041 clustered with 2 neighborhood orders ready for dispatch.',
    type: 'aggregation',
    isRead: false,
    date: new Date(Date.now() - 1800000).toISOString()
  }
];

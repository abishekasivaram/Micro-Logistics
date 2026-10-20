// Isolated Mock Data for Quick Demo Personas
// This data is strictly used when currentUser.isDemo === true
// It never mutates or connects to the live Supabase production database.

export const demoVendors = [
  {
    id: 'demo-vend',
    legacy_id: 'v1',
    uuid: 'demo-vend',
    name: 'Namma Fresh Mart',
    shopName: 'Namma Fresh Mart',
    ownerName: 'Subramaniam V.',
    email: 'demo@vendor.local',
    phone: '9840123456',
    category: 'Groceries & Daily Essentials',
    rating: 4.8,
    prepTime: '15-25 mins',
    isOpen: true,
    status: 'Active',
    operatingHours: '7:00 AM - 9:00 PM',
    address: '12 T. Nagar Main Rd, Chennai',
    area: 'T. Nagar',
    joinDate: '2025-11-10',
    lat: 13.0418,
    lng: 80.2341,
    logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&auto=format&fit=crop&q=80',
    description: 'Fresh daily essentials, rice, dairy, and traditional household goods delivered straight from T. Nagar.'
  },
  {
    id: 'demo-vend2',
    legacy_id: 'v2',
    uuid: 'demo-vend2',
    name: 'Anand Sweets & Bakery',
    shopName: 'Anand Sweets & Bakery',
    ownerName: 'Anand Kumar',
    email: 'anand@bakery.local',
    phone: '9840987654',
    category: 'Bakery & Snacks',
    rating: 4.9,
    prepTime: '10-20 mins',
    isOpen: true,
    status: 'Active',
    operatingHours: '6:30 AM - 9:30 PM',
    address: '45 Adyar Bridge Rd, Chennai',
    area: 'Adyar',
    joinDate: '2025-12-05',
    lat: 13.0067,
    lng: 80.2575,
    logo: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=150&auto=format&fit=crop&q=80',
    description: 'Artisanal breads, oven-fresh pastries, samosas, and regional sweets prepared fresh daily.'
  }
];

export const demoProducts = [
  {
    id: 'demo-p1',
    uuid: 'demo-p1',
    name: 'Aavin Green Milk 500ml',
    category: 'Dairy',
    price: 22.0,
    stock: 85,
    prepTime: '5 mins',
    status: 'In Stock',
    vendorId: 'demo-vend',
    vendorName: 'Namma Fresh Mart',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80',
    description: 'Fresh pasteurized toned milk 500ml packet. Daily cold-chain delivery.'
  },
  {
    id: 'demo-p2',
    uuid: 'demo-p2',
    name: 'Modern Whole Wheat Bread 400g',
    category: 'Bakery',
    price: 45.0,
    stock: 6,
    prepTime: '5 mins',
    status: 'Low Stock',
    vendorId: 'demo-vend',
    vendorName: 'Namma Fresh Mart',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80',
    description: 'High-fiber whole wheat sliced loaf baked with zero preservatives.'
  },
  {
    id: 'demo-p3',
    uuid: 'demo-p3',
    name: 'Ponni Boiled Rice 5kg',
    category: 'Grains',
    price: 320.0,
    stock: 24,
    prepTime: '10 mins',
    status: 'In Stock',
    vendorId: 'demo-vend',
    vendorName: 'Namma Fresh Mart',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80',
    description: 'Premium sorted aged Ponni rice, naturally aromatic and pesticide-free.'
  },
  {
    id: 'demo-p4',
    uuid: 'demo-p4',
    name: 'Farm Fresh Organic Eggs (6 pack)',
    category: 'Dairy',
    price: 54.0,
    stock: 0,
    prepTime: '5 mins',
    status: 'Out of Stock',
    vendorId: 'demo-vend',
    vendorName: 'Namma Fresh Mart',
    image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=500&auto=format&fit=crop&q=80',
    description: 'Graded free-range farm eggs packed in recycled pulp cartons.'
  },
  {
    id: 'demo-p5',
    uuid: 'demo-p5',
    name: 'Cold Pressed Sesame Oil 500ml',
    category: 'Groceries',
    price: 180.0,
    stock: 18,
    prepTime: '5 mins',
    status: 'In Stock',
    vendorId: 'demo-vend',
    vendorName: 'Namma Fresh Mart',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=80',
    description: 'Traditional wood-pressed gingelly sesame oil with jaggery.'
  },
  {
    id: 'demo-p6',
    uuid: 'demo-p6',
    name: 'Hot Crispy Onion Samosa (4 pcs)',
    category: 'Snacks',
    price: 40.0,
    stock: 15,
    prepTime: '15 mins',
    status: 'In Stock',
    vendorId: 'demo-vend2',
    vendorName: 'Anand Sweets & Bakery',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=80',
    description: 'Crisp hand-folded triangular pastries stuffed with spiced shallots.'
  }
];

export const demoCustomers = [
  {
    id: 'demo-cust',
    legacy_id: 'c1',
    name: 'Priya Rajan',
    username: 'demo_customer',
    email: 'demo@customer.local',
    phone: '9876543210',
    address: '101 Anna Nagar East, Chennai',
    area: 'Anna Nagar',
    status: 'Active',
    totalOrders: 6,
    activeOrders: 1
  },
  {
    id: 'demo-cust2',
    legacy_id: 'c2',
    name: 'Sivakumar R',
    username: 'sivakumar',
    email: 'siva@example.com',
    phone: '9840123456',
    address: '45 Cross Cut Road, Gandhipuram',
    area: 'Central Zone',
    status: 'Active',
    totalOrders: 3,
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
    deliveryLocation: '101 Anna Nagar East, Chennai',
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
    deliveryLocation: '45 Cross Cut Road, Gandhipuram',
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
    customerId: 'demo-cust',
    customerName: 'Priya Rajan',
    customerPhone: '9876543210',
    vendorId: 'demo-vend',
    vendorName: 'Namma Fresh Mart',
    pickupLocation: '12 T. Nagar Main Rd, Chennai',
    deliveryLocation: '101 Anna Nagar East, Chennai',
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
    customerId: 'demo-cust',
    customerName: 'Priya Rajan',
    customerPhone: '9876543210',
    vendorId: 'demo-vend',
    vendorName: 'Namma Fresh Mart',
    pickupLocation: '12 T. Nagar Main Rd, Chennai',
    deliveryLocation: '101 Anna Nagar East, Chennai',
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
        deliveryLocation: '45 Cross Cut Road, Gandhipuram',
        vendor: { id: 'demo-vend', shopName: 'Namma Fresh Mart' }
      },
      {
        id: 'ORD-1003',
        orderCode: 'ORD-1003',
        pickupLocation: '12 T. Nagar Main Rd, Chennai',
        deliveryLocation: '101 Anna Nagar East, Chennai',
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

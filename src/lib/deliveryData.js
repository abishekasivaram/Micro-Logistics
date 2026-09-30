/**
 * MicroLogi Delivery Fleet — Enterprise Logistics Mock Data & Model Layer
 * Provides rich, realistic data for local multi-seller delivery dispatch.
 */

export const INITIAL_DELIVERY_AGENT = {
  id: 'da1',
  agentCode: 'DA-4091',
  name: 'David Anand',
  username: 'da1',
  email: 'david.anand@micrologi.com',
  phone: '+91 98401 23456',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  currentArea: 'T. Nagar & Central Chennai',
  availability: 'Available', // 'Available' | 'On Break' | 'Offline'
  role: 'delivery_partner',
  roleTitle: 'Delivery Fleet Agent',
  rating: 4.95,
  ratingsCount: 382,
  joinedDate: 'March 2024',
  vehicle: {
    type: 'Electric Cargo Scooter',
    model: 'Ather 450X Logistics Pro',
    plateNumber: 'TN-01-AB-1234',
    batteryLevel: '82%',
    capacityWeight: '65 kg',
    capacityParcels: '6 medium parcels'
  },
  documents: {
    licenseNumber: 'DL-TN01-2021-998822',
    licenseExpiry: '2028-11-30',
    licenseVerified: true,
    insurancePolicy: 'ICICI-LOMB-882910-E',
    insuranceExpiry: '2026-11-15', // Warning status soon
    insuranceVerified: true,
    pancardNumber: 'ABCDE1234F',
    pancardVerified: true
  },
  preferences: {
    theme: 'system', // 'light' | 'dark' | 'system'
    language: 'English (IN)',
    soundAlerts: true,
    pushNotifications: true,
    defaultMapApp: 'Google Maps'
  },
  performance: {
    completedOrders: 428,
    onTimeRate: 98.4,
    totalDistanceKm: 1420,
    avgDeliveryMins: 22.4,
    payoutBalance: '₹3,450'
  }
};

export const INITIAL_DASHBOARD_STATS = {
  completedToday: {
    value: 14,
    trend: '+18%',
    isPositive: true,
    comparison: 'vs yesterday',
    sparkline: [6, 8, 9, 11, 10, 13, 14]
  },
  activeBatches: {
    value: 1,
    trend: 'On Schedule',
    isPositive: true,
    comparison: 'ETA 11:45 AM',
    sparkline: [1, 2, 1, 2, 1, 1, 1]
  },
  totalPickups: {
    value: 6,
    trend: '100% Collected',
    isPositive: true,
    comparison: '3 seller hubs',
    sparkline: [2, 3, 4, 5, 5, 6, 6]
  },
  onTimeRate: {
    value: '98.4%',
    trend: '+2.1%',
    isPositive: true,
    comparison: '30-day average',
    sparkline: [94, 95, 96, 96, 97, 98, 98.4]
  }
};

export const INITIAL_ACTIVE_BATCH = {
  id: 'b-4082',
  batchId: 'BATCH-4082',
  status: 'Out for Delivery',
  zone: 'T. Nagar Central & Nungambakkam',
  startedAt: '08:30 AM',
  estimatedCompletion: '12:15 PM',
  totalStops: 5,
  completedStops: 2,
  totalDistanceKm: 14.2,
  estimatedTimeMins: 38,
  progressPercent: 65,
  hubs: [
    {
      id: 'hub-1',
      vendorId: 'v1',
      name: 'Chennai Organic Farm Hub',
      address: '14 Usman Road, T. Nagar, Chennai',
      contact: '+91 94441 12345',
      parcels: 2,
      status: 'COLLECTED',
      collectedAt: '08:45 AM',
      barcode: 'HUB-CHE-991',
      itemsList: [
        { id: 'i1', name: 'Fresh Organic Tomatoes (1kg)', orderId: 'ORD-8091' },
        { id: 'i2', name: 'Whole Wheat Bread (400g)', orderId: 'ORD-8091' }
      ]
    },
    {
      id: 'hub-2',
      vendorId: 'v2',
      name: 'Metro Green Grocers',
      address: '28 G.N. Chetty Road, T. Nagar, Chennai',
      contact: '+91 94442 23456',
      parcels: 2,
      status: 'COLLECTED',
      collectedAt: '09:05 AM',
      barcode: 'HUB-CHE-992',
      itemsList: [
        { id: 'i3', name: 'Cold Pressed Groundnut Oil (1L)', orderId: 'ORD-8092' },
        { id: 'i4', name: 'Organic Jaggery (500g)', orderId: 'ORD-8092' }
      ]
    },
    {
      id: 'hub-3',
      vendorId: 'v3',
      name: 'Amudham Daily Essentials',
      address: '5 Pondy Bazaar, T. Nagar, Chennai',
      contact: '+91 94443 34567',
      parcels: 1,
      status: 'COLLECTED',
      collectedAt: '09:20 AM',
      barcode: 'HUB-CHE-993',
      itemsList: [
        { id: 'i5', name: 'Farm Fresh Paneer (250g)', orderId: 'ORD-8093' },
        { id: 'i6', name: 'Country Eggs (Pack of 6)', orderId: 'ORD-8093' },
        { id: 'i7', name: 'A2 Gir Cow Milk (2L)', orderId: 'ORD-8094' },
        { id: 'i8', name: 'Assorted Herbs Pack', orderId: 'ORD-8095' }
      ]
    }
  ],
  orders: [
    {
      id: 'ORD-8091',
      orderCode: 'ORD-8091',
      customerName: 'Priya Rajan',
      phone: '+91 98402 33441',
      address: 'Flat 4B, Emerald Heights, Habibullah Road, T. Nagar, Chennai',
      items: ['Fresh Organic Tomatoes (1kg)', 'Whole Wheat Bread (400g)'],
      itemsCount: 2,
      vendorName: 'Chennai Organic Farm Hub',
      timeSlot: '9:00 AM – 1:00 PM',
      status: 'DELIVERED',
      codAmount: 0,
      paymentMode: 'Prepaid (UPI)',
      eta: 'Delivered at 10:14 AM',
      sequence: 1,
      lat: 13.0441,
      lng: 80.2392,
      deliveredAt: '10:14 AM',
      otpVerified: true,
      proofPhoto: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=300',
      notes: 'Handed over directly to customer.'
    },
    {
      id: 'ORD-8092',
      orderCode: 'ORD-8092',
      customerName: 'Karthik Sundaram',
      phone: '+91 98403 44552',
      address: '22 Raman Street, Near Natesan Park, T. Nagar, Chennai',
      items: ['Cold Pressed Groundnut Oil (1L)', 'Organic Jaggery (500g)'],
      itemsCount: 2,
      vendorName: 'Metro Green Grocers',
      timeSlot: '9:00 AM – 1:00 PM',
      status: 'DELIVERED',
      codAmount: 0,
      paymentMode: 'Prepaid (Credit Card)',
      eta: 'Delivered at 10:38 AM',
      sequence: 2,
      lat: 13.0385,
      lng: 80.2318,
      deliveredAt: '10:38 AM',
      otpVerified: true,
      notes: 'Customer signed digital acknowledgement.'
    },
    {
      id: 'ORD-8093',
      orderCode: 'ORD-8093',
      customerName: 'Ananya Deshmukh',
      phone: '+91 98404 55663',
      address: '15/2 Bazullah Road, Opposite Kodambakkam Bridge, Chennai',
      items: ['Farm Fresh Paneer (250g)', 'Country Eggs (Pack of 6)'],
      itemsCount: 2,
      vendorName: 'Amudham Daily Essentials',
      timeSlot: '9:00 AM – 1:00 PM',
      status: 'OUT_FOR_DELIVERY',
      codAmount: 340,
      paymentMode: 'Cash on Delivery (COD)',
      eta: '11:15 AM (Next Stop)',
      isNextStop: true,
      sequence: 3,
      lat: 13.0482,
      lng: 80.2291,
      notes: 'Customer requested calling 5 minutes before arrival. Gate pass needed.'
    },
    {
      id: 'ORD-8094',
      orderCode: 'ORD-8094',
      customerName: 'Rajesh Varma',
      phone: '+91 98405 66774',
      address: '77 Venkatnarayana Road, Near Panagal Park, T. Nagar, Chennai',
      items: ['A2 Gir Cow Milk (1L x 2)', 'Organic Filter Coffee Decoction (200ml)'],
      itemsCount: 2,
      vendorName: 'Amudham Daily Essentials',
      timeSlot: '9:00 AM – 1:00 PM',
      status: 'PICKED_UP',
      codAmount: 0,
      paymentMode: 'Prepaid (Net Banking)',
      eta: '11:40 AM',
      sequence: 4,
      lat: 13.0360,
      lng: 80.2372,
      notes: 'Flat 2A, 2nd floor, lift available.'
    },
    {
      id: 'ORD-8095',
      orderCode: 'ORD-8095',
      customerName: 'Deepa Narayanan',
      phone: '+91 98406 77885',
      address: '40 Burkit Road, Near T. Nagar Bus Terminus, Chennai',
      items: ['Assorted Fresh Herbs Pack', 'Alphonso Mango Pulp (500g)'],
      itemsCount: 2,
      vendorName: 'Chennai Organic Farm Hub',
      timeSlot: '9:00 AM – 1:00 PM',
      status: 'PENDING',
      codAmount: 220,
      paymentMode: 'Cash on Delivery (COD)',
      eta: '12:05 PM',
      sequence: 5,
      lat: 13.0399,
      lng: 80.2304,
      notes: 'Please do not ring bell if baby is sleeping; call phone.'
    }
  ]
};

export const INITIAL_TODAY_TIMELINE = [
  {
    id: 't-1',
    time: '10:38 AM',
    title: 'Order Delivered (ORD-8092)',
    desc: 'Delivered to Karthik Sundaram at Raman Street. OTP 7192 verified.',
    type: 'success',
    badge: 'Delivered'
  },
  {
    id: 't-2',
    time: '10:14 AM',
    title: 'Order Delivered (ORD-8091)',
    desc: 'Delivered to Priya Rajan at Emerald Heights. Photo proof recorded.',
    type: 'success',
    badge: 'Delivered'
  },
  {
    id: 't-3',
    time: '09:45 AM',
    title: 'Out for Delivery (Batch B-4082)',
    desc: 'Departed Pondy Bazaar corridor towards first delivery waypoint.',
    type: 'info',
    badge: 'Transit'
  },
  {
    id: 't-4',
    time: '09:20 AM',
    title: 'Pickup Confirmed (Amudham Daily)',
    desc: 'Secured 4 aggregated items. Barcode HUB-CHE-993 scanned.',
    type: 'warning',
    badge: 'Pickup'
  },
  {
    id: 't-5',
    time: '09:05 AM',
    title: 'Pickup Confirmed (Metro Grocers)',
    desc: 'Secured 2 parcels. Barcode HUB-CHE-992 verified.',
    type: 'warning',
    badge: 'Pickup'
  },
  {
    id: 't-6',
    time: '08:45 AM',
    title: 'Pickup Confirmed (Chennai Organic Hub)',
    desc: 'Secured 2 parcels. Barcode HUB-CHE-991 verified.',
    type: 'warning',
    badge: 'Pickup'
  },
  {
    id: 't-7',
    time: '08:30 AM',
    title: 'Batch Assigned (BATCH-4082)',
    desc: 'Assigned 5 orders across 3 seller hubs for morning delivery window.',
    type: 'info',
    badge: 'Assigned'
  },
  {
    id: 't-8',
    time: '08:00 AM',
    title: 'Shift Started & Marked Available',
    desc: 'Vehicle check passed. Battery level 100%. Zone: T. Nagar Central.',
    type: 'neutral',
    badge: 'Clock In'
  }
];

export const INITIAL_SHIFT_SUMMARY = {
  hoursOnline: '5h 42m',
  distanceTraveledKm: 34.8,
  ordersCompleted: 14,
  estimatedEarnings: '₹1,180',
  batteryRemaining: '82%',
  vehicleStatus: 'Optimal'
};

export const INITIAL_HISTORICAL_ORDERS = [
  {
    id: 'ORD-7991',
    orderCode: 'ORD-7991',
    date: '2026-09-30',
    batchId: 'BATCH-4081',
    customerName: 'Suresh Kumar',
    phone: '+91 98401 11223',
    address: '12 North Usman Road, T. Nagar, Chennai',
    items: ['Organic Milk (2L)', 'Country Butter (250g)'],
    total: 310,
    codAmount: 0,
    status: 'DELIVERED',
    deliveredAt: '09:15 AM',
    durationMins: 19,
    distanceKm: 2.4,
    rating: 5,
    proofType: 'OTP Verified'
  },
  {
    id: 'ORD-7992',
    orderCode: 'ORD-7992',
    date: '2026-09-30',
    batchId: 'BATCH-4081',
    customerName: 'Meenakshi Sundaram',
    phone: '+91 98402 22334',
    address: '8 Magesh Street, T. Nagar, Chennai',
    items: ['Cold Pressed Coconut Oil (500ml)', 'Turmeric Powder (200g)'],
    total: 450,
    codAmount: 450,
    status: 'DELIVERED',
    deliveredAt: '09:40 AM',
    durationMins: 25,
    distanceKm: 3.1,
    rating: 5,
    proofType: 'Cash Received & Signed'
  },
  {
    id: 'ORD-7980',
    orderCode: 'ORD-7980',
    date: '2026-09-29',
    batchId: 'BATCH-4078',
    customerName: 'Venkatesh Prasad',
    phone: '+91 98403 33445',
    address: '44 Eldams Road, Alwarpet, Chennai',
    items: ['Alphonso Mango Box (3kg)', 'Raw Honey (500g)'],
    total: 1250,
    codAmount: 0,
    status: 'DELIVERED',
    deliveredAt: '04:20 PM',
    durationMins: 21,
    distanceKm: 4.2,
    rating: 5,
    proofType: 'OTP Verified'
  },
  {
    id: 'ORD-7981',
    orderCode: 'ORD-7981',
    date: '2026-09-29',
    batchId: 'BATCH-4078',
    customerName: 'Lakshmi Narayanan',
    phone: '+91 98404 44556',
    address: '19 TTK Road, Alwarpet, Chennai',
    items: ['Organic Idli Rice (5kg)'],
    total: 520,
    codAmount: 520,
    status: 'DELIVERED',
    deliveredAt: '04:55 PM',
    durationMins: 28,
    distanceKm: 3.8,
    rating: 4.8,
    proofType: 'Cash Received'
  },
  {
    id: 'ORD-7975',
    orderCode: 'ORD-7975',
    date: '2026-09-29',
    batchId: 'BATCH-4077',
    customerName: 'Goutham Chandran',
    phone: '+91 98405 55667',
    address: '102 Chamiers Road, Nandanam, Chennai',
    items: ['Fresh Organic Greens (3 Bunches)', 'Paneer (500g)'],
    total: 390,
    codAmount: 0,
    status: 'DELIVERED',
    deliveredAt: '11:15 AM',
    durationMins: 18,
    distanceKm: 2.9,
    rating: 5,
    proofType: 'OTP Verified'
  },
  {
    id: 'ORD-7960',
    orderCode: 'ORD-7960',
    date: '2026-09-28',
    batchId: 'BATCH-4072',
    customerName: 'Aishwarya Ramesh',
    phone: '+91 98406 66778',
    address: '15 Harrington Road, Chetpet, Chennai',
    items: ['Cold Pressed Sesame Oil (1L)', 'Palm Sugar (1kg)'],
    total: 680,
    codAmount: 0,
    status: 'DELIVERED',
    deliveredAt: '03:10 PM',
    durationMins: 24,
    distanceKm: 5.1,
    rating: 5,
    proofType: 'OTP Verified'
  },
  {
    id: 'ORD-7952',
    orderCode: 'ORD-7952',
    date: '2026-09-28',
    batchId: 'BATCH-4071',
    customerName: 'Vijay Raghavan',
    phone: '+91 98407 77889',
    address: '78 Sterling Road, Nungambakkam, Chennai',
    items: ['Special Filter Coffee (500g)'],
    total: 420,
    codAmount: 420,
    status: 'FAILED',
    failureReason: 'Customer unavailable after 3 calls',
    deliveredAt: '12:30 PM',
    durationMins: 32,
    distanceKm: 4.0,
    rating: null,
    proofType: 'Call Log & Location Tag'
  },
  {
    id: 'ORD-7940',
    orderCode: 'ORD-7940',
    date: '2026-09-27',
    batchId: 'BATCH-4065',
    customerName: 'Shalini Swaminathan',
    phone: '+91 98408 88990',
    address: '5 College Road, Nungambakkam, Chennai',
    items: ['Organic Desi Ghee (500ml)', 'Cashews (250g)'],
    total: 940,
    codAmount: 0,
    status: 'DELIVERED',
    deliveredAt: '10:45 AM',
    durationMins: 22,
    distanceKm: 3.4,
    rating: 5,
    proofType: 'OTP Verified'
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    group: 'Today',
    type: 'assignment',
    title: 'New Delivery Batch Assigned',
    description: 'Dispatch assigned Batch B-4082 with 5 orders across T. Nagar Central.',
    timestamp: '2 hours ago',
    date: new Date().toISOString(),
    isRead: false,
    priority: 'high'
  },
  {
    id: 'notif-2',
    group: 'Today',
    type: 'alert',
    title: 'Delivery Slot Change Requested',
    description: 'Customer Ananya Deshmukh confirmed arrival time between 11:15 AM - 11:30 AM.',
    timestamp: '45 mins ago',
    date: new Date(Date.now() - 45 * 60000).toISOString(),
    isRead: false,
    priority: 'normal'
  },
  {
    id: 'notif-3',
    group: 'Yesterday',
    type: 'payout',
    title: 'Daily Earnings Credited',
    description: '₹1,240 has been transferred to your connected bank account for Sep 29 shifts.',
    timestamp: 'Yesterday at 9:30 PM',
    date: new Date(Date.now() - 24 * 3600000).toISOString(),
    isRead: true,
    priority: 'normal'
  },
  {
    id: 'notif-4',
    group: 'Yesterday',
    type: 'system',
    title: 'Vehicle Insurance Renewal Reminder',
    description: 'Your cargo vehicle insurance policy ICICI-LOMB-882910 expires in 46 days.',
    timestamp: 'Yesterday at 11:00 AM',
    date: new Date(Date.now() - 28 * 3600000).toISOString(),
    isRead: true,
    priority: 'warning'
  },
  {
    id: 'notif-5',
    group: 'Earlier',
    type: 'system',
    title: '5-Star Customer Compliment',
    description: '"Excellent delivery agent, very polite and on time!" - Priya R.',
    timestamp: '3 days ago',
    date: new Date(Date.now() - 72 * 3600000).toISOString(),
    isRead: true,
    priority: 'low'
  },
  {
    id: 'notif-6',
    group: 'Earlier',
    type: 'system',
    title: 'App System Maintenance Complete',
    description: 'Control Tower gateway updated to v2.4 with improved offline caching.',
    timestamp: '5 days ago',
    date: new Date(Date.now() - 120 * 3600000).toISOString(),
    isRead: true,
    priority: 'low'
  }
];

export const FAQ_ITEMS = [
  {
    category: 'Route & Navigation',
    questions: [
      {
        q: 'How does the route stop ordering work?',
        a: 'The route sequence is computed using nearest-neighbor route optimization: all seller hub pickups are sequenced first to consolidate goods, followed by optimal delivery drops to minimize travel distance.'
      },
      {
        q: 'Can I reorder stops if road traffic is blocked?',
        a: 'Yes, in the Route tab you can drag and drop or use the reorder buttons to adjust the sequence. The system will recalculate your estimated arrival times.'
      },
      {
        q: 'How do I open turn-by-turn navigation in Google Maps?',
        a: 'Click the "Start Navigation" button on any active stop or order drawer to instantly open the Google Maps deep-link with pre-filled destination coordinates.'
      }
    ]
  },
  {
    category: 'Order Status & Proof of Delivery',
    questions: [
      {
        q: 'What is required to mark an order as Delivered?',
        a: 'To confirm delivery, ask the customer for the 4-digit OTP sent to their SMS/WhatsApp, or collect their digital signature on the screen along with optional photo proof of delivery.'
      },
      {
        q: 'What should I do if a customer is unavailable?',
        a: 'Attempt to call the customer at least twice. If unresponsive after 5 minutes, mark status as "Failed" and select "Customer Unavailable". Bring the parcel back to the dispatch aggregation hub.'
      },
      {
        q: 'How do I handle Cash on Delivery (COD) collection?',
        a: 'Collect the exact amount indicated on the order card. Once collected, confirm the payment in the Status modal. Daily collected cash is settled at the end of your shift.'
      }
    ]
  },
  {
    category: 'Earnings & Vehicle Support',
    questions: [
      {
        q: 'When are daily delivery earnings settled?',
        a: 'Earnings are automatically processed at the end of each shift and transferred to your registered bank account every morning by 10:00 AM.'
      },
      {
        q: 'What should I do in case of a vehicle breakdown?',
        a: 'Immediately toggle your status to "Offline", call Central Dispatch via the Help tab, and an emergency backup courier will be routed to transfer your active batch.'
      }
    ]
  }
];

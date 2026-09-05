export const vendors = [
  { id: 'v1', name: 'Fresh Mart', address: '12 Main St, City Center', lat: 40.7128, lng: -74.0060 },
  { id: 'v2', name: 'Sri Lakshmi Stores', address: '45 Market Rd, North End', lat: 40.7140, lng: -74.0100 },
];

export const customers = [
  { id: 'c1', name: 'Alice Smith', phone: '555-0101', address: '101 Park Ave', lat: 40.7135, lng: -74.0080 },
  { id: 'c2', name: 'Bob Jones', phone: '555-0102', address: '202 Oak St', lat: 40.7150, lng: -74.0040 },
  { id: 'c3', name: 'Charlie Brown', phone: '555-0103', address: '303 Pine Ln', lat: 40.7160, lng: -74.0020 },
];

export const deliveryPersonnel = [
  { id: 'dp1', name: 'David Rider', phone: '555-0201', status: 'Available', lat: 40.7120, lng: -74.0070 },
  { id: 'dp2', name: 'Eve Transporter', phone: '555-0202', status: 'On Delivery', lat: 40.7180, lng: -74.0010 },
];

export const orders = [
  {
    id: 'ORD-1021',
    customerId: 'c1',
    vendorId: 'v1',
    items: [
      { name: 'Milk', qty: 2, price: 4.50 },
      { name: 'Bread', qty: 1, price: 2.00 }
    ],
    total: 11.00,
    status: 'Preparing',
    date: new Date().toISOString(),
    deliveryGroupId: null
  },
  {
    id: 'ORD-1022',
    customerId: 'c2',
    vendorId: 'v1',
    items: [
      { name: 'Apples', qty: 5, price: 1.00 },
    ],
    total: 5.00,
    status: 'Pending',
    date: new Date().toISOString(),
    deliveryGroupId: null
  },
  {
    id: 'ORD-1025',
    customerId: 'c3',
    vendorId: 'v2',
    items: [
      { name: 'Rice', qty: 1, price: 15.00 },
    ],
    total: 15.00,
    status: 'Preparing',
    date: new Date().toISOString(),
    deliveryGroupId: null
  },
  {
    id: 'ORD-1032',
    customerId: 'c1',
    vendorId: 'v2',
    items: [
      { name: 'Snacks', qty: 3, price: 3.00 }
    ],
    total: 9.00,
    status: 'Pending',
    date: new Date().toISOString(),
    deliveryGroupId: null
  }
];

export const deliveryGroups = [
  // Example of an already created group
  // { id: 'DG-001', orderIds: ['ORD-1021', 'ORD-1022'], personnelId: 'dp1', status: 'Assigned' }
];

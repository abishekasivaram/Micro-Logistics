export const mapProductToFrontend = (dbProduct: any, vendorName?: string) => {
  return {
    uuid: dbProduct.id,
    id: dbProduct.legacy_id || dbProduct.id,
    vendorId: dbProduct.vendor?.legacy_id || dbProduct.vendor_id,
    vendorName: vendorName || dbProduct.vendor?.shop_name || 'Local Seller',
    name: dbProduct.name,
    category: dbProduct.category,
    price: Number(dbProduct.price),
    stock: dbProduct.stock,
    prepTime: dbProduct.prep_time,
    status: dbProduct.status,
    image: dbProduct.image,
    description: dbProduct.description,
  };
};

export const mapVendorToFrontend = (dbVendor: any) => {
  return {
    uuid: dbVendor.id,
    id: dbVendor.legacy_id || dbVendor.id,
    name: dbVendor.shop_name,
    shopName: dbVendor.shop_name,
    ownerName: dbVendor.owner_name,
    email: dbVendor.profile?.email,
    phone: dbVendor.profile?.phone,
    role: dbVendor.profile?.role,
    category: dbVendor.category,
    rating: dbVendor.rating,
    prepTime: dbVendor.prep_time,
    isOpen: dbVendor.is_open,
    status: dbVendor.status,
    operatingHours: dbVendor.operating_hours,
    address: dbVendor.address,
    area: dbVendor.area,
    joinDate: dbVendor.join_date,
    lat: dbVendor.lat,
    lng: dbVendor.lng,
    logo: dbVendor.logo,
    description: dbVendor.description,
  };
};

export const getHumanReadableDeliveryStatus = (orderStatus: string) => {
  switch (orderStatus) {
    case 'PLACED': return 'Order Placed';
    case 'CONFIRMED': return 'Order Confirmed by Seller';
    case 'PREPARING': return 'Item Packaging in Progress';
    case 'READY_FOR_DELIVERY': return 'Ready for Delivery';
    case 'ASSIGNED': return 'Assigned for Delivery';
    case 'OUT_FOR_DELIVERY': return 'Out for Delivery';
    case 'DELIVERED': return 'Delivered to Customer';
    case 'CANCELLED': return 'Cancelled';
    default: return 'Unknown';
  }
};

export const getHumanReadableAggregationStatus = (aggStatus: string) => {
  switch (aggStatus) {
    case 'WAITING_FOR_AGGREGATION': return 'Waiting for Aggregation';
    case 'GROUPED': return 'Grouped';
    case 'BATCH_CREATED': return 'Batch Created';
    case 'ASSIGNED': return 'Assigned';
    case 'COMPLETED': return 'Delivered';
    default: return aggStatus;
  }
};

export const getBatchHumanReadableStatus = (batchStatus: string) => {
  switch (batchStatus) {
    case 'PENDING_ASSIGNMENT': return 'Pending Assignment';
    case 'ASSIGNED': return 'Assigned';
    case 'PICKUP_IN_PROGRESS': return 'Pickup in Progress';
    case 'PICKED_UP': return 'Picked Up';
    case 'OUT_FOR_DELIVERY': return 'Out for Delivery';
    case 'ARRIVED': return 'Arrived';
    case 'DELIVERED': return 'Completed'; // Frontend uses Completed or Delivered
    case 'COMPLETED': return 'Completed';
    default: return batchStatus;
  }
};

export const mapOrderToFrontend = (dbOrder: any) => {
  return {
    uuid: dbOrder.id,
    id: dbOrder.order_code,
    orderId: dbOrder.order_code,
    customerId: dbOrder.customer?.legacy_id || dbOrder.customer_id,
    customerName: dbOrder.customer?.profile?.username || 'Customer',
    vendorId: dbOrder.vendor?.legacy_id || dbOrder.vendor_id,
    vendorName: dbOrder.vendor?.shop_name || 'Vendor',
    items: (dbOrder.order_items || []).map((item: any) => ({
      productId: item.product?.legacy_id || item.product_id,
      name: item.product?.name || 'Item',
      qty: item.qty,
      price: Number(item.price)
    })),
    total: Number(dbOrder.total),
    orderStatus: dbOrder.order_status,
    status: dbOrder.order_status,
    deliveryStatus: getHumanReadableDeliveryStatus(dbOrder.order_status),
    aggregationStatus: getHumanReadableAggregationStatus(dbOrder.aggregation_status),
    pickupLocation: dbOrder.pickup_location,
    deliveryLocation: dbOrder.delivery_location,
    deliveryDate: dbOrder.delivery_date,
    deliveryTimeSlot: dbOrder.delivery_time_slot,
    date: dbOrder.created_at,
    batchId: dbOrder.batch?.batch_code || null,
    deliveryGroupId: dbOrder.batch?.batch_code || null,
    groupedWith: [], // Could be populated if needed
    assignedAgent: dbOrder.assigned_agent ? `${dbOrder.assigned_agent.profile?.username} (${dbOrder.assigned_agent.profile?.phone})` : null
  };
};

export const mapAgentToFrontend = (dbAgent: any) => {
  return {
    uuid: dbAgent.id,
    id: dbAgent.legacy_id || dbAgent.id,
    name: dbAgent.profile?.username || 'Agent',
    phone: dbAgent.profile?.phone,
    currentArea: dbAgent.current_area,
    capacity: dbAgent.capacity,
    currentOrders: dbAgent.current_orders,
    availability: dbAgent.availability,
    status: dbAgent.status,
    vehicle: dbAgent.vehicle,
    rating: dbAgent.rating
  };
};

export const mapBatchToFrontend = (dbBatch: any) => {
  const orders = dbBatch.orders || [];
  const orderCodes = orders.map((o: any) => o.order_code);
  const sellerIds = Array.from(new Set(orders.map((o: any) => o.vendor?.legacy_id || o.vendor_id)));
  const sellerNames = Array.from(new Set(orders.map((o: any) => o.vendor?.shop_name || 'Vendor')));
  const pickupLocations = Array.from(new Set(orders.map((o: any) => o.pickup_location)));
  const deliveryLocations = Array.from(new Set(orders.map((o: any) => o.delivery_location)));

  return {
    uuid: dbBatch.id,
    id: dbBatch.batch_code,
    batchId: dbBatch.batch_code,
    orderIds: orderCodes,
    sellerIds,
    sellerNames,
    agentId: dbBatch.agent?.legacy_id || dbBatch.agent_id,
    agentName: dbBatch.agent?.profile?.username || null,
    pickupLocations,
    deliveryLocations,
    deliveryDate: dbBatch.delivery_date,
    deliverySlot: dbBatch.delivery_slot,
    orderCount: dbBatch.order_count,
    estimatedDistance: dbBatch.estimated_distance,
    estimatedTime: dbBatch.estimated_time,
    status: getBatchHumanReadableStatus(dbBatch.status),
    aggregationStatus: getHumanReadableAggregationStatus(dbBatch.aggregation_status)
  };
};

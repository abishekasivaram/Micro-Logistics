"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapBatchToFrontend = exports.mapAgentToFrontend = exports.mapOrderToFrontend = exports.getBatchHumanReadableStatus = exports.getHumanReadableAggregationStatus = exports.getHumanReadableDeliveryStatus = exports.mapVendorToFrontend = exports.mapProductToFrontend = void 0;
const mapProductToFrontend = (dbProduct, vendorName) => {
    return {
        uuid: dbProduct.id,
        id: dbProduct.id,
        vendorId: dbProduct.vendor_id,
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
exports.mapProductToFrontend = mapProductToFrontend;
const mapVendorToFrontend = (dbVendor) => {
    return {
        uuid: dbVendor.id,
        id: dbVendor.id,
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
exports.mapVendorToFrontend = mapVendorToFrontend;
const getHumanReadableDeliveryStatus = (orderStatus) => {
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
exports.getHumanReadableDeliveryStatus = getHumanReadableDeliveryStatus;
const getHumanReadableAggregationStatus = (aggStatus) => {
    switch (aggStatus) {
        case 'WAITING_FOR_AGGREGATION': return 'Waiting for Aggregation';
        case 'GROUPED': return 'Grouped';
        case 'BATCH_CREATED': return 'Batch Created';
        case 'ASSIGNED': return 'Assigned';
        case 'COMPLETED': return 'Delivered';
        default: return aggStatus;
    }
};
exports.getHumanReadableAggregationStatus = getHumanReadableAggregationStatus;
const getBatchHumanReadableStatus = (batchStatus) => {
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
exports.getBatchHumanReadableStatus = getBatchHumanReadableStatus;
const CUSTOMER_NAMES = {
    c1: 'Priya Rajan',
    c2: 'Ramesh Kumar',
    c3: 'Ananya Sharma',
    c4: 'Karthik V'
};

const mapOrderToFrontend = (dbOrder) => {
    const custLegacyId = dbOrder.customer?.legacy_id || dbOrder.customer?.profile?.username;
    const custFullName = (custLegacyId && CUSTOMER_NAMES[custLegacyId]) || dbOrder.customer?.profile?.username || 'Customer';
    return {
        uuid: dbOrder.id,
        id: dbOrder.order_code || dbOrder.id,
        orderId: dbOrder.order_code || dbOrder.id,
        orderCode: dbOrder.order_code || dbOrder.id,
        customerId: dbOrder.customer_id,
        customerLegacyId: custLegacyId,
        customerName: custFullName,
        customerPhone: dbOrder.customer?.profile?.phone,
        customerAddress: dbOrder.delivery_location,
        vendorId: dbOrder.vendor_id,
        vendorName: dbOrder.vendor?.shop_name || 'Vendor',
        items: (dbOrder.order_items || []).map((item) => ({
            productId: item.product?.legacy_id || item.product_id,
            name: item.product?.name || 'Item',
            qty: item.qty,
            price: Number(item.price)
        })),
        total: Number(dbOrder.total),
        orderStatus: dbOrder.order_status,
        status: dbOrder.order_status,
        rawDeliveryStatus: dbOrder.delivery_status,
        deliveryStatus: dbOrder.delivery_status === 'PICKED_UP'
            ? 'Handed Over to Courier'
            : (0, exports.getHumanReadableDeliveryStatus)(dbOrder.order_status),
        aggregationStatus: (0, exports.getHumanReadableAggregationStatus)(dbOrder.aggregation_status),
        pickupLocation: dbOrder.pickup_location,
        deliveryLocation: dbOrder.delivery_location,
        deliveryDate: dbOrder.delivery_date,
        deliveryTimeSlot: dbOrder.delivery_time_slot,
        date: dbOrder.created_at,
        batchId: dbOrder.batch?.batch_code || null,
        deliveryGroupId: dbOrder.batch?.batch_code || null,
        assignedAgentId: dbOrder.assigned_agent_id || dbOrder.assigned_agent?.id || null,
        assignedAgent: dbOrder.assigned_agent ? `${dbOrder.assigned_agent.profile?.username} (${dbOrder.assigned_agent.profile?.phone})` : null
    };
};
exports.mapOrderToFrontend = mapOrderToFrontend;
const CHENNAI_AGENT_PROFILES = {
    da1: {
        residentialAddress: 'No. 14, 2nd Main Road, Gandhi Nagar, Adyar, Chennai - 600020',
        currentArea: 'Adyar / Mylapore',
        depotHub: 'South Chennai Hub (Depot 01 - Adyar)',
        clusterTag: 'CONNECTED: CHENNAI SOUTH DISPATCH CLUSTER 01 (ADYAR & MYLAPORE)',
        emergencyContact: '+91 94440 11223 (Father)',
        bloodGroup: 'O+ Positive',
        plateNumber: 'TN-07-CB-2041'
    },
    da2: {
        residentialAddress: 'No. 58, 1st Cross Street, Vijaya Nagar, Velachery, Chennai - 600042',
        currentArea: 'Velachery / OMR',
        depotHub: 'OMR Logistics Terminal (Depot 02 - Thoraipakkam)',
        clusterTag: 'CONNECTED: CHENNAI SOUTH-EAST DISPATCH CLUSTER 02 (VELACHERY & OMR)',
        emergencyContact: '+91 94441 22334 (Brother)',
        bloodGroup: 'B+ Positive',
        plateNumber: 'TN-09-EV-5512'
    },
    da3: {
        residentialAddress: 'No. 26, 4th Avenue, Shanthi Colony, Anna Nagar, Chennai - 600040',
        currentArea: 'Anna Nagar / Kilpauk',
        depotHub: 'North-West Hub (Depot 03 - Anna Nagar East)',
        clusterTag: 'CONNECTED: CHENNAI NORTH-WEST DISPATCH CLUSTER 03 (ANNA NAGAR & KILPAUK)',
        emergencyContact: '+91 94442 33445 (Spouse)',
        bloodGroup: 'A+ Positive',
        plateNumber: 'TN-02-CD-8891'
    },
    da4: {
        residentialAddress: 'No. 42, 3rd Cross Street, Trustpuram, Kodambakkam, Chennai - 600024',
        currentArea: 'T. Nagar / Kodambakkam',
        depotHub: 'Central Logistics Hub (Depot 04 - Panagal Park)',
        clusterTag: 'CONNECTED: CHENNAI CENTRAL DISPATCH CLUSTER 04 (T. NAGAR & KODAMBAKKAM)',
        emergencyContact: '+91 94443 44556 (Brother)',
        bloodGroup: 'AB+ Positive',
        plateNumber: 'TN-01-AB-1234'
    }
};

const mapAgentToFrontend = (dbAgent) => {
    const key = (dbAgent.legacy_id || dbAgent.profile?.username || dbAgent.id || '').toLowerCase();
    const specific = CHENNAI_AGENT_PROFILES[key] || {};
    const area = dbAgent.current_area || specific.currentArea || 'Central Chennai';

    let defaultAddress = specific.residentialAddress;
    if (!defaultAddress) {
        if (/adyar|mylapore/i.test(area)) defaultAddress = 'No. 14, 2nd Main Road, Gandhi Nagar, Adyar, Chennai - 600020';
        else if (/velachery|omr|thoraipakkam/i.test(area)) defaultAddress = 'No. 58, 1st Cross Street, Vijaya Nagar, Velachery, Chennai - 600042';
        else if (/anna nagar|kilpauk|shenoy/i.test(area)) defaultAddress = 'No. 26, 4th Avenue, Shanthi Colony, Anna Nagar, Chennai - 600040';
        else defaultAddress = 'No. 42, 3rd Cross Street, Trustpuram, Kodambakkam, Chennai - 600024';
    }

    return {
        uuid: dbAgent.id,
        id: dbAgent.id,
        legacy_id: dbAgent.legacy_id || key,
        name: dbAgent.profile?.username || 'Agent',
        username: dbAgent.profile?.username || key,
        phone: dbAgent.profile?.phone || '9988776655',
        email: dbAgent.profile?.email,
        currentArea: area,
        assignedArea: area,
        residentialAddress: defaultAddress,
        depotHub: specific.depotHub || `Logistics Depot (${area})`,
        clusterTag: specific.clusterTag || `CONNECTED: CHENNAI DISPATCH CLUSTER (${area.toUpperCase()})`,
        emergencyContact: specific.emergencyContact || '+91 94440 99887 (Family)',
        bloodGroup: specific.bloodGroup || 'O+ Positive',
        plateNumber: specific.plateNumber || 'TN-01-FL-8820',
        capacity: dbAgent.capacity || 5,
        currentOrders: dbAgent.current_orders || 0,
        availability: dbAgent.availability || 'Available',
        status: dbAgent.status || 'Available',
        vehicle: dbAgent.vehicle || (specific.plateNumber ? `EV Cargo (${specific.plateNumber})` : 'Electric Cargo Scooter'),
        rating: dbAgent.rating || 4.95
    };
};
exports.mapAgentToFrontend = mapAgentToFrontend;
const mapBatchToFrontend = (dbBatch) => {
    const rawOrders = dbBatch.orders || [];
    const orderCodes = rawOrders.map((o) => o.order_code || o.id);
    const sellerIds = Array.from(new Set(rawOrders.map((o) => o.vendor_id || (o.vendor && o.vendor.id))));
    const sellerNames = Array.from(new Set(rawOrders.map((o) => (o.vendor && o.vendor.shop_name) || o.vendorName || 'Vendor')));
    const pickupLocations = Array.from(new Set(rawOrders.map((o) => o.pickup_location)));
    const deliveryLocations = Array.from(new Set(rawOrders.map((o) => o.delivery_location)));
    const mappedOrders = rawOrders.map((o) => (0, exports.mapOrderToFrontend)(o));
    const sortedWaypoints = (dbBatch.batch_waypoints || []).slice().sort((a, b) => (a.sequence_index || 0) - (b.sequence_index || 0));

    return {
        uuid: dbBatch.id,
        id: dbBatch.batch_code,
        batchId: dbBatch.batch_code,
        batchCode: dbBatch.batch_code,
        orderIds: orderCodes,
        orders: mappedOrders,
        waypoints: sortedWaypoints,
        sellerIds,
        sellerNames,
        agentId: dbBatch.agent_id,
        agentName: dbBatch.agent?.profile?.username || null,
        agentPhone: dbBatch.agent?.profile?.phone || null,
        pickupLocations,
        deliveryLocations,
        deliveryDate: dbBatch.delivery_date,
        deliverySlot: dbBatch.delivery_slot,
        orderCount: dbBatch.order_count,
        estimatedDistance: dbBatch.estimated_distance,
        estimatedTime: dbBatch.estimated_time,
        rawStatus: dbBatch.status,
        status: (0, exports.getBatchHumanReadableStatus)(dbBatch.status),
        rawStatus: dbBatch.status,
        aggregationStatus: (0, exports.getHumanReadableAggregationStatus)(dbBatch.aggregation_status),
        rawAggregationStatus: dbBatch.aggregation_status
    };
};
exports.mapBatchToFrontend = mapBatchToFrontend;


const mapCustomerToFrontend = (dbCustomer) => {
    const legacyId = dbCustomer.legacy_id || dbCustomer.profile?.username || 'c1';
    const fullName = CUSTOMER_NAMES[legacyId] || dbCustomer.profile?.username || 'Customer';
    return {
        uuid: dbCustomer.id,
        id: dbCustomer.id,
        legacy_id: legacyId,
        legacyId: legacyId,
        name: fullName,
        username: dbCustomer.profile?.username || legacyId,
        email: dbCustomer.profile?.email,
        phone: dbCustomer.profile?.phone ? (dbCustomer.profile.phone.startsWith('+91') ? dbCustomer.profile.phone : `+91 ${dbCustomer.profile.phone}`) : '+91 98765 43210',
        role: dbCustomer.profile?.role || 'customer',
        address: dbCustomer.address,
        area: dbCustomer.area,
        status: dbCustomer.status || 'Active',
        totalOrders: dbCustomer.total_orders,
        activeOrders: dbCustomer.active_orders,
        lat: dbCustomer.lat,
        lng: dbCustomer.lng,
        avatar: dbCustomer.avatar
    };
};
exports.mapCustomerToFrontend = mapCustomerToFrontend;
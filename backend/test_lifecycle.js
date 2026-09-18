const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const API_URL = 'http://localhost:5000/api/v1';

async function loginAs(identifier) {
  const resolveRes = await axios.post(`${API_URL}/auth/resolve`, { identifier });
  const { data } = await supabase.auth.signInWithPassword({
    email: resolveRes.data.email,
    password: 'password123'
  });
  return data.session.access_token;
}

async function runLifecycle() {
  console.log("=== STARTING PHASE 3 LIFECYCLE TEST ===");
  try {
    // 1. Customer Product Selection
    console.log("\n[1] Customer logs in and views products...");
    const customerToken = await loginAs('priyarajan');
    const productsRes = await axios.get(`${API_URL}/products`, { headers: { Authorization: `Bearer ${customerToken}` } });
    const product = productsRes.data.data[0];
    console.log(`PASS: Found product ${product.name} (ID: ${product.id})`);

    // 2. Order Creation
    console.log("\n[2] Customer creates an order...");
    const orderPayload = {
      vendorId: product.vendorId,
      items: [{ productId: product.id, qty: 2, price: product.price }],
      deliveryLocation: 'Test Location',
      deliveryDate: '2026-10-01',
      deliveryTimeSlot: '10:00 AM - 1:00 PM'
    };
    const orderRes = await axios.post(`${API_URL}/orders`, orderPayload, { headers: { Authorization: `Bearer ${customerToken}` } });
    const orderId = orderRes.data.data.orderId;
    console.log(`PASS: Order created with ID: ${orderId}`);

    // 3. Vendor Order Processing
    console.log("\n[3] Vendor logs in and processes the order...");
    const vendorToken = await loginAs('v1');
    const vendorOrdersRes = await axios.get(`${API_URL}/orders`, { headers: { Authorization: `Bearer ${vendorToken}` } });
    const vendorOrder = vendorOrdersRes.data.data.find(o => o.id === orderId);
    if (!vendorOrder) throw new Error("Vendor cannot see the order");
    
    await axios.patch(`${API_URL}/orders/${orderId}/status`, { status: 'READY_FOR_DELIVERY' }, { headers: { Authorization: `Bearer ${vendorToken}` } });
    console.log(`PASS: Vendor successfully updated order status to READY_FOR_DELIVERY`);

    // 4. Admin Delivery Batch
    console.log("\n[4] Admin logs in and creates a delivery batch...");
    const adminToken = await loginAs('admin');
    const batchPayload = {
      orderIds: [orderId],
      zone: 'Chennai Central',
      date: '2026-10-01'
    };
    const batchRes = await axios.post(`${API_URL}/delivery/batches`, batchPayload, { headers: { Authorization: `Bearer ${adminToken}` } });
    const batchCode = batchRes.data.data.batchId;
    console.log(`PASS: Admin created delivery batch: ${batchCode}`);

    // 5. Agent Assignment
    console.log("\n[5] Admin assigns agent to batch...");
    await axios.post(`${API_URL}/delivery/batches/${batchCode}/assign`, { agentId: 'da1' }, { headers: { Authorization: `Bearer ${adminToken}` } });
    console.log(`PASS: Agent assigned to batch successfully`);

    // 6. Delivery Status Updates
    console.log("\n[6] Agent logs in and updates delivery status...");
    const agentToken = await loginAs('da1');
    await axios.patch(`${API_URL}/delivery/batches/${batchCode}/status`, { status: 'Out for Delivery' }, { headers: { Authorization: `Bearer ${agentToken}` } });
    console.log(`PASS: Agent updated batch status to OUT_FOR_DELIVERY`);
    
    await axios.patch(`${API_URL}/delivery/batches/${batchCode}/status`, { status: 'Delivered' }, { headers: { Authorization: `Bearer ${agentToken}` } });
    console.log(`PASS: Agent updated batch status to DELIVERED`);

    // 7. Verify Data Consistency
    console.log("\n[7] Verifying data consistency...");
    const finalOrderRes = await axios.get(`${API_URL}/orders/${orderId}`, { headers: { Authorization: `Bearer ${adminToken}` } });
    const finalOrder = finalOrderRes.data.data;
    console.log("Final order data:", finalOrder);
    if (finalOrder.status !== 'DELIVERED') throw new Error("Order status inconsistency");
    if (finalOrder.deliveryStatus !== 'Delivered to Customer') throw new Error("Delivery status inconsistency: expected 'Delivered to Customer', got " + finalOrder.deliveryStatus);
    if (finalOrder.aggregationStatus !== 'Delivered') throw new Error("Aggregation status inconsistency: expected 'Delivered', got " + finalOrder.aggregationStatus);
    console.log(`PASS: Final order statuses are consistent (${finalOrder.status}, ${finalOrder.deliveryStatus}, ${finalOrder.aggregationStatus})`);

    console.log("\n=== LIFECYCLE TEST COMPLETE: ALL PASSED ===");

  } catch (err) {
    console.error("\nFAIL:", err.response?.data?.message || err.message);
  }
}

runLifecycle();

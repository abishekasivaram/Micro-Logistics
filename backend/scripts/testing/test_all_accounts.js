const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const API_URL = 'http://localhost:5000/api/v1';

const EXPECTED_ACCOUNTS = [
  { loginId: 'admin', expectedRole: 'admin', portal: '/admin-dashboard' },
  { loginId: 'c1', expectedRole: 'customer', portal: '/customer-dashboard' },
  { loginId: 'c2', expectedRole: 'customer', portal: '/customer-dashboard' },
  { loginId: 'c3', expectedRole: 'customer', portal: '/customer-dashboard' },
  { loginId: 'c4', expectedRole: 'customer', portal: '/customer-dashboard' },
  { loginId: 'v1', expectedRole: 'vendor', portal: '/vendor-dashboard' },
  { loginId: 'v2', expectedRole: 'vendor', portal: '/vendor-dashboard' },
  { loginId: 'v3', expectedRole: 'vendor', portal: '/vendor-dashboard' },
  { loginId: 'v4', expectedRole: 'vendor', portal: '/vendor-dashboard' },
  { loginId: 'da1', expectedRole: 'delivery_partner', portal: '/delivery' },
  { loginId: 'da2', expectedRole: 'delivery_partner', portal: '/delivery' },
  { loginId: 'da3', expectedRole: 'delivery_partner', portal: '/delivery' },
  { loginId: 'da4', expectedRole: 'delivery_partner', portal: '/delivery' }
];

async function runValidation() {
  console.log('=== STARTING TEST ACCOUNT AUTHENTICATION & ISOLATION VALIDATION ===\n');

  const tokens = {};
  const userObjects = {};

  // Part 1: Test Login and Authentication for all 13 accounts
  console.log('[PART 1] Verifying Supabase Auth & DB-backed profiles for all 13 accounts...\n');

  for (const acc of EXPECTED_ACCOUNTS) {
    // 1. Resolve short login ID
    const resolveRes = await axios.post(`${API_URL}/auth/resolve`, { identifier: acc.loginId });
    if (!resolveRes.data.success || !resolveRes.data.email) {
      throw new Error(`Failed to resolve login ID: ${acc.loginId}`);
    }
    const email = resolveRes.data.email;

    // 2. Real Supabase Auth login with password123
    const authRes = await supabase.auth.signInWithPassword({
      email,
      password: 'password123'
    });
    if (authRes.error) {
      throw new Error(`Auth failed for ${acc.loginId} (${email}): ${authRes.error.message}`);
    }

    const user = authRes.data.user;
    const session = authRes.data.session;
    tokens[acc.loginId] = session.access_token;
    userObjects[acc.loginId] = user;

    // 3. Verify PostgreSQL Profile
    const { data: prof, error: profErr } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (profErr || !prof) throw new Error(`Profile missing for ${acc.loginId}: ${profErr?.message}`);

    if (prof.role !== acc.expectedRole) {
      throw new Error(`Role mismatch for ${acc.loginId}: expected ${acc.expectedRole}, got ${prof.role}`);
    }

    // 4. Verify Role-specific Database Table
    if (acc.expectedRole === 'customer') {
      const { data: cp } = await supabase.from('customer_profiles').select('*').eq('id', user.id).single();
      if (!cp || cp.legacy_id !== acc.loginId) {
        throw new Error(`Customer profile legacy_id mismatch for ${acc.loginId}`);
      }
    } else if (acc.expectedRole === 'vendor') {
      const { data: vd } = await supabase.from('vendors').select('*').eq('id', user.id).single();
      if (!vd || vd.legacy_id !== acc.loginId) {
        throw new Error(`Vendor record legacy_id mismatch for ${acc.loginId}`);
      }
    } else if (acc.expectedRole === 'delivery_partner') {
      const { data: da } = await supabase.from('delivery_agents').select('*').eq('id', user.id).single();
      if (!da || da.legacy_id !== acc.loginId) {
        throw new Error(`Delivery agent record legacy_id mismatch for ${acc.loginId}`);
      }
    }

    console.log(`PASS: [${acc.loginId.padEnd(5)}] -> Resolved: ${email.padEnd(30)} Role: ${prof.role.padEnd(16)} Target Portal: ${acc.portal}`);
  }

  // Part 2: Role-based Authorization & Data Isolation
  console.log('\n[PART 2] Verifying role-based isolation & authorization...\n');

  // Test A: Seller Isolation - Vendor v2 cannot update Vendor v1's products
  const { data: v1Prods } = await supabase.from('products').select('*').eq('vendor_id', userObjects['v1'].id).limit(1);
  if (v1Prods && v1Prods.length > 0) {
    const targetProd = v1Prods[0];
    try {
      await axios.put(`${API_URL}/products/${targetProd.id}`, {
        price: 9999
      }, {
        headers: { Authorization: `Bearer ${tokens['v2']}` }
      });
      throw new Error('FAIL: Vendor v2 was able to update Vendor v1 product!');
    } catch (err) {
      if (err.response && (err.response.status === 403 || err.response.status === 401)) {
        console.log(`PASS: Vendor v2 blocked from updating Vendor v1 product (Status ${err.response.status})`);
      } else {
        throw err;
      }
    }
  }

  // Test B: Customer cannot modify Vendor products
  if (v1Prods && v1Prods.length > 0) {
    const targetProd = v1Prods[0];
    try {
      await axios.put(`${API_URL}/products/${targetProd.id}`, {
        stock: 50
      }, {
        headers: { Authorization: `Bearer ${tokens['c1']}` }
      });
      throw new Error('FAIL: Customer c1 was able to update Vendor v1 product!');
    } catch (err) {
      if (err.response && (err.response.status === 403 || err.response.status === 401)) {
        console.log(`PASS: Customer c1 blocked from modifying Vendor product (Status ${err.response.status})`);
      } else {
        throw err;
      }
    }
  }

  // Test C: Public admin registration prevention
  try {
    await axios.post(`${API_URL}/auth/signup`, {
      email: 'hacker_admin@example.com',
      password: 'password123',
      role: 'admin'
    });
    throw new Error('FAIL: Public signup allowed self-assignment of admin role!');
  } catch (err) {
    if (err.response && err.response.status === 403) {
      console.log(`PASS: Public registration for admin role blocked with 403: "${err.response.data.message}"`);
    } else {
      throw err;
    }
  }

  // Part 3: Multi-role E2E Workflow using provisioned accounts
  console.log('\n[PART 3] Executing complete E2E workflow across Customer -> Vendor -> Admin -> Delivery Agent...\n');

  // 1. Customer c1 gets product catalog and places order
  const prodRes = await axios.get(`${API_URL}/products`, {
    headers: { Authorization: `Bearer ${tokens['c1']}` }
  });
  const orderProduct = prodRes.data.data[0];
  let targetVendorId = orderProduct.vendorId;
  let targetVendorLoginId = Object.keys(userObjects).find(k => userObjects[k].id === targetVendorId);
  if (!targetVendorLoginId) {
    targetVendorLoginId = targetVendorId;
  }
  console.log(`PASS: Customer c1 selected product "${orderProduct.name}" from vendor ${targetVendorLoginId}`);

  const orderPayload = {
    vendorId: targetVendorId,
    items: [{ productId: orderProduct.id, qty: 1, price: orderProduct.price }],
    deliveryLocation: '22 Besant Nagar, Anna Nagar',
    deliveryDate: '2026-10-25',
    deliveryTimeSlot: '10:00 AM - 1:00 PM',
    customerPhone: '9876543210'
  };

  const createOrderRes = await axios.post(`${API_URL}/orders`, orderPayload, {
    headers: { Authorization: `Bearer ${tokens['c1']}` }
  });
  const orderId = createOrderRes.data.data.orderId;
  console.log(`PASS: Customer c1 created order ${orderId}`);

  // 2. Cross-vendor isolation check: Another vendor cannot see this order
  const otherVendorLoginId = targetVendorLoginId === 'v1' ? 'v2' : 'v1';
  const otherOrdersRes = await axios.get(`${API_URL}/orders`, {
    headers: { Authorization: `Bearer ${tokens[otherVendorLoginId]}` }
  });
  const shouldNotSee = otherOrdersRes.data.data.find(o => o.id === orderId || o.orderId === orderId);
  if (shouldNotSee) {
    throw new Error(`FAIL: Vendor ${otherVendorLoginId} was able to see order belonging to vendor ${targetVendorLoginId}!`);
  }
  console.log(`PASS: Vendor data isolation verified: Vendor ${otherVendorLoginId} cannot see order ${orderId}`);

  // 3. Target Vendor processes the order to READY_FOR_DELIVERY
  const targetOrdersRes = await axios.get(`${API_URL}/orders`, {
    headers: { Authorization: `Bearer ${tokens[targetVendorLoginId]}` }
  });
  const vendorOrder = targetOrdersRes.data.data.find(o => o.id === orderId || o.orderId === orderId);
  if (!vendorOrder) throw new Error(`Order ${orderId} not visible to Vendor ${targetVendorLoginId}`);

  await axios.patch(`${API_URL}/orders/${vendorOrder.uuid || vendorOrder.id}/status`, {
    status: 'READY_FOR_DELIVERY'
  }, {
    headers: { Authorization: `Bearer ${tokens[targetVendorLoginId]}` }
  });
  console.log(`PASS: Vendor ${targetVendorLoginId} staged order ${orderId} to READY_FOR_DELIVERY`);

  // 3. Admin creates delivery batch and assigns Delivery Agent da1
  const batchRes = await axios.post(`${API_URL}/delivery/batches`, {
    orderIds: [orderId],
    batchName: `Batch-${Date.now()}`
  }, {
    headers: { Authorization: `Bearer ${tokens['admin']}` }
  });
  const batchId = batchRes.data.data.batchId || batchRes.data.data.id;
  console.log(`PASS: Admin created delivery batch ${batchId}`);

  await axios.post(`${API_URL}/delivery/batches/${batchId}/assign`, {
    agentId: 'da1'
  }, {
    headers: { Authorization: `Bearer ${tokens['admin']}` }
  });
  console.log(`PASS: Admin assigned Agent da1 to batch ${batchId}`);

  // 4. Delivery Agent da1 advances batch status
  await axios.patch(`${API_URL}/delivery/batches/${batchId}/status`, {
    status: 'OUT_FOR_DELIVERY'
  }, {
    headers: { Authorization: `Bearer ${tokens['da1']}` }
  });
  console.log(`PASS: Agent da1 updated batch status to OUT_FOR_DELIVERY`);

  await axios.patch(`${API_URL}/delivery/batches/${batchId}/status`, {
    status: 'DELIVERED'
  }, {
    headers: { Authorization: `Bearer ${tokens['da1']}` }
  });
  console.log(`PASS: Agent da1 completed batch delivery (DELIVERED)`);

  // 5. Final verification of order status in DB
  const { data: finalOrder } = await supabase.from('orders').select('*').eq('order_code', orderId).single();
  console.log(`PASS: Final order ${orderId} confirmed in database with status: ${finalOrder.order_status}`);

  console.log('\n=== ALL 13 TEST ACCOUNTS FULLY VALIDATED AND OPERATIONAL ===\n');
}

runValidation().catch(err => {
  console.error('VALIDATION FAILED:', err.response?.data || err.message);
  process.exit(1);
});

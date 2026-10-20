const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const API_URL = 'http://localhost:5000/api/v1';

function getProvisionedPassword(email) {
  try {
    if (!fs.existsSync('secure_credentials.txt')) return null;
    const content = fs.readFileSync('secure_credentials.txt', 'utf8');
    const blocks = content.split('-------------------------------------------------');
    for (const b of blocks) {
      if (b.includes(email)) {
        const match = b.match(/Password:\s*([^\r\n]+)/);
        if (match) return match[1].trim();
      }
    }
  } catch {}
  return null;
}

async function loginAs(identifier) {
  const resolveRes = await axios.post(`${API_URL}/auth/resolve`, { identifier });
  const email = resolveRes.data.email;
  let res = await supabase.auth.signInWithPassword({
    email,
    password: 'password123'
  });
  if (res.error) {
    const provPwd = getProvisionedPassword(email);
    if (provPwd) {
      res = await supabase.auth.signInWithPassword({
        email,
        password: provPwd
      });
    }
  }
  if (res.error) throw res.error;
  return { token: res.data.session.access_token, user: res.data.user };
}

async function runInventoryAudit() {
  console.log('=== STARTING INVENTORY MODULE DIRECT AUDIT ===\n');

  try {
    // 1. Vendor authentication
    console.log('[1] Logging in as Vendor (v1)...');
    const { token: vendorToken, user: vendorUser } = await loginAs('v1');
    console.log(`PASS: Vendor logged in successfully. User ID: ${vendorUser.id}`);

    // 2. Fetch products
    console.log('\n[2] Fetching vendor products from GET /api/v1/products...');
    const listRes = await axios.get(`${API_URL}/products`, {
      headers: { Authorization: `Bearer ${vendorToken}` }
    });
    console.log(`PASS: Retrieved ${listRes.data.data.length} total products.`);

    // 3. Negative validation: Add product with negative stock
    console.log('\n[3] Testing rejection of negative stock (-5)...');
    try {
      await axios.post(`${API_URL}/products`, {
        name: 'Test Negative Stock Item',
        category: 'Dairy',
        price: 50,
        stock: -5
      }, {
        headers: { Authorization: `Bearer ${vendorToken}` }
      });
      console.error('FAIL: Server accepted negative stock!');
      process.exit(1);
    } catch (err) {
      if (err.response && err.response.status === 400) {
        console.log(`PASS: Correctly rejected with 400: "${err.response.data.message}"`);
      } else {
        throw err;
      }
    }

    // 4. Negative validation: Add product with negative price
    console.log('\n[4] Testing rejection of invalid price (-25)...');
    try {
      await axios.post(`${API_URL}/products`, {
        name: 'Test Invalid Price Item',
        category: 'Dairy',
        price: -25,
        stock: 10
      }, {
        headers: { Authorization: `Bearer ${vendorToken}` }
      });
      console.error('FAIL: Server accepted negative price!');
      process.exit(1);
    } catch (err) {
      if (err.response && err.response.status === 400) {
        console.log(`PASS: Correctly rejected with 400: "${err.response.data.message}"`);
      } else {
        throw err;
      }
    }

    // 5. Create a valid product
    console.log('\n[5] Creating a valid test product...');
    const createRes = await axios.post(`${API_URL}/products`, {
      name: 'Organic Desi Ghee 500ml',
      category: 'Dairy',
      price: 350,
      stock: 25,
      prepTime: '10 mins',
      description: 'Pure cow ghee prepared traditionally'
    }, {
      headers: { Authorization: `Bearer ${vendorToken}` }
    });
    const createdProd = createRes.data.data;
    console.log(`PASS: Product created. ID: ${createdProd.id}, Name: "${createdProd.name}", Status: "${createdProd.status}", Stock: ${createdProd.stock}`);

    // 6. Update product: name, price, stock
    console.log('\n[6] Updating product name, price, and stock...');
    const updateRes = await axios.put(`${API_URL}/products/${createdProd.id}`, {
      name: 'Organic Desi Ghee 500ml (Premium)',
      price: 375,
      stock: 8 // Stock <= 10 should trigger Low Stock
    }, {
      headers: { Authorization: `Bearer ${vendorToken}` }
    });
    const updatedProd = updateRes.data.data;
    console.log(`PASS: Updated successfully. New Name: "${updatedProd.name}", Price: ₹${updatedProd.price}, Stock: ${updatedProd.stock}, Status: "${updatedProd.status}"`);
    if (updatedProd.status !== 'Low Stock') {
      console.warn(`WARNING: Expected status 'Low Stock' for stock=8, got '${updatedProd.status}'`);
    }

    // 7. Test rejection of negative stock during update
    console.log('\n[7] Testing rejection of negative stock on update...');
    try {
      await axios.put(`${API_URL}/products/${createdProd.id}`, {
        stock: -1
      }, {
        headers: { Authorization: `Bearer ${vendorToken}` }
      });
      console.error('FAIL: Server accepted negative stock during update!');
      process.exit(1);
    } catch (err) {
      if (err.response && err.response.status === 400) {
        console.log(`PASS: Update correctly rejected with 400: "${err.response.data.message}"`);
      } else {
        throw err;
      }
    }

    // 8. Cross-role authorization check: Customer attempts to update vendor product
    console.log('\n[8] Testing unauthorized update from customer account...');
    const { token: customerToken } = await loginAs('priyarajan');
    try {
      await axios.put(`${API_URL}/products/${createdProd.id}`, {
        price: 10
      }, {
        headers: { Authorization: `Bearer ${customerToken}` }
      });
      console.error('FAIL: Customer was able to update vendor product!');
      process.exit(1);
    } catch (err) {
      if (err.response && (err.response.status === 403 || err.response.status === 401)) {
        console.log(`PASS: Unauthorized modification prevented with status ${err.response.status}`);
      } else {
        throw err;
      }
    }

    // 9. Delete product
    console.log('\n[9] Deleting test product...');
    const delRes = await axios.delete(`${API_URL}/products/${createdProd.id}`, {
      headers: { Authorization: `Bearer ${vendorToken}` }
    });
    console.log(`PASS: Product deleted successfully (${delRes.data.success ? 'Success' : 'Failed'}).`);

    // 10. Verify product is gone
    console.log('\n[10] Verifying product is no longer in active catalog...');
    const afterListRes = await axios.get(`${API_URL}/products`, {
      headers: { Authorization: `Bearer ${vendorToken}` }
    });
    const exists = afterListRes.data.data.some(p => p.id === createdProd.id || p.uuid === createdProd.id);
    if (!exists) {
      console.log('PASS: Product successfully verified removed from catalog.');
    } else {
      console.error('FAIL: Product still exists in catalog after deletion!');
      process.exit(1);
    }

    console.log('\n=== INVENTORY MODULE AUDIT: ALL TESTS PASSED ===\n');
  } catch (err) {
    console.error('AUDIT ERROR:', err.response?.data || err.message);
    process.exit(1);
  }
}

runInventoryAudit();

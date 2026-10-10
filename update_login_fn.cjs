const fs = require('fs');
const path = 'src/auth/LoginPage.jsx';
let content = fs.readFileSync(path, 'utf8');

const replace1 = `  const handleDemoLogin = (role) => {
    const demoUsers = {
      customer: { id: 'demo-cust', email: 'demo@customer.local', name: 'Demo Customer', username: 'demo_customer', isDemo: true },
      vendor: { id: 'demo-vend', email: 'demo@vendor.local', name: 'Demo Vendor', username: 'demo_vendor', isDemo: true, shop_name: 'Demo Vendor' },
      admin: { id: 'demo-admin', email: 'demo@admin.local', name: 'Demo Admin', username: 'demo_admin', isDemo: true },
      delivery_partner: { id: 'demo-dp', email: 'demo@delivery.local', name: 'Demo Agent', username: 'demo_dp', isDemo: true },
    };
    const userObj = demoUsers[role];
    setCurrentUser({ ...userObj, role });
    
    if (role === 'customer') navigate('/customer-dashboard');
    else if (role === 'vendor') navigate('/vendor-dashboard');
    else if (role === 'admin') navigate('/admin-dashboard');
    else if (role === 'delivery_partner') navigate('/delivery');
  };`;

content = content.replace(/  const fillDemoAccount = \(id, pwd\) => \{[\s\S]*?\};\r?\n/, replace1 + '\n');

fs.writeFileSync(path, content, 'utf8');
console.log('LoginPage function replaced successfully');

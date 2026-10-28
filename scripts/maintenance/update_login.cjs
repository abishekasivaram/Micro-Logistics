const fs = require('fs');
const path = 'src/auth/LoginPage.jsx';
let content = fs.readFileSync(path, 'utf8');

const target1 = `  const fillDemoAccount = (id, pwd) => {
    setUsernameOrEmail(id);
    setPassword(pwd);
    setErrorMsg('');
  };`;
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

content = content.replace(target1.replace(/\r\n/g, '\n'), replace1);
content = content.replace(target1, replace1);

const replace2 = `<div className="demo-pills">
              <button type="button" className="demo-pill" onClick={() => handleDemoLogin('customer')} title="Explore Customer Portal">Customer</button>
              <button type="button" className="demo-pill" onClick={() => handleDemoLogin('vendor')} title="Explore Seller Portal">Seller</button>
              <button type="button" className="demo-pill" onClick={() => handleDemoLogin('admin')} title="Explore Admin Portal">Admin</button>
              <button type="button" className="demo-pill" onClick={() => handleDemoLogin('delivery_partner')} title="Explore Delivery Portal">Delivery</button>
            </div>`;

content = content.replace(/<div className="demo-pills">[\s\S]*?<\/div>/, replace2);

fs.writeFileSync(path, content, 'utf8');
console.log('LoginPage replaced successfully');

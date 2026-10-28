const fs = require('fs');

function replaceInFile(file, replacements) {
    let content = fs.readFileSync(file, 'utf8');
    replacements.forEach(r => {
        content = content.split(r.from).join(r.to);
    });
    fs.writeFileSync(file, content);
}

replaceInFile('c:/Users/Admin/Desktop/Micro-Logistics/src/context/AppContext.jsx', [
    { from: "const vId = item.product.vendorId || 'v1';", to: "const vId = item.product.vendorId;" },
    { from: "vendorId: currentUser?.role === 'vendor' ? currentUser.id : (product.vendorId || 'v1')", to: "vendorId: currentUser?.role === 'vendor' ? currentUser.id : product.vendorId" }
]);

replaceInFile('c:/Users/Admin/Desktop/Micro-Logistics/src/portals/seller/ProductsPage.jsx', [
    { from: "const sellerId = currentUser?.role === 'vendor' ? currentUser.id : 'v1';", to: "const sellerId = currentUser?.role === 'vendor' ? currentUser.id : null;" },
    { from: "return p.vendorId === sellerId || p.vendorId === 'v1';", to: "return p.vendorId === sellerId;" }
]);

replaceInFile('c:/Users/Admin/Desktop/Micro-Logistics/src/portals/seller/InventoryPage.jsx', [
    { from: "const sellerId = isVendor ? currentUser.id : 'v1';", to: "const sellerId = isVendor ? currentUser.id : null;" },
    { from: "return p.vendorId === sellerId || p.vendorId === 'v1';", to: "return p.vendorId === sellerId;" }
]);

replaceInFile('c:/Users/Admin/Desktop/Micro-Logistics/src/portals/seller/DashboardOverview.jsx', [
    { from: "const sellerId = currentUser?.role === 'vendor' ? currentUser.id : 'v1';", to: "const sellerId = currentUser?.role === 'vendor' ? currentUser.id : null;" }
]);

replaceInFile('c:/Users/Admin/Desktop/Micro-Logistics/src/portals/seller/CustomersPage.jsx', [
    { from: "const sellerId = currentUser?.role === 'vendor' ? currentUser.id : 'v1';", to: "const sellerId = currentUser?.role === 'vendor' ? currentUser.id : null;" },
    { from: "(currentUser?.role === 'admin' || o.vendorId === sellerId || o.vendorId === 'v1')", to: "(currentUser?.role === 'admin' || o.vendorId === sellerId)" }
]);

replaceInFile('c:/Users/Admin/Desktop/Micro-Logistics/src/portals/customer/ProfilePage.jsx', [
    { from: "vendorId: 'v1'", to: "vendorId: p.vendor_id || p.vendorId" }
]);

replaceInFile('c:/Users/Admin/Desktop/Micro-Logistics/src/lib/deliveryData.js', [
    { from: "vendorId: 'v1',", to: "" }
]);

console.log('Fallbacks removed');

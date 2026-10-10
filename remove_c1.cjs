const fs = require('fs');

function replaceInFile(file, replacements) {
    let content = fs.readFileSync(file, 'utf8');
    replacements.forEach(r => {
        content = content.split(r.from).join(r.to);
    });
    fs.writeFileSync(file, content);
}

replaceInFile('c:/Users/Admin/Desktop/Micro-Logistics/src/portals/customer/CustomerDashboard.jsx', [
    { from: "const customerId = currentUser?.id || 'c1';", to: "const customerId = currentUser?.id || null;" }
]);

replaceInFile('c:/Users/Admin/Desktop/Micro-Logistics/src/portals/seller/DeliveriesPage.jsx', [
    { 
      from: `      customers: uniqueCustomers.length > 0 ? uniqueCustomers : [\r\n        { id: 'c1', name: 'Priyarajan M', address: '12/4 RS Puram East Zone' },\r\n        { id: 'c2', name: 'Sivakumar R', address: '45 Cross Cut Road, Gandhipuram' }\r\n      ]`, 
      to: `      customers: uniqueCustomers`
    },
    { 
      from: `      customers: uniqueCustomers.length > 0 ? uniqueCustomers : [\n        { id: 'c1', name: 'Priyarajan M', address: '12/4 RS Puram East Zone' },\n        { id: 'c2', name: 'Sivakumar R', address: '45 Cross Cut Road, Gandhipuram' }\n      ]`, 
      to: `      customers: uniqueCustomers`
    }
]);

console.log('c1 fallbacks removed');

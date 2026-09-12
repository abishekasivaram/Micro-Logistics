import React from 'react';
import './OrdersPage.css';

const HelpPage = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Help & Support</h2>
          <p>Find answers to common questions and support resources.</p>
        </div>
      </div>

      <div className="card" style={{ padding: 'var(--spacing-6)' }}>
        <h3 className="mb-4 text-lg font-medium">Frequently Asked Questions</h3>
        <div className="flex flex-col gap-4 mt-4">
          <div className="border-b pb-4">
            <h4 className="font-medium">How do I aggregate orders?</h4>
            <p className="text-secondary text-sm mt-1">Navigate to the Orders page, select the pending orders you wish to group, and click "Aggregate Orders". This will bring you to the map planning view where you can verify the route and assign a delivery driver.</p>
          </div>
          <div className="border-b pb-4">
            <h4 className="font-medium">How do I add a new product?</h4>
            <p className="text-secondary text-sm mt-1">Go to the Products page and click the "Add Product" button in the top right corner. Fill in the product details and save.</p>
          </div>
          <div>
            <h4 className="font-medium">Contact Support</h4>
            <p className="text-secondary text-sm mt-1">If you need further assistance, please contact your platform administrator or email support@micrologi.example.com.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;

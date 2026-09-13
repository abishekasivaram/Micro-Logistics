import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import PickupCard from '../../components/delivery/PickupCard';

const PickupPage = () => {
  const { currentUser, getAgentBatches, getAgentOrders, confirmOrderPickup } = useAppContext();
  
  // Data Isolation
  const myBatches = getAgentBatches(currentUser?.id);
  const activeBatches = myBatches.filter(b => b.status !== 'Completed' && b.status !== 'Delivered');
  const activeBatch = activeBatches.length > 0 ? activeBatches[0] : null;
  
  const myOrders = activeBatch ? getAgentOrders(currentUser?.id).filter(o => activeBatch.orderIds.includes(o.id)) : [];

  // Group orders by vendor/seller to show one pickup card per seller
  const pickupsBySeller = myOrders.reduce((acc, order) => {
    if (!acc[order.vendorId]) {
      acc[order.vendorId] = {
        sellerName: order.vendorName,
        location: order.pickupLocation,
        orders: [],
        allConfirmed: true
      };
    }
    acc[order.vendorId].orders.push(order);
    if (order.status !== 'PICKED_UP' && order.status !== 'OUT_FOR_DELIVERY' && order.status !== 'DELIVERED') {
      acc[order.vendorId].allConfirmed = false;
    }
    return acc;
  }, {});

  const handleConfirmPickup = (sellerId) => {
    const sellerData = pickupsBySeller[sellerId];
    sellerData.orders.forEach(o => {
      if (o.status !== 'PICKED_UP' && o.status !== 'OUT_FOR_DELIVERY' && o.status !== 'DELIVERED') {
        confirmOrderPickup(o.id);
      }
    });
  };

  if (!activeBatch) {
    return (
      <div className="page-container">
        <h2>Pickup Routine</h2>
        <div className="card text-center text-secondary" style={{ padding: '40px' }}>
          <p>No active delivery batch. You have no pending pickups.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <h2>Pickup Routine</h2>
        <p className="text-secondary">Batch {activeBatch.batchId}</p>
      </div>

      <div style={{ maxWidth: '600px' }}>
        {Object.entries(pickupsBySeller).map(([sellerId, data], index) => (
          <div key={sellerId} style={{ marginBottom: '20px' }}>
            <h4 style={{ marginBottom: '10px', fontSize: '0.9rem', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Pickup {index + 1}
            </h4>
            <PickupCard 
              seller={data.sellerName}
              location={data.location}
              orders={data.orders}
              isConfirmed={data.allConfirmed}
              onConfirm={() => handleConfirmPickup(sellerId)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PickupPage;

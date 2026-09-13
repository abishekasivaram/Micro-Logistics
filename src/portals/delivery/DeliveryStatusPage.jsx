import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import DeliveryStatusCard from '../../components/delivery/DeliveryStatusCard';
import DeliveryConfirmationModal from '../../components/delivery/DeliveryConfirmationModal';

const DeliveryStatusPage = () => {
  const { currentUser, getAgentBatches, getAgentOrders, updateOrderStatus, confirmOrderDelivery, updateBatchStatus } = useAppContext();
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Data Isolation
  const myBatches = getAgentBatches(currentUser?.id);
  const activeBatches = myBatches.filter(b => b.status !== 'Completed' && b.status !== 'Delivered');
  const activeBatch = activeBatches.length > 0 ? activeBatches[0] : null;
  
  const myOrders = activeBatch ? getAgentOrders(currentUser?.id).filter(o => activeBatch.orderIds.includes(o.id)) : [];

  const handleProgress = (order, action) => {
    if (action.requireModal) {
      setSelectedOrder(order);
      setShowModal(true);
    } else {
      updateOrderStatus(order.id, action.target);
      checkAndUpdateBatchStatus(order.id, action.target);
    }
  };

  const handleConfirmDelivery = (orderId) => {
    confirmOrderDelivery(orderId);
    checkAndUpdateBatchStatus(orderId, 'DELIVERED');
    setShowModal(false);
    setSelectedOrder(null);
  };

  const checkAndUpdateBatchStatus = (orderId, newStatus) => {
    if (!activeBatch) return;
    
    // Simulate what the batch status should be based on order statuses
    const updatedOrders = myOrders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    
    const allDelivered = updatedOrders.every(o => o.status === 'DELIVERED');
    const anyOutForDelivery = updatedOrders.some(o => o.status === 'OUT_FOR_DELIVERY' || o.status === 'ARRIVED');
    const anyPickedUp = updatedOrders.some(o => o.status === 'PICKED_UP');
    
    if (allDelivered) {
      updateBatchStatus(activeBatch.id, 'Completed');
    } else if (anyOutForDelivery) {
      updateBatchStatus(activeBatch.id, 'Out for Delivery');
    } else if (anyPickedUp) {
      updateBatchStatus(activeBatch.id, 'Pickup in Progress');
    }
  };

  if (!activeBatch) {
    return (
      <div className="page-container">
        <h2>Delivery Status</h2>
        <div className="card text-center text-secondary" style={{ padding: '40px' }}>
          <p>No active delivery batch. You have no orders to update.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <h2>Delivery Status</h2>
        <p className="text-secondary">Batch {activeBatch.batchId} - Update individual order statuses</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {myOrders.map(order => (
          <DeliveryStatusCard 
            key={order.id} 
            order={order} 
            onProgress={handleProgress} 
          />
        ))}
      </div>

      {showModal && selectedOrder && (
        <DeliveryConfirmationModal 
          order={selectedOrder}
          onClose={() => setShowModal(false)}
          onConfirm={handleConfirmDelivery}
        />
      )}
    </div>
  );
};

export default DeliveryStatusPage;

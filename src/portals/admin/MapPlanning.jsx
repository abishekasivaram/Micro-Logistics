import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * MapPlanning (Legacy)
 * Superseded by OrderAggregationPage (/admin/order-aggregation) and DeliveryTrackingPage (/admin/tracking).
 * Automatically redirects to the unified Smart Order Aggregation engine.
 */
const MapPlanning = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/admin/order-aggregation', { replace: true });
  }, [navigate]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
        Redirecting to Smart Order Aggregation & Route Planning...
      </p>
    </div>
  );
};

export default MapPlanning;

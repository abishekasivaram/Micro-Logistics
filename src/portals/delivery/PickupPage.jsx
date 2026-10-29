import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Store, RotateCw, MapPin, Phone, PackageCheck, QrCode, CheckCircle2, 
  AlertCircle, Check, ArrowRight, ShieldCheck, Camera, X,
  Navigation, MessageSquare, ThermometerSnowflake,
  Boxes, Clock, ArrowUpRight, CheckCheck, Sparkles, Building2,
  Copy, Truck
} from 'lucide-react';
import { useDelivery } from '../../context/DeliveryContext';
import PageHeader from '../../components/delivery/PageHeader';
import DeliveryStatusBadge from '../../components/delivery/DeliveryStatusBadge';
import EmptyState from '../../components/delivery/EmptyState';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import './PickupPage.css';

const PickupPage = () => {
  const navigate = useNavigate();
  const { activeBatch, hasBatch, addToast, updateOrderStatus, updateBatchStatus, acceptBatch, rejectBatch, refreshDeliveryData } = useDelivery();

  const deriveHubs = (batch) => {
    if (!batch) return [];
    if (batch.hubs && batch.hubs.length > 0) return batch.hubs;

    const pickupWaypoints = (batch.waypoints || []).filter(w => w.stop_type === 'PICKUP');
    if (pickupWaypoints.length > 0) {
      return pickupWaypoints.map((wp, idx) => ({
        id: wp.id || `hub-wp-${idx + 1}`,
        name: wp.title || `Vendor Hub ${idx + 1}`,
        address: wp.address || 'Vendor Address',
        phone: wp.phone || '+91 98401 22334',
        parcels: wp.parcels || 1,
        items: wp.items || ['Packaged Goods'],
        barcode: `PKG-${1000 + idx * 25}`,
        status: wp.completed ? 'COLLECTED' : 'READY',
        allOrdersHandedOver: true,
        orders: [],
        sequence: wp.sequence_index || idx + 1
      }));
    }

    const vendorMap = new Map();
    (batch.orders || []).forEach((ord, idx) => {
      const vKey = ord.vendorId || ord.vendorName || ord.pickupLocation;
      if (!vendorMap.has(vKey)) {
        vendorMap.set(vKey, {
          id: `hub-v-${idx + 1}`,
          name: ord.vendorName || 'Local Merchant',
          address: ord.pickupLocation || 'Merchant Hub Address',
          phone: ord.vendorPhone || '+91 98401 22334',
          parcels: 0,
          items: [],
          barcode: `PKG-${2000 + idx * 30}`,
          status: 'READY',
          orders: [],
          allOrdersHandedOver: true
        });
      }
      const hub = vendorMap.get(vKey);
      hub.parcels += (ord.items?.length || 1);
      hub.orders.push(ord);
      (ord.items || []).forEach(it => {
        if (it.name) hub.items.push(it.name);
      });
    });

    const result = Array.from(vendorMap.values());
    result.forEach(hub => {
      hub.allOrdersHandedOver = hub.orders.length > 0 ? hub.orders.every(o => o.vendorHandoverConfirmed) : true;
    });
    return result;
  };

  const [hubs, setHubs] = useState(() => deriveHubs(activeBatch));

  useEffect(() => {
    setHubs(deriveHubs(activeBatch));
  }, [activeBatch]);

  useEffect(() => {
    if (refreshDeliveryData) {
      refreshDeliveryData();
    }
  }, [refreshDeliveryData]);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (refreshDeliveryData) await refreshDeliveryData();
      addToast('Handover status synced with server', 'info');
    } finally {
      setIsRefreshing(false);
    }
  };
  const [selectedHubForConfirm, setSelectedHubForConfirm] = useState(null);
  const [scanningHub, setScanningHub] = useState(null);
  const [scannedCodes, setScannedCodes] = useState({
    'hub-1': true,
    'hub-2': true,
    'hub-3': true
  });
  const [checkedItems, setCheckedItems] = useState({});
  const [copiedHubId, setCopiedHubId] = useState(null);

  const handleCopyAddress = (address, hubId) => {
    if (!address) return;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(address);
    }
    setCopiedHubId(hubId);
    if (addToast) {
      addToast('Hub address copied to clipboard', 'info');
    }
    setTimeout(() => {
      setCopiedHubId(prev => (prev === hubId ? null : prev));
    }, 2000);
  };

  if (!hasBatch || !activeBatch || hubs.length === 0) {
    return (
      <div className="pk-page-root">
        <PageHeader
          breadcrumbs={['Operations', 'Hub Aggregation']}
          title="Pickup Routine"
          subtitle="Consolidate parcels from merchant hubs before customer delivery"
        />
        <EmptyState
          icon={Store}
          title="No pending pickups"
          description="You currently have no merchant hub collections pending. New pickup routines will appear here when a batch is assigned."
        />
      </div>
    );
  }

  if (activeBatch.status === 'ASSIGNED' || activeBatch.status === 'PENDING_ASSIGNMENT') {
    return (
      <div className="pk-page-root">
        <PageHeader
          title="Pickup Routine"
          subtitle={`Batch #${activeBatch.batchId} • Assignment Acceptance Required`}
          badgeText="STAGE 1: ACCEPTANCE"
          badgeVariant="warning"
        />
        <EmptyState
          icon={Truck}
          title={`Batch #${activeBatch.batchId} Assigned – Please Accept`}
          description="You must accept this dispatch assignment before you can start visiting vendor hubs to collect packages."
          primaryAction={{
            label: "Accept Assignment & Start Routine",
            icon: Check,
            onClick: async () => {
              await acceptBatch(activeBatch.batchId);
            }
          }}
          secondaryAction={{
            label: "Decline / Reassign",
            icon: X,
            onClick: async () => {
              await rejectBatch(activeBatch.batchId);
              navigate('/delivery');
            }
          }}
        />
      </div>
    );
  }

  const collectedCount = hubs.filter(h => h.status === 'COLLECTED').length;
  const totalHubs = hubs.length;
  const totalParcels = hubs.reduce((acc, h) => acc + (h.parcels || 0), 0);
  const allCollected = collectedCount === totalHubs;
  const progressPercent = Math.round((collectedCount / totalHubs) * 100);

  const handleToggleItem = (itemId) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const handleStartScan = (hub) => {
    setScanningHub(hub);
  };

  const handleVerifyScan = () => {
    if (!scanningHub) return;
    setScannedCodes(prev => ({ ...prev, [scanningHub.id]: true }));
    addToast(`Barcode ${scanningHub.barcode} verified for ${scanningHub.name}`, 'success');
    setScanningHub(null);
  };

  const handleMarkCollected = async () => {
    if (!selectedHubForConfirm) return;
    const hubId = selectedHubForConfirm.id;

    // Transition all orders in this hub to OUT_FOR_DELIVERY
    if (selectedHubForConfirm.orders && selectedHubForConfirm.orders.length > 0) {
      for (const ord of selectedHubForConfirm.orders) {
        if (updateOrderStatus) {
          try {
            await updateOrderStatus(ord.id || ord.orderCode, 'OUT_FOR_DELIVERY');
          } catch (err) {
            console.warn('Status update warning for order:', ord.id, err);
          }
        }
      }
    }

    setHubs(prev => {
      const updated = prev.map(h => {
        if (h.id === hubId) {
          return {
            ...h,
            status: 'COLLECTED',
            collectedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
        }
        return h;
      });

      const allNowCollected = updated.every(h => h.status === 'COLLECTED');
      if (allNowCollected && updateBatchStatus) {
        updateBatchStatus('OUT_FOR_DELIVERY').catch(console.error);
      }

      return updated;
    });

    addToast(`All parcels collected from ${selectedHubForConfirm.name} and marked Out for Delivery!`, 'success');
    setSelectedHubForConfirm(null);
  };

  return (
    <div className="pk-page-root">
      {/* 1. Sleek Compact Command Header */}
      <div className="pk-command-header-card">
        <div className="pk-header-top-row">
          <div className="pk-header-identity">
            <div className="pk-breadcrumbs">
              <span>Operations</span>
              <span className="pk-bread-sep">/</span>
              <span className="pk-bread-current">Merchant Hub Aggregation</span>
              <button 
                type="button" 
                onClick={handleManualRefresh} 
                disabled={isRefreshing}
                style={{ marginLeft: '12px', background: 'none', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '2px 8px', fontSize: '12px', color: '#475569', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                title="Refresh vendor handover status"
              >
                <RotateCw size={12} className={isRefreshing ? 'spin-icon' : ''} />
                <span>{isRefreshing ? 'Checking...' : 'Check Handover'}</span>
              </button>
            </div>
            <div className="pk-title-row">
              <h1 className="pk-main-heading dl-heading">Pickup Routine</h1>
              <span className="pk-batch-pill">Batch {activeBatch.batchId}</span>
              <span className={`pk-status-chip ${allCollected ? 'is-complete' : 'is-progress'}`}>
                <span className="pk-pulse-dot" />
                {allCollected ? `All ${totalHubs} Hubs Collected` : `${collectedCount}/${totalHubs} Hubs Collected`}
              </span>
            </div>
            <p className="pk-subtitle">
              Secure packages across {totalHubs} merchant hubs in <strong>{activeBatch.zone}</strong> before starting delivery drops.
            </p>
          </div>

          {/* Direct Route Handover Button in Header */}
          <div className="pk-header-actions">
            {allCollected ? (
              <button 
                type="button" 
                className="pk-cta-route-btn"
                onClick={() => navigate('/delivery/route')}
              >
                <span>Proceed to Route (5 Drops)</span>
                <ArrowRight size={17} />
              </button>
            ) : (
              <div className="pk-remaining-badge">
                <Clock size={14} />
                <span>{totalHubs - collectedCount} Hubs Pending Collection</span>
              </div>
            )}
          </div>
        </div>

        {/* 2. Compact 3-Stage Progress Pipeline Strip */}
        <div className="pk-pipeline-strip">
          <div className="pk-pipeline-stages">
            {/* Stage 1 */}
            <div className="pk-stage-pill is-done">
              <div className="pk-stage-icon">
                <Check size={12} strokeWidth={3} />
              </div>
              <div className="pk-stage-text">
                <span className="pk-st-label">1. Assigned</span>
                <span className="pk-st-sub">08:15 AM</span>
              </div>
            </div>

            <div className="pk-stage-divider is-done" />

            {/* Stage 2 */}
            <div className="pk-stage-pill is-done">
              <div className="pk-stage-icon">
                <Check size={12} strokeWidth={3} />
              </div>
              <div className="pk-stage-text">
                <span className="pk-st-label">2. Scanned</span>
                <span className="pk-st-sub">09:05 AM</span>
              </div>
            </div>

            <div className={`pk-stage-divider ${allCollected ? 'is-done' : 'is-active'}`} />

            {/* Stage 3 */}
            <div className={`pk-stage-pill ${allCollected ? 'is-done' : 'is-active'}`}>
              <div className="pk-stage-icon">
                {allCollected ? <Check size={12} strokeWidth={3} /> : <span className="pk-active-num">3</span>}
              </div>
              <div className="pk-stage-text">
                <span className="pk-st-label">3. Consolidated</span>
                <span className="pk-st-sub">{allCollected ? 'Cargo Secured' : 'Finalizing'}</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pk-mini-metrics">
            <span className="pk-metric-tag">
              <Building2 size={13} className="text-primary" />
              <strong>{collectedCount}/{totalHubs}</strong> Hubs Verified
            </span>
            <span className="pk-metric-sep">•</span>
            <span className="pk-metric-tag">
              <Boxes size={13} className="text-primary" />
              <strong>{totalParcels}</strong> Packages (12.4 kg)
            </span>
            <span className="pk-metric-sep">•</span>
            <span className="pk-metric-tag">
              <ThermometerSnowflake size={13} className="text-sky" />
              Cold Chain 2°C – 6°C
            </span>
          </div>
        </div>

        {/* Progress Fill Line */}
        <div className="pk-progress-track">
          <div className="pk-progress-bar" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* 3. The 3 Merchant Hub Cards Grid */}
      <div className="pk-hubs-grid">
        {hubs.map((hub, idx) => {
          const isCollected = hub.status === 'COLLECTED';
          const isScanned = scannedCodes[hub.id] || isCollected;

          const categories = [
            'Fresh Farm Produce & Greens',
            'Cold Pressed Oils & Groceries',
            'Dairy, Country Eggs & Staples'
          ];
          const hubCategory = categories[idx] || 'General Cargo Hub';

          return (
            <div 
              key={hub.id} 
              className={`pk-hub-card ${isCollected ? 'is-collected' : ''}`}
            >
              {/* Header */}
              <div className="pk-hub-card-header">
                <div>
                  <div className="pk-hub-seq-badge">Hub {idx + 1} of {totalHubs}</div>
                  <h3 className="pk-hub-name dl-heading">{hub.name}</h3>
                  <span className="pk-hub-category">{hubCategory}</span>
                </div>
                <DeliveryStatusBadge 
                  status={isCollected ? 'COLLECTED' : 'PENDING'} 
                  size="sm" 
                />
              </div>

              {/* Address & Direct Actions Toolbar */}
              <div className="pk-hub-location-box">
                <div className="pk-address-row">
                  <div className="pk-loc-pin-badge" title="Hub Location">
                    <MapPin size={15} />
                  </div>
                  <div className="pk-loc-content">
                    <span className="pk-loc-tag">Pickup Hub Address</span>
                    <span className="pk-address-text">{hub.address}</span>
                  </div>
                  <button 
                    type="button" 
                    className="pk-loc-copy-btn" 
                    title="Copy hub address"
                    onClick={() => handleCopyAddress(hub.address, hub.id)}
                  >
                    {copiedHubId === hub.id ? (
                      <Check size={13} className="pk-copy-success" />
                    ) : (
                      <Copy size={13} />
                    )}
                  </button>
                </div>

                <div className="pk-hub-contact-bar">
                  <a href={`tel:${hub.contact || hub.phone || '+919840122334'}`} className="pk-hub-btn btn-call" title="Call Merchant Manager">
                    <Phone size={13} />
                    <span>Call Hub</span>
                  </a>
                  <a 
                    href={`https://wa.me/${String(hub.contact || hub.phone || '919840122334').replace(/[^0-9]/g, '')}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="pk-hub-btn btn-wa"
                    title="Chat on WhatsApp"
                  >
                    <MessageSquare size={13} />
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(hub.address || 'Chennai')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="pk-hub-btn btn-nav"
                    title="Directions on Google Maps"
                  >
                    <Navigation size={13} />
                    <span>Directions</span>
                    <ArrowUpRight size={12} className="pk-btn-arrow" />
                  </a>
                </div>
              </div>

              {/* Package Manifest Checklist */}
              <div className="pk-manifest-box">
                <div className="pk-manifest-header">
                  <span className="pk-manifest-title">Manifest Items</span>
                  <span className="pk-manifest-count dl-tabular">{hub.itemsList?.length || hub.parcels} items</span>
                </div>

                <div className="pk-items-list">
                  {(hub.itemsList || []).map(item => {
                    const isChecked = isCollected || checkedItems[item.id];
                    return (
                      <label key={item.id} className={`pk-item-row ${isChecked ? 'is-checked' : ''}`}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleItem(item.id)}
                          disabled={isCollected}
                          className="pk-checkbox"
                        />
                        <span className="pk-item-name">{item.name}</span>
                        <span className="pk-item-order">{item.orderId}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Footer / Barcode & Status Actions */}
              <div className="pk-hub-footer">
                <div className="pk-barcode-strip">
                  <QrCode size={13} className="text-primary" />
                  <span className="pk-barcode-code dl-tabular">{hub.barcode}</span>
                </div>

                <div className="pk-footer-buttons">
                  <button
                    type="button"
                    className={`pk-btn-scan ${isScanned ? 'is-verified' : ''}`}
                    onClick={() => handleStartScan(hub)}
                    disabled={isCollected}
                    title="Scan hub package barcode"
                  >
                    <Camera size={13} />
                    <span>{isScanned ? 'Barcode Verified' : 'Scan Barcode'}</span>
                  </button>

                  {!isCollected ? (
                    hub.allOrdersHandedOver !== false ? (
                      <button
                        type="button"
                        className="pk-btn-collect"
                        onClick={() => setSelectedHubForConfirm(hub)}
                        title="Vendor has confirmed handover. Confirm collection to start transit."
                      >
                        <CheckCircle2 size={14} />
                        <span>Confirm Collection & Depart</span>
                      </button>
                    ) : (
                      <div 
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '7px 12px',
                          background: '#fffbeb',
                          color: '#b45309',
                          border: '1px solid #fde68a',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}
                        title="Merchant staff has not yet confirmed handover of order items"
                      >
                        <Clock size={13} color="#d97706" />
                        <span>Awaiting Merchant Handover</span>
                      </div>
                    )
                  ) : (
                    <div className="pk-collected-pill">
                      <CheckCheck size={14} className="text-emerald" />
                      <span>Secured at {hub.collectedAt || '08:45 AM'}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Optical Barcode Scanner Modal Simulator */}
      {scanningHub && (
        <div className="pk-scanner-backdrop" onClick={() => setScanningHub(null)}>
          <div className="pk-scanner-card" onClick={e => e.stopPropagation()}>
            <div className="pk-scanner-header">
              <div className="pk-scanner-title">
                <Camera size={18} className="text-primary" />
                <span className="dl-heading font-bold">Optical Barcode Scanner</span>
              </div>
              <button 
                type="button" 
                className="pk-scanner-close"
                onClick={() => setScanningHub(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="pk-scanner-viewfinder">
              <div className="pk-viewfinder-frame">
                <div className="pk-laser-line" />
                <div className="pk-reticle top-left" />
                <div className="pk-reticle top-right" />
                <div className="pk-reticle bottom-left" />
                <div className="pk-reticle bottom-right" />
                <div className="pk-crosshair" />
              </div>
              <p className="pk-target-code dl-tabular">{scanningHub.barcode}</p>
              <p className="pk-target-hub">{scanningHub.name}</p>
              <p className="pk-target-hint">Align barcode inside camera reticle</p>
            </div>

            <div className="pk-scanner-footer">
              <button 
                type="button" 
                className="pk-btn-confirm-scan"
                onClick={handleVerifyScan}
              >
                <Check size={16} />
                <span>Simulate Optical Scan & Verify ({scanningHub.barcode})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mark Collected Confirmation Dialog */}
      <ConfirmationModal
        isOpen={Boolean(selectedHubForConfirm)}
        onClose={() => setSelectedHubForConfirm(null)}
        onConfirm={handleMarkCollected}
        title="Confirm Merchant Hub Collection?"
        message={`Confirm that you have physically collected all ${selectedHubForConfirm?.parcels} parcel(s) from ${selectedHubForConfirm?.name} and loaded them securely into your vehicle.`}
        subjectName={selectedHubForConfirm?.name || 'Merchant Hub'}
        subjectInfo={`Address: ${selectedHubForConfirm?.address || ''} • Code: ${selectedHubForConfirm?.barcode || ''}`}
        confirmText="Confirm Collection"
        cancelText="Cancel"
        variant="primary"
        badgeText="HUB AGGREGATION PROTOCOL"
        icon={PackageCheck}
      />
    </div>
  );
};

export default PickupPage;

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Store, PackageCheck, MapPin, Phone, MessageSquare, 
  Navigation, Check, Clock, QrCode, Camera, CheckCircle2,
  ArrowRight, ShieldCheck, ArrowUpRight, Copy, CheckCheck, RotateCw, AlertCircle, X, Truck, Keyboard
} from 'lucide-react';
import { useDelivery } from '../../context/DeliveryContext';
import PageHeader from '../../components/delivery/PageHeader';
import DeliveryStatusBadge from '../../components/delivery/DeliveryStatusBadge';
import EmptyState from '../../components/delivery/EmptyState';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import './PickupPage.css';

const PickupPage = () => {
  const navigate = useNavigate();
  const { 
    activeBatch, hasBatch, updateOrderStatus, updateBatchStatus,
    collectHub, addToast, refreshDeliveryData, acceptBatch, rejectBatch
  } = useDelivery();

  // Helper to derive hubs from activeBatch
  const deriveHubs = (batch) => {
    if (!batch) return [];
    if (batch.hubs && batch.hubs.length > 0) {
      return batch.hubs;
    }

    const batchOrders = batch.orders || [];
    const vendorMap = new Map();

    batchOrders.forEach((ord, i) => {
      const vKey = ord.vendorName || ord.pickupLocation || `Merchant Hub ${i + 1}`;
      if (!vendorMap.has(vKey)) {
        vendorMap.set(vKey, {
          id: `hub-${i + 1}`,
          name: vKey,
          address: ord.pickupLocation || 'Commercial Complex, Chennai',
          contact: ord.vendorPhone || '+91 94441 12345',
          parcels: 0,
          status: 'PENDING',
          barcode: `HUB-CHE-${Math.abs(vKey.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 900 + 100)}`,
          orders: [],
          items: []
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
  // Real scanner state: initialize with EMPTY object (no pre-verified mock hubs)
  const [scannedCodes, setScannedCodes] = useState({});
  const [checkedItems, setCheckedItems] = useState({});
  const [copiedHubId, setCopiedHubId] = useState(null);

  // Optical scanner & Camera stream state
  const videoRef = useRef(null);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [manualCodeInput, setManualCodeInput] = useState('');
  const [scanValidationError, setScanValidationError] = useState('');
  const [isCollecting, setIsCollecting] = useState(false);

  // Start real camera stream when scanner opens
  useEffect(() => {
    if (!scanningHub) {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
      }
      setCameraError(null);
      setManualCodeInput('');
      setScanValidationError('');
      return;
    }

    let activeStream = null;
    const startCamera = async () => {
      try {
        if (navigator?.mediaDevices?.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
          });
          activeStream = stream;
          setCameraStream(stream);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } else {
          setCameraError('Camera API is not supported in this browser environment.');
        }
      } catch (err) {
        console.warn('Camera access unavailable:', err);
        setCameraError('Camera hardware/permission unavailable. Use manual barcode entry or demo test scan below.');
      }
    };

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [scanningHub]);

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
          title="Pickup Routine"
          subtitle="Merchant Hub Aggregation Network"
          badgeText="NO ACTIVE MISSION"
          badgeVariant="neutral"
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
    setManualCodeInput('');
    setScanValidationError('');
  };

  // Barcode validation helper
  const validateBarcode = (code) => {
    if (!scanningHub || !code) return false;
    const cleanCode = String(code).trim().toUpperCase();
    const expectedBarcode = String(scanningHub.barcode || '').trim().toUpperCase();
    
    // Valid matches: hub's assigned barcode, order codes, or hub ID
    const validCodes = [
      expectedBarcode,
      String(scanningHub.id || '').toUpperCase(),
      ...(scanningHub.orders || []).flatMap(o => [
        String(o.orderCode || o.id || '').toUpperCase(),
        String(o.uuid || '').toUpperCase()
      ])
    ];

    return validCodes.some(vc => vc && (vc === cleanCode || cleanCode.includes(vc) || vc.includes(cleanCode)));
  };

  // Perform verification from manual entry or optical scanner
  const handleVerifyBarcodeCode = (codeToVerify) => {
    if (!scanningHub) return;
    const targetCode = (codeToVerify || manualCodeInput || '').trim();

    if (!targetCode) {
      setScanValidationError('Please enter or scan a barcode.');
      return;
    }

    if (!validateBarcode(targetCode)) {
      setScanValidationError(`Invalid barcode "${targetCode}". Code does not match this merchant hub or assigned package manifest.`);
      return;
    }

    // Success: mark barcode recognized for this hub (does NOT independently mark collected)
    setScannedCodes(prev => ({ ...prev, [scanningHub.id]: true }));
    addToast(`Barcode ${targetCode} recognized and verified for ${scanningHub.name}. Physical collection step unlocked.`, 'success');
    setScanningHub(null);
  };

  // Demo / Test verification fallback
  const handleVerifyScanDemo = () => {
    if (!scanningHub) return;
    handleVerifyBarcodeCode(scanningHub.barcode);
  };

  // Confirm physical collection handler with full backend guard integration
  const handleMarkCollected = async () => {
    if (!selectedHubForConfirm) return;
    const hub = selectedHubForConfirm;

    // Strict frontend verification guard before sending request
    if (hub.allOrdersHandedOver === false) {
      addToast('Collection cannot be confirmed yet. Waiting for the merchant to confirm handover for all required packages.', 'danger');
      return;
    }

    if (!scannedCodes[hub.id]) {
      addToast('Package barcode verification is required before collection can be confirmed.', 'warning');
      return;
    }

    setIsCollecting(true);
    try {
      if (collectHub) {
        const vendorId = hub.orders?.[0]?.vendorId || hub.orders?.[0]?.vendor_id;
        const res = await collectHub(activeBatch.batchId, hub.id, vendorId, hub.barcode);
        
        if (!res.success) {
          addToast(res.message || 'Collection cannot be confirmed yet.', 'danger');
          setIsCollecting(false);
          return;
        }
      } else {
        // Fallback optimistic status update
        for (const ord of (hub.orders || [])) {
          if (updateOrderStatus) {
            await updateOrderStatus(ord.id || ord.orderCode, 'OUT_FOR_DELIVERY');
          }
        }
      }

      setHubs(prev => {
        const updated = prev.map(h => {
          if (h.id === hub.id) {
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

      addToast(`All parcels collected from ${hub.name} and marked Out for Delivery!`, 'success');
      setSelectedHubForConfirm(null);
    } catch (err) {
      console.error('Collection confirmation error:', err);
      addToast('An error occurred while confirming collection. Please retry.', 'danger');
    } finally {
      setIsCollecting(false);
    }
  };

  return (
    <div className="pk-page-root">
      {/* 1. Command Header */}
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

          {/* Route Handover Action */}
          <div className="pk-header-actions">
            {allCollected ? (
              <button 
                type="button" 
                className="pk-cta-route-btn"
                onClick={() => navigate('/delivery/route')}
              >
                <span>Proceed to Route</span>
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
            <div className="pk-stage-pill is-done">
              <div className="pk-stage-icon">
                <Check size={12} strokeWidth={3} />
              </div>
              <div className="pk-stage-text">
                <span className="pk-st-label">1. Assigned</span>
                <span className="pk-st-sub">Accepted</span>
              </div>
            </div>

            <div className={`pk-stage-connector ${collectedCount > 0 ? 'is-done' : ''}`} />

            <div className={`pk-stage-pill ${allCollected ? 'is-done' : 'is-current'}`}>
              <div className="pk-stage-icon">
                <Store size={12} />
              </div>
              <div className="pk-stage-text">
                <span className="pk-st-label">2. Vendor Handover & Collection</span>
                <span className="pk-st-sub">{collectedCount} of {totalHubs} secured</span>
              </div>
            </div>

            <div className={`pk-stage-connector ${allCollected ? 'is-done' : ''}`} />

            <div className={`pk-stage-pill ${allCollected ? 'is-current' : 'is-pending'}`}>
              <div className="pk-stage-icon">
                <Navigation size={12} />
              </div>
              <div className="pk-stage-text">
                <span className="pk-st-label">3. Out for Delivery</span>
                <span className="pk-st-sub">{allCollected ? 'Ready for drops' : 'Pending hubs'}</span>
              </div>
            </div>
          </div>

          <div className="pk-mini-progress">
            <div className="pk-progress-label">
              <span>Aggregation Progress</span>
              <span className="dl-tabular font-bold">{progressPercent}%</span>
            </div>
            <div className="pk-progress-track">
              <div className="pk-progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Merchant Hub Collections Grid */}
      <div className="pk-hubs-grid">
        {hubs.map((hub, idx) => {
          const isCollected = hub.status === 'COLLECTED';
          const isScanned = Boolean(scannedCodes[hub.id]);
          const isHandoverReady = hub.allOrdersHandedOver !== false;
          const canCollect = isHandoverReady && isScanned;

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

              {/* Address & Quick Actions */}
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

              {/* Manifest Checklist */}
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

              {/* Barcode & Collection Actions */}
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
                    isHandoverReady ? (
                      isScanned ? (
                        <button
                          type="button"
                          className="pk-btn-collect"
                          onClick={() => setSelectedHubForConfirm(hub)}
                          title="Vendor handover confirmed and barcode verified. Proceed to physical collection."
                        >
                          <CheckCircle2 size={14} />
                          <span>Confirm Collection & Depart</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="pk-btn-collect"
                          style={{ background: '#f59e0b', borderColor: '#d97706' }}
                          onClick={() => handleStartScan(hub)}
                          title="Barcode verification required before physical collection can be recorded."
                        >
                          <Camera size={14} />
                          <span>Scan Barcode to Enable Collection</span>
                        </button>
                      )
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSelectedHubForConfirm(hub)}
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
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                        title="Merchant staff has not yet confirmed handover of order items"
                      >
                        <Clock size={13} color="#d97706" />
                        <span>Awaiting Merchant Handover</span>
                      </button>
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

      {/* Optical Barcode Scanner Modal with Live Camera & Manual Fallback */}
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
              {/* Real camera video feed or fallback */}
              {cameraStream ? (
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '12px'
                  }} 
                />
              ) : null}

              <div className="pk-viewfinder-frame">
                <div className="pk-laser-line" />
                <div className="pk-reticle top-left" />
                <div className="pk-reticle top-right" />
                <div className="pk-reticle bottom-left" />
                <div className="pk-reticle bottom-right" />
                <div className="pk-crosshair" />
              </div>

              <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', background: 'rgba(0,0,0,0.4)', padding: '6px 12px', borderRadius: '8px' }}>
                <p className="pk-target-code dl-tabular" style={{ margin: 0, color: '#38bdf8', fontWeight: 'bold' }}>{scanningHub.barcode}</p>
                <p className="pk-target-hub" style={{ margin: '2px 0', color: '#fff', fontSize: '13px' }}>{scanningHub.name}</p>
                <p className="pk-target-hint" style={{ margin: 0, color: '#cbd5e1', fontSize: '11px' }}>
                  {cameraStream ? 'Align barcode inside viewfinder reticle' : 'Optical viewfinder active (Camera unavailable: use manual/test mode)'}
                </p>
              </div>
            </div>

            {/* Validation Error Banner */}
            {scanValidationError && (
              <div style={{ margin: '12px 16px 0', padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={15} />
                <span>{scanValidationError}</span>
              </div>
            )}

            {/* Manual Barcode Input Fallback */}
            <div style={{ padding: '14px 16px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: '#475569' }}>
                <Keyboard size={14} />
                <span>Manual Barcode Entry Fallback</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder={`e.g. ${scanningHub.barcode} or Package Code`}
                  value={manualCodeInput}
                  onChange={(e) => {
                    setManualCodeInput(e.target.value);
                    if (scanValidationError) setScanValidationError('');
                  }}
                  style={{
                    flex: 1,
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13.5px',
                    fontFamily: 'monospace'
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleVerifyBarcodeCode(manualCodeInput)}
                  style={{
                    padding: '9px 16px',
                    background: '#2563eb',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Verify
                </button>
              </div>
            </div>

            <div className="pk-scanner-footer" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '14px 16px 16px' }}>
              <button 
                type="button" 
                className="pk-btn-confirm-scan"
                onClick={handleVerifyScanDemo}
              >
                <Check size={16} />
                <span>Demo / Test Verification (Simulate Scan: {scanningHub.barcode})</span>
              </button>
              <span style={{ fontSize: '11px', color: '#64748b', textAlign: 'center' }}>
                Note: Barcode validation confirms parcel identification; physical collection is completed separately.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Mark Collected Confirmation Dialog with Explicit Handover Guard */}
      {selectedHubForConfirm && (
        <ConfirmationModal
          isOpen={Boolean(selectedHubForConfirm)}
          onClose={() => setSelectedHubForConfirm(null)}
          onConfirm={handleMarkCollected}
          confirmDisabled={selectedHubForConfirm.allOrdersHandedOver === false || !scannedCodes[selectedHubForConfirm.id] || isCollecting}
          title={
            selectedHubForConfirm.allOrdersHandedOver === false
              ? "Merchant Handover Required"
              : !scannedCodes[selectedHubForConfirm.id]
              ? "Barcode Verification Required"
              : "Confirm Merchant Hub Collection?"
          }
          message={
            selectedHubForConfirm.allOrdersHandedOver === false
              ? "Collection cannot be confirmed yet. Waiting for the merchant to confirm handover for all required packages."
              : !scannedCodes[selectedHubForConfirm.id]
              ? "Please scan and verify the merchant hub barcode before confirming physical collection."
              : `Confirm that you have physically collected all ${selectedHubForConfirm.parcels} parcel(s) from ${selectedHubForConfirm.name} and loaded them securely into your vehicle.`
          }
          subjectName={selectedHubForConfirm.name || 'Merchant Hub'}
          subjectInfo={`Address: ${selectedHubForConfirm.address || ''} • Code: ${selectedHubForConfirm.barcode || ''}`}
          confirmText={
            selectedHubForConfirm.allOrdersHandedOver === false
              ? "Awaiting Merchant Handover"
              : !scannedCodes[selectedHubForConfirm.id]
              ? "Scan Barcode First"
              : isCollecting
              ? "Confirming..."
              : "Confirm Collection"
          }
          cancelText="Close"
          variant={selectedHubForConfirm.allOrdersHandedOver === false ? "warning" : "primary"}
          badgeText="HUB AGGREGATION PROTOCOL"
          icon={PackageCheck}
          isLoading={isCollecting}
        />
      )}
    </div>
  );
};

export default PickupPage;

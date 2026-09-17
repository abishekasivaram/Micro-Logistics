import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { 
  Truck, UserCheck, Navigation, Layers, CheckCircle, 
  Clock, X, ChevronRight, User, AlertCircle, Play, Eye,
  MapPin, Calendar, Check, ArrowRight, ShieldCheck, Box,
  Search, SlidersHorizontal, ArrowUpRight, Bike, Sparkles,
  Phone, Radio, Send, CheckCircle2, Copy
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import './DeliveryManagementPage.css';

const DeliveryManagementPage = () => {
  const { deliveryBatches, deliveryAgents, assignAgentToBatch, updateBatchStatus, orders } = useAppContext();
  const navigate = useNavigate();

  const [assigningBatch, setAssigningBatch] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [agentSearchQuery, setAgentSearchQuery] = useState('');
  const [copiedBatchId, setCopiedBatchId] = useState(null);

  // Status progression workflow
  const handleNextStatus = (batch) => {
    if (!batch.agentId || batch.status === 'Pending Assignment') {
      setAssigningBatch(batch);
      return;
    }

    let next = 'Assigned';
    if (batch.status === 'Pending Assignment') next = 'Assigned';
    else if (batch.status === 'Assigned') next = 'Pickup in Progress';
    else if (batch.status === 'Pickup in Progress') next = 'Out for Delivery';
    else if (batch.status === 'Out for Delivery') next = 'Completed';

    updateBatchStatus(batch.id, next);
  };

  const getInitials = (name) => {
    if (!name) return 'DA';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const copyToClipboard = (batchId, e) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(batchId);
    setCopiedBatchId(batchId);
    setTimeout(() => setCopiedBatchId(null), 2000);
  };

  // Telemetry KPIs
  const totalBatches = deliveryBatches.length;
  const pendingCount = deliveryBatches.filter(b => b.status === 'Pending Assignment' || !b.agentId).length;
  const inTransitCount = deliveryBatches.filter(b => ['Assigned', 'Pickup in Progress', 'Out for Delivery'].includes(b.status)).length;
  const completedCount = deliveryBatches.filter(b => ['Completed', 'Delivered'].includes(b.status)).length;
  const activeAgentsCount = deliveryAgents.filter(a => a.status === 'On Delivery' || a.status === 'Available').length;

  // Filtered batches
  const filteredBatches = useMemo(() => {
    return deliveryBatches.filter(b => {
      // Status filter
      if (selectedFilter === 'PENDING' && b.status !== 'Pending Assignment' && b.agentId) return false;
      if (selectedFilter === 'ACTIVE' && !['Assigned', 'Pickup in Progress', 'Out for Delivery'].includes(b.status)) return false;
      if (selectedFilter === 'COMPLETED' && !['Completed', 'Delivered'].includes(b.status)) return false;

      // Text query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const batchIdMatch = (b.batchId || b.id || '').toLowerCase().includes(query);
        const agentMatch = (b.agentName || '').toLowerCase().includes(query);
        const locationMatch = [...(b.pickupLocations || []), ...(b.deliveryLocations || [])].some(loc => loc.toLowerCase().includes(query));
        const sellerMatch = (b.sellerNames || []).some(s => s.toLowerCase().includes(query));
        const orderMatch = (b.orderIds || []).some(id => id.toLowerCase().includes(query));

        return batchIdMatch || agentMatch || locationMatch || sellerMatch || orderMatch;
      }

      return true;
    });
  }, [deliveryBatches, selectedFilter, searchQuery]);

  // Modal agents filtering
  const filteredAgents = useMemo(() => {
    if (!agentSearchQuery.trim()) return deliveryAgents;
    const q = agentSearchQuery.toLowerCase();
    return deliveryAgents.filter(a => 
      a.name.toLowerCase().includes(q) || 
      (a.currentArea && a.currentArea.toLowerCase().includes(q)) ||
      (a.vehicle && a.vehicle.toLowerCase().includes(q))
    );
  }, [deliveryAgents, agentSearchQuery]);

  // Dynamic next button label & icon
  const getNextActionConfig = (status, hasAgent) => {
    if (!hasAgent || status === 'Pending Assignment') {
      return { label: 'Assign Courier', icon: UserCheck, variant: 'btn-amber' };
    }
    switch (status) {
      case 'Assigned':
        return { label: 'Start Pickup Run', icon: Navigation, variant: 'btn-primary' };
      case 'Pickup in Progress':
        return { label: 'Dispatch to Field', icon: Send, variant: 'btn-primary' };
      case 'Out for Delivery':
        return { label: 'Confirm Delivered', icon: CheckCircle2, variant: 'btn-emerald' };
      default:
        return { label: 'Progress State', icon: ChevronRight, variant: 'btn-primary' };
    }
  };

  return (
    <div className="page-container delivery-mgmt-page">
      {/* Executive Command Header */}
      <div className="delivery-command-header">
        <div className="command-header-left">
          <div className="command-title-row">
            <h2 className="command-page-title">Delivery Batch Dispatch & Fleet Coordination</h2>
            <div className="live-fleet-tag">
              <span className="live-ping-dot" />
              <span>LIVE FLEET MESH</span>
            </div>
          </div>
          <p className="command-subtitle">
            Mission control: coordinate aggregated stops, dispatch certified field couriers, monitor waypoint corridors, and track live deliveries.
          </p>
        </div>

        <div className="command-header-actions">
          <button className="btn btn-command-outline" onClick={() => navigate('/admin/routes')}>
            <Navigation size={15} /> Route Mesh
          </button>
          <button className="btn btn-command-primary" onClick={() => navigate('/admin/order-aggregation')}>
            <Layers size={15} /> Aggregate New Orders
          </button>
        </div>
      </div>

      {/* Operational KPI Telemetry Bar */}
      <div className="fleet-telemetry-ribbon">
        <div className="telemetry-kpi-card theme-indigo">
          <div className="kpi-icon-pill">
            <Layers size={18} />
          </div>
          <div className="kpi-data-block">
            <span className="kpi-label">Active Missions</span>
            <div className="kpi-number-row">
              <span className="kpi-value">{totalBatches}</span>
              <span className="kpi-tag-trend">Total batches</span>
            </div>
          </div>
        </div>

        <div className="telemetry-kpi-card theme-amber">
          <div className="kpi-icon-pill">
            <AlertCircle size={18} />
          </div>
          <div className="kpi-data-block">
            <span className="kpi-label">Pending Dispatch</span>
            <div className="kpi-number-row">
              <span className="kpi-value">{pendingCount}</span>
              {pendingCount > 0 ? (
                <span className="kpi-tag-alert">Action required</span>
              ) : (
                <span className="kpi-tag-optimal">All assigned</span>
              )}
            </div>
          </div>
        </div>

        <div className="telemetry-kpi-card theme-sky">
          <div className="kpi-icon-pill">
            <Send size={18} />
          </div>
          <div className="kpi-data-block">
            <span className="kpi-label">In-Transit Corridors</span>
            <div className="kpi-number-row">
              <span className="kpi-value">{inTransitCount}</span>
              <span className="kpi-tag-trend">Active on road</span>
            </div>
          </div>
        </div>

        <div className="telemetry-kpi-card theme-emerald">
          <div className="kpi-icon-pill">
            <ShieldCheck size={18} />
          </div>
          <div className="kpi-data-block">
            <span className="kpi-label">Fleet Readiness</span>
            <div className="kpi-number-row">
              <span className="kpi-value">{activeAgentsCount} / {deliveryAgents.length}</span>
              <span className="kpi-tag-optimal">Couriers active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Segmented Filter & Search Control */}
      <div className="missions-toolbar-row">
        <div className="segmented-filter-tabs">
          <button 
            className={`filter-tab-pill ${selectedFilter === 'ALL' ? 'is-active' : ''}`}
            onClick={() => setSelectedFilter('ALL')}
          >
            All Missions
            <span className="filter-count-badge">{totalBatches}</span>
          </button>
          <button 
            className={`filter-tab-pill ${selectedFilter === 'PENDING' ? 'is-active' : ''}`}
            onClick={() => setSelectedFilter('PENDING')}
          >
            <span className="tab-status-dot amber" />
            Pending Assignment
            <span className="filter-count-badge">{pendingCount}</span>
          </button>
          <button 
            className={`filter-tab-pill ${selectedFilter === 'ACTIVE' ? 'is-active' : ''}`}
            onClick={() => setSelectedFilter('ACTIVE')}
          >
            <span className="tab-status-dot blue" />
            In Transit & Dispatched
            <span className="filter-count-badge">{inTransitCount}</span>
          </button>
          <button 
            className={`filter-tab-pill ${selectedFilter === 'COMPLETED' ? 'is-active' : ''}`}
            onClick={() => setSelectedFilter('COMPLETED')}
          >
            <span className="tab-status-dot emerald" />
            Completed
            <span className="filter-count-badge">{completedCount}</span>
          </button>
        </div>

        <div className="missions-search-wrapper">
          <Search size={15} className="search-field-icon" />
          <input 
            type="text"
            className="missions-search-input"
            placeholder="Search by batch ID, courier, stop or order..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear-btn" onClick={() => setSearchQuery('')}>
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Batches Grid */}
      <div className="mission-batches-grid">
        {filteredBatches.length === 0 ? (
          <div className="card empty-mission-state">
            <div className="empty-radar-circle">
              <Truck size={38} className="empty-radar-icon" />
            </div>
            <h4>No Missions Matching Criteria</h4>
            <p>
              {searchQuery || selectedFilter !== 'ALL' 
                ? 'Try adjusting your filters or search keywords to locate dispatch batches.'
                : 'When ready orders are consolidated in the Smart Aggregation Hub, new batches will automatically generate here for courier dispatch.'}
            </p>
            {searchQuery || selectedFilter !== 'ALL' ? (
              <button 
                className="btn btn-outline" 
                onClick={() => { setSelectedFilter('ALL'); setSearchQuery(''); }}
              >
                Reset All Filters
              </button>
            ) : (
              <button className="btn btn-primary" onClick={() => navigate('/admin/order-aggregation')}>
                Open Smart Aggregation Hub
              </button>
            )}
          </div>
        ) : (
          filteredBatches.map(b => {
            const isUnassigned = !b.agentId || b.status === 'Pending Assignment';
            const isCompleted = b.status === 'Completed' || b.status === 'Delivered';
            const orderCount = b.orderCount || b.orderIds?.length || 1;
            const batchDisplayId = b.batchId || b.id;

            // Status thematic styling
            let statusThemeClass = 'theme-pending';
            if (isCompleted) statusThemeClass = 'theme-completed';
            else if (!isUnassigned) statusThemeClass = 'theme-assigned';

            const nextAction = getNextActionConfig(b.status, !isUnassigned);
            const NextIcon = nextAction.icon;

            return (
              <div key={b.id} className={`mission-card ${statusThemeClass}`}>
                {/* Header with Monospace Batch ID & Status */}
                <div className="mission-card-header">
                  <div className="mission-id-cluster">
                    <span className="mission-kicker">DISPATCH MISSION</span>
                    <div className="mission-code-row">
                      <h3 className="mission-id-title">{batchDisplayId}</h3>
                      <button 
                        className="copy-batch-btn"
                        title="Copy Batch ID"
                        onClick={(e) => copyToClipboard(batchDisplayId, e)}
                      >
                        {copiedBatchId === batchDisplayId ? <Check size={12} className="text-emerald" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>
                  <div className="mission-header-right">
                    <StatusBadge status={b.status} />
                  </div>
                </div>

                {/* Logistics Schedule Window */}
                <div className="mission-schedule-block">
                  <div className="schedule-pill">
                    <Calendar size={12} className="schedule-icon" />
                    <span>{b.deliveryDate || 'Today'}</span>
                  </div>
                  <div className="schedule-pill highlight">
                    <Clock size={12} className="schedule-icon" />
                    <span>{b.deliverySlot}</span>
                  </div>
                </div>

                {/* Waypoint Route Corridor Timeline */}
                <div className="waypoint-corridor-box">
                  {/* Step 1: Pickup Hubs */}
                  <div className="corridor-waypoint-row">
                    <div className="waypoint-marker pickup">
                      <span className="waypoint-dot-inner" />
                    </div>
                    <div className="waypoint-content">
                      <div className="waypoint-meta-top">
                        <span className="waypoint-step-label">PICKUP CORRIDOR</span>
                        <span className="waypoint-count-tag">{b.sellerNames?.length || 1} Vendors</span>
                      </div>
                      <span className="waypoint-address-text">
                        {b.pickupLocations?.join(' • ') || 'Multiple Merchant Hubs'}
                      </span>
                    </div>
                  </div>

                  {/* Connecting Transit Vector */}
                  <div className="corridor-transit-vector">
                    <div className="vector-track-line" />
                    <span className="vector-transit-chip">{b.estimatedDistance || 4.5} km transit corridor</span>
                  </div>

                  {/* Step 2: Dropoff Sector */}
                  <div className="corridor-waypoint-row">
                    <div className="waypoint-marker dropoff">
                      <MapPin size={10} className="marker-pin-icon" />
                    </div>
                    <div className="waypoint-content">
                      <div className="waypoint-meta-top">
                        <span className="waypoint-step-label">DROPOFF ZONE</span>
                        <span className="waypoint-count-tag">{orderCount} Deliveries</span>
                      </div>
                      <span className="waypoint-address-text">
                        {b.deliveryLocations?.join(' • ') || 'Local Residential Sector'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Assigned Courier Executive Card */}
                <div className={`mission-courier-dossier ${isUnassigned ? 'is-unassigned' : 'is-assigned'}`}>
                  <div className="courier-dossier-left">
                    <div className="courier-avatar-squircle">
                      {isUnassigned ? (
                        <User size={16} className="unassigned-avatar-icon" />
                      ) : (
                        <span>{getInitials(b.agentName)}</span>
                      )}
                    </div>
                    <div className="courier-details-meta">
                      <div className="courier-role-title">
                        {isUnassigned ? 'Awaiting Dispatch' : 'Assigned Fleet Courier'}
                      </div>
                      <div className="courier-primary-name">
                        {b.agentName || 'Unassigned Field Agent'}
                      </div>
                      {!isUnassigned && (
                        <div className="courier-vehicle-tag">
                          <Bike size={11} />
                          <span>Active Urban Carrier</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button 
                    className={`courier-action-trigger ${isUnassigned ? 'trigger-assign' : 'trigger-reassign'}`}
                    onClick={() => setAssigningBatch(b)}
                  >
                    {isUnassigned ? (
                      <>
                        <UserCheck size={13} />
                        <span>Assign Fleet</span>
                      </>
                    ) : (
                      <span>Reassign</span>
                    )}
                  </button>
                </div>

                {/* Constituent Consignments List */}
                <div className="mission-consignments-panel">
                  <div className="consignments-header-row">
                    <div className="consignments-title">
                      <Box size={13} />
                      <span>Consignment Manifest ({orderCount})</span>
                    </div>
                    <span className="consignments-sub-note">Synced with Hub</span>
                  </div>

                  <div className="consignments-list-stack">
                    {b.orderIds?.map(id => {
                      const matched = orders.find(o => o.id === id || o.orderId === id);
                      return (
                        <div key={id} className="consignment-order-item">
                          <div className="consignment-left">
                            <span className="order-monospace-pill">{id}</span>
                            <span className="order-customer-name">
                              {matched?.customerName || 'Customer Delivery'}
                            </span>
                          </div>
                          <span className="order-merchant-tag">
                            {matched?.vendorName || 'Merchant'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Route Telemetry Matrix */}
                <div className="mission-telemetry-matrix">
                  <div className="telemetry-metric-tile">
                    <Navigation size={12} className="telemetry-icon" />
                    <span className="metric-value">{b.estimatedDistance || 4.5} km</span>
                    <span className="metric-name">Distance</span>
                  </div>
                  <div className="telemetry-divider" />
                  <div className="telemetry-metric-tile">
                    <Clock size={12} className="telemetry-icon" />
                    <span className="metric-value">{b.estimatedTime || 35} mins</span>
                    <span className="metric-name">Transit Est.</span>
                  </div>
                  <div className="telemetry-divider" />
                  <div className="telemetry-metric-tile">
                    <Box size={12} className="telemetry-icon" />
                    <span className="metric-value">{orderCount} units</span>
                    <span className="metric-name">Payload</span>
                  </div>
                </div>

                {/* Interactive Card Action Footer */}
                <div className="mission-card-footer">
                  <button 
                    className="btn btn-card-outline" 
                    onClick={() => navigate('/admin/routes')}
                    title="View live route coordination map"
                  >
                    <Navigation size={13} /> Route Mesh
                  </button>

                  {!isCompleted ? (
                    <button 
                      className={`btn btn-card-action ${nextAction.variant}`}
                      onClick={() => handleNextStatus(b)}
                    >
                      <span>{nextAction.label}</span>
                      <NextIcon size={14} />
                    </button>
                  ) : (
                    <div className="completed-status-indicator">
                      <CheckCircle2 size={15} />
                      <span>Fulfilled & Verified</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Assign Agent Modal - Mounted to document.body with Frosted Glass */}
      {assigningBatch && createPortal(
        <div className="modal-backdrop-command" onClick={() => setAssigningBatch(null)}>
          <div className="modal-dialog-card assign-fleet-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-dialog-header">
              <div className="modal-title-with-icon">
                <div className="modal-icon-badge">
                  <UserCheck size={20} />
                </div>
                <div>
                  <h3>Dispatch Mission Assignment</h3>
                  <span className="modal-subtitle">
                    Mission {assigningBatch.batchId || assigningBatch.id} • {assigningBatch.deliverySlot}
                  </span>
                </div>
              </div>
              <button className="modal-close-trigger" onClick={() => setAssigningBatch(null)}>
                <X size={18} />
              </button>
            </div>
            
            <div className="modal-dialog-body">
              <div className="assignment-mission-summary">
                <div className="summary-col">
                  <span className="summary-label">Target Slot</span>
                  <span className="summary-data">{assigningBatch.deliverySlot}</span>
                </div>
                <div className="summary-col">
                  <span className="summary-label">Consignments</span>
                  <span className="summary-data">{assigningBatch.orderCount || assigningBatch.orderIds?.length} Packages</span>
                </div>
                <div className="summary-col">
                  <span className="summary-label">Distance</span>
                  <span className="summary-data">{assigningBatch.estimatedDistance || 4.5} km</span>
                </div>
              </div>

              {/* Courier Search Filter */}
              <div className="modal-courier-search">
                <Search size={14} className="modal-search-icon" />
                <input 
                  type="text"
                  placeholder="Filter available couriers by name, vehicle, or sector..."
                  value={agentSearchQuery}
                  onChange={(e) => setAgentSearchQuery(e.target.value)}
                />
              </div>

              <div className="agent-selection-scroll">
                {filteredAgents.map(a => {
                  const isAvailable = a.status === 'Available' || a.availability === 'Available';
                  const isCurrentlyAssigned = assigningBatch.agentId === a.id;

                  return (
                    <div 
                      key={a.id} 
                      className={`agent-candidate-card ${isCurrentlyAssigned ? 'current-assigned' : ''} ${!isAvailable ? 'is-busy' : ''}`}
                    >
                      <div className="candidate-left">
                        <div className="avatar-squircle">
                          {getInitials(a.name)}
                          {isAvailable && <span className="agent-online-dot" />}
                        </div>
                        <div className="candidate-info">
                          <div className="candidate-name-row">
                            <span className="candidate-name">{a.name}</span>
                            {isCurrentlyAssigned && <span className="current-badge">Currently Assigned</span>}
                          </div>
                          <span className="candidate-meta">
                            {a.vehicle || 'Scooter'} • {a.currentArea || 'Central Zone'} • {a.phone}
                          </span>
                        </div>
                      </div>

                      <div className="candidate-right">
                        <StatusBadge status={a.status || 'Available'} />
                        <button 
                          className={`btn btn-sm ${isCurrentlyAssigned ? 'btn-outline' : 'btn-primary'}`}
                          disabled={isCurrentlyAssigned}
                          onClick={() => {
                            assignAgentToBatch(assigningBatch.id, a.id);
                            setAssigningBatch(null);
                          }}
                        >
                          {isCurrentlyAssigned ? 'Assigned' : 'Select'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="modal-dialog-footer">
              <button className="btn btn-outline" onClick={() => setAssigningBatch(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default DeliveryManagementPage;

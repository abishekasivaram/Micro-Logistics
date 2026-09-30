import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, LayoutList, LayoutGrid, X, Phone, 
  MapPin, Clock, ArrowRight, RefreshCw, ChevronRight, CheckCircle2 
} from 'lucide-react';
import { useDelivery } from '../../context/DeliveryContext';
import PageHeader from '../../components/delivery/PageHeader';
import DataTable from '../../components/delivery/DataTable';
import DeliveryStatusBadge from '../../components/delivery/DeliveryStatusBadge';
import EmptyState from '../../components/delivery/EmptyState';
import './MyDeliveriesPage.css';

const STATUS_FILTERS = [
  { id: 'ALL', label: 'All Stops' },
  { id: 'PENDING', label: 'Pending' },
  { id: 'PICKED_UP', label: 'Picked Up' },
  { id: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { id: 'DELIVERED', label: 'Delivered' },
  { id: 'FAILED', label: 'Failed' }
];

const MyDeliveriesPage = () => {
  const { orders, activeBatch, setSelectedOrderForDrawer } = useDelivery();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedBatch, setSelectedBatch] = useState('ALL');
  const [dateRange, setDateRange] = useState('today');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'board'
  const [isLoading, setIsLoading] = useState(false);

  // Filter deliveries
  const filteredOrders = useMemo(() => {
    return (orders || []).filter(order => {
      // Status filter
      if (selectedStatus !== 'ALL') {
        if (order.status !== selectedStatus) return false;
      }

      // Search filter (Order ID, Customer Name, Address, Phone)
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesId = (order.orderCode || order.id || '').toLowerCase().includes(query);
        const matchesName = (order.customerName || '').toLowerCase().includes(query);
        const matchesAddress = (order.address || '').toLowerCase().includes(query);
        const matchesPhone = (order.phone || '').includes(query);
        if (!matchesId && !matchesName && !matchesAddress && !matchesPhone) return false;
      }

      return true;
    });
  }, [orders, selectedStatus, searchQuery]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedStatus('ALL');
    setSelectedBatch('ALL');
  };

  // Table columns definition
  const columns = [
    {
      key: 'orderCode',
      label: 'Order ID',
      sortable: true,
      width: '130px',
      render: (val, row) => (
        <span className="order-id-cell dl-heading">
          {val || row.id}
        </span>
      )
    },
    {
      key: 'customerName',
      label: 'Customer',
      sortable: true,
      render: (val, row) => (
        <div className="table-customer-cell">
          <span className="customer-name-bold">{val}</span>
          <span className="customer-phone-sub">{row.phone || '+91 98402 33441'}</span>
        </div>
      )
    },
    {
      key: 'address',
      label: 'Destination Address',
      render: (val) => (
        <div className="table-address-cell" title={val}>
          <MapPin size={13} className="address-icon" />
          <span className="address-line">{val}</span>
        </div>
      )
    },
    {
      key: 'items',
      label: 'Parcels',
      width: '110px',
      render: (val, row) => (
        <span className="items-chip-pill">
          {Array.isArray(val) ? `${val.length} items` : '1 parcel'}
        </span>
      )
    },
    {
      key: 'timeSlot',
      label: 'Window',
      width: '140px',
      render: (val) => (
        <div className="table-slot-cell">
          <Clock size={13} />
          <span>{val || '9 AM – 1 PM'}</span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      width: '160px',
      render: (val) => <DeliveryStatusBadge status={val} size="sm" />
    },
    {
      key: 'codAmount',
      label: 'Payment / COD',
      sortable: true,
      width: '130px',
      render: (val) => (
        <span className={`cod-cell dl-tabular ${val > 0 ? 'is-cod' : 'is-prepaid'}`}>
          {val > 0 ? `₹${val} COD` : 'Prepaid (₹0)'}
        </span>
      )
    }
  ];

  // Grouped for Kanban Board view
  const boardColumns = [
    { id: 'PENDING', title: 'Pending Pickup', status: 'PENDING' },
    { id: 'PICKED_UP', title: 'Picked Up', status: 'PICKED_UP' },
    { id: 'OUT_FOR_DELIVERY', title: 'Out for Delivery', status: 'OUT_FOR_DELIVERY' },
    { id: 'DELIVERED', title: 'Delivered', status: 'DELIVERED' }
  ];

  return (
    <div className="dl-deliveries-page">
      <PageHeader
        breadcrumbs={['Operations', 'Manifest']}
        title="My Deliveries"
        subtitle={`Tracking ${orders?.length || 0} assigned delivery stops across active batches`}
        badge="Active Dispatch"
        actions={
          <div className="deliveries-header-actions">
            {/* List / Board View Toggle */}
            <div className="view-mode-toggle" role="group" aria-label="Toggle layout view">
              <button
                type="button"
                className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List View"
                aria-pressed={viewMode === 'list'}
              >
                <LayoutList size={16} />
                <span>List</span>
              </button>
              <button
                type="button"
                className={`toggle-btn ${viewMode === 'board' ? 'active' : ''}`}
                onClick={() => setViewMode('board')}
                title="Board View"
                aria-pressed={viewMode === 'board'}
              >
                <LayoutGrid size={16} />
                <span>Board</span>
              </button>
            </div>
          </div>
        }
      >
        {/* Filter Bar Controls */}
        <div className="dl-filter-bar">
          {/* Search Box */}
          <div className="filter-search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search by Order ID, customer, address..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="filter-search-input"
            />
            {searchQuery && (
              <button 
                type="button" 
                className="search-clear-btn" 
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Batch Selector Dropdown */}
          <div className="filter-select-wrapper">
            <select
              value={selectedBatch}
              onChange={e => setSelectedBatch(e.target.value)}
              className="filter-select"
              aria-label="Filter by Batch"
            >
              <option value="ALL">All Batches</option>
              <option value="BATCH-4082">BATCH-4082 (Current)</option>
              <option value="BATCH-4081">BATCH-4081 (Morning)</option>
            </select>
          </div>

          {/* Date Range Presets */}
          <div className="filter-select-wrapper">
            <select
              value={dateRange}
              onChange={e => setDateRange(e.target.value)}
              className="filter-select"
              aria-label="Select Date Range"
            >
              <option value="today">Today (Sep 30)</option>
              <option value="yesterday">Yesterday</option>
              <option value="7d">Last 7 Days</option>
            </select>
          </div>
        </div>

        {/* Status Filter Chips Row */}
        <div className="filter-chips-scroll">
          {STATUS_FILTERS.map(chip => {
            const count = chip.id === 'ALL'
              ? orders.length
              : orders.filter(o => o.status === chip.id).length;
            const isSelected = selectedStatus === chip.id;

            return (
              <button
                key={chip.id}
                type="button"
                className={`filter-chip ${isSelected ? 'is-selected' : ''}`}
                onClick={() => setSelectedStatus(chip.id)}
              >
                <span>{chip.label}</span>
                <span className="chip-count-badge dl-tabular">{count}</span>
              </button>
            );
          })}
        </div>
      </PageHeader>

      {/* Main Content Area */}
      {filteredOrders.length === 0 ? (
        <EmptyState
          title="No deliveries match your filters"
          description="Try broadening your search term or clearing the active status filters to view all stops."
          primaryAction={{
            label: "Clear All Filters",
            onClick: clearFilters
          }}
        />
      ) : viewMode === 'list' ? (
        /* List View: Rich DataTable */
        <div className="deliveries-table-card">
          <DataTable
            columns={columns}
            data={filteredOrders}
            isLoading={isLoading}
            onRowClick={(row) => setSelectedOrderForDrawer(row)}
            emptyMessage="No deliveries found."
          />
        </div>
      ) : (
        /* Board / Kanban View */
        <div className="deliveries-kanban-board">
          {boardColumns.map(bCol => {
            const colOrders = filteredOrders.filter(o => o.status === bCol.status);

            return (
              <div key={bCol.id} className="kanban-column">
                <div className="kanban-column-header">
                  <div className="column-title-group">
                    <span className="column-title">{bCol.title}</span>
                    <span className="column-counter dl-tabular">{colOrders.length}</span>
                  </div>
                </div>

                <div className="kanban-cards-stack">
                  {colOrders.length === 0 ? (
                    <div className="kanban-empty-slot">
                      <span>No orders in this phase</span>
                    </div>
                  ) : (
                    colOrders.map(ord => (
                      <div
                        key={ord.id}
                        className="dl-card kanban-card dl-card-hover"
                        onClick={() => setSelectedOrderForDrawer(ord)}
                      >
                        <div className="kanban-card-top">
                          <span className="card-order-code dl-heading">{ord.orderCode || ord.id}</span>
                          <span className="card-time-tag">{ord.timeSlot || '9 AM'}</span>
                        </div>

                        <div className="card-customer-name">{ord.customerName}</div>
                        <p className="card-address-snippet">{ord.address}</p>

                        <div className="kanban-card-bottom">
                          <span className={`card-cod-badge dl-tabular ${ord.codAmount > 0 ? 'cod-val' : 'paid-val'}`}>
                            {ord.codAmount > 0 ? `₹${ord.codAmount} COD` : 'Prepaid'}
                          </span>
                          <span className="card-click-hint">Details →</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyDeliveriesPage;

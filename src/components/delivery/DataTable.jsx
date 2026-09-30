import React, { useState } from 'react';
import { ArrowUpDown, ChevronRight, Phone, MapPin, Eye } from 'lucide-react';
import DeliveryStatusBadge from './DeliveryStatusBadge';
import './DataTable.css';

const DataTable = ({
  columns = [],
  data = [],
  onRowClick,
  isLoading = false,
  emptyMessage = 'No deliveries match your filters.'
}) => {
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSort = (key) => {
    if (sortField === key) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(key);
      setSortDirection('asc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortField) return 0;
    const aVal = a[sortField];
    const bVal = b[sortField];
    if (aVal === bVal) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;

    const result = aVal > bVal ? 1 : -1;
    return sortDirection === 'asc' ? result : -result;
  });

  if (isLoading) {
    return (
      <div className="dl-table-container">
        <table className="dl-table">
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map(idx => (
              <tr key={idx} className="dl-table-skeleton-row">
                {columns.map(col => (
                  <td key={col.key}>
                    <div className="dl-skeleton" style={{ height: '16px', width: '80%' }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="dl-table-container">
      <table className="dl-table">
        <thead>
          <tr>
            {columns.map(col => (
              <th
                key={col.key}
                onClick={() => col.sortable && handleSort(col.key)}
                className={col.sortable ? 'sortable-th' : ''}
                style={{ width: col.width }}
              >
                <div className="th-content">
                  <span>{col.label}</span>
                  {col.sortable && <ArrowUpDown size={13} className="sort-icon" />}
                </div>
              </th>
            ))}
            <th style={{ width: '48px' }} aria-label="Row Actions" />
          </tr>
        </thead>
        <tbody>
          {sortedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} className="dl-table-empty">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map((row, idx) => (
              <tr
                key={row.id || idx}
                onClick={() => onRowClick && onRowClick(row)}
                className="dl-table-row dl-row-clickable"
              >
                {columns.map(col => (
                  <td key={col.key} className={col.className || ''}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
                <td className="row-action-td">
                  <div className="row-hover-btn" title="View Details">
                    <ChevronRight size={16} />
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;

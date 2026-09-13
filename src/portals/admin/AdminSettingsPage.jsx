import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Settings, Save, CheckCircle, Sliders } from 'lucide-react';
import '../seller/DashboardOverview.css';

const AdminSettingsPage = () => {
  const { adminSettings, updateAdminSettings } = useAppContext();

  const [formData, setFormData] = useState(adminSettings);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateAdminSettings(formData);
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>System & Aggregation Configuration</h2>
          <p>Configure parameters for the Smart Order Aggregation engine and logistics operations.</p>
        </div>
      </div>

      {successMsg && (
        <div className="alert alert-success" style={{ marginBottom: '16px' }}>
          <CheckCircle size={18} /> System aggregation parameters updated successfully!
        </div>
      )}

      <div className="card" style={{ maxWidth: '650px', padding: '24px' }}>
        <h4 style={{ margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sliders size={20} className="text-primary" /> Smart Aggregation Rules
        </h4>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label htmlFor="setting-maxdist" className="form-label">Maximum Grouping Radius / Distance (km)</label>
            <input 
              type="number" 
              id="setting-maxdist"
              className="form-control" 
              step="0.5"
              value={Number.isNaN(formData.maxGroupDistance) ? '' : formData.maxGroupDistance}
              onChange={e => {
                const val = parseFloat(e.target.value);
                setFormData({ ...formData, maxGroupDistance: Number.isNaN(val) ? '' : val });
              }}
            />
            <span style={{ fontSize: '12px', color: '#64748b' }}>Maximum travel distance between pickup and delivery locations in a single batch.</span>
          </div>

          <div>
            <label htmlFor="setting-maxorders" className="form-label">Maximum Orders Per Delivery Batch</label>
            <input 
              type="number" 
              id="setting-maxorders"
              className="form-control" 
              min="1" 
              max="10"
              value={Number.isNaN(formData.maxOrdersPerBatch) ? '' : formData.maxOrdersPerBatch}
              onChange={e => {
                const val = parseInt(e.target.value, 10);
                setFormData({ ...formData, maxOrdersPerBatch: Number.isNaN(val) ? '' : val });
              }}
            />
            <span style={{ fontSize: '12px', color: '#64748b' }}>Upper limit on orders combined into a single driver delivery batch.</span>
          </div>

          <div>
            <label htmlFor="setting-capacity" className="form-label">Default Driver Carrying Capacity</label>
            <input 
              type="number" 
              id="setting-capacity"
              className="form-control" 
              min="1" 
              max="10"
              value={Number.isNaN(formData.defaultAgentCapacity) ? '' : formData.defaultAgentCapacity}
              onChange={e => {
                const val = parseInt(e.target.value, 10);
                setFormData({ ...formData, defaultAgentCapacity: Number.isNaN(val) ? '' : val });
              }}
            />
          </div>

          <div>
            <label htmlFor="setting-compat" className="form-label">Minimum Aggregation Compatibility Score (%)</label>
            <input 
              type="number" 
              id="setting-compat"
              className="form-control" 
              min="50" 
              max="100"
              value={Number.isNaN(formData.minCompatibilityScore) ? '' : formData.minCompatibilityScore}
              onChange={e => {
                const val = parseInt(e.target.value, 10);
                setFormData({ ...formData, minCompatibilityScore: Number.isNaN(val) ? '' : val });
              }}
            />
            <span style={{ fontSize: '12px', color: '#64748b' }}>Suggested batch recommendations below this score will be flagged for manual review.</span>
          </div>

          <div style={{ marginTop: '12px' }}>
            <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Save size={16} /> Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSettingsPage;

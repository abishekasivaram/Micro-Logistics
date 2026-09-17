import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { 
  Settings, Save, CheckCircle2, Sliders, Cpu, Activity, 
  Layers, Compass, ShieldCheck, RefreshCw 
} from 'lucide-react';
import './AdminSettingsPage.css';

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h2>System & Aggregation Configuration</h2>
            <span className="badge badge-primary">V2.4 CORE</span>
          </div>
          <p>Fine-tune operational constraints, geographic clustering limits, and heuristic batch aggregation thresholds.</p>
        </div>
      </div>

      {successMsg && (
        <div className="alert alert-success" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={18} />
          <span>Aggregation engine configuration saved and dispatched to active routing workers.</span>
        </div>
      )}

      <div className="settings-layout">
        {/* Main Settings Form */}
        <div>
          <form onSubmit={handleSubmit}>
            {/* Spatial & Density Rules */}
            <div className="settings-card">
              <div className="settings-card-header">
                <div className="settings-icon-chip">
                  <Compass size={22} />
                </div>
                <div>
                  <h3>Spatial Clustering & Corridors</h3>
                  <p>Define geographic bounds and density limits for autonomous consignment consolidation.</p>
                </div>
              </div>

              <div className="settings-form-group">
                <div className="settings-field">
                  <div className="settings-field-header">
                    <label htmlFor="setting-maxdist" className="settings-label">
                      Maximum Grouping Radius
                    </label>
                  </div>
                  <div className="input-with-affix">
                    <input 
                      type="number" 
                      id="setting-maxdist"
                      className="form-control" 
                      step="0.5"
                      min="1"
                      max="50"
                      value={Number.isNaN(formData.maxGroupDistance) ? '' : formData.maxGroupDistance}
                      onChange={e => {
                        const val = parseFloat(e.target.value);
                        setFormData({ ...formData, maxGroupDistance: Number.isNaN(val) ? '' : val });
                      }}
                    />
                    <span className="input-affix">KM</span>
                  </div>
                  <span className="settings-hint">
                    Maximum corridor separation between pickup hubs and customer dropoffs allowed in a single consolidated batch.
                  </span>
                </div>

                <div className="settings-field">
                  <div className="settings-field-header">
                    <label htmlFor="setting-maxorders" className="settings-label">
                      Batch Order Density Limit
                    </label>
                  </div>
                  <div className="input-with-affix">
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
                    <span className="input-affix">ORDERS</span>
                  </div>
                  <span className="settings-hint">
                    Absolute ceiling of individual order consignments bundled together into a single courier run.
                  </span>
                </div>
              </div>
            </div>

            {/* Fleet & Agent Capacity */}
            <div className="settings-card">
              <div className="settings-card-header">
                <div className="settings-icon-chip">
                  <Layers size={22} />
                </div>
                <div>
                  <h3>Courier & Fleet Allocation</h3>
                  <p>Calibrate courier workload constraints and standard consignment capacities.</p>
                </div>
              </div>

              <div className="settings-form-group">
                <div className="settings-field">
                  <div className="settings-field-header">
                    <label htmlFor="setting-capacity" className="settings-label">
                      Default Courier Carrying Capacity
                    </label>
                  </div>
                  <div className="input-with-affix">
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
                    <span className="input-affix">PARCELS</span>
                  </div>
                  <span className="settings-hint">
                    Baseline cargo allowance assigned to standard two-wheeler couriers upon onboarding.
                  </span>
                </div>
              </div>
            </div>

            {/* Heuristic Scoring Thresholds */}
            <div className="settings-card">
              <div className="settings-card-header">
                <div className="settings-icon-chip">
                  <Cpu size={22} />
                </div>
                <div>
                  <h3>Heuristic Compatibility Engine</h3>
                  <p>Filter proposed batch candidates based on route alignment and time-window convergence.</p>
                </div>
              </div>

              <div className="settings-form-group">
                <div className="settings-field">
                  <div className="settings-field-header">
                    <label htmlFor="setting-compat" className="settings-label">
                      Minimum Compatibility Confidence Score
                    </label>
                  </div>
                  <div className="input-with-affix">
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
                    <span className="input-affix">% MATCH</span>
                  </div>
                  <span className="settings-hint">
                    Batch pairings scoring below this threshold require administrator manual confirmation prior to dispatch.
                  </span>

                  <div className="compat-score-preview">
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Auto-Approval Bar:</span>
                    <div className="compat-score-bar-bg">
                      <div 
                        className="compat-score-bar-fill" 
                        style={{ width: `${Math.min(100, Math.max(0, formData.minCompatibilityScore || 70))}%` }}
                      />
                    </div>
                    <span className="compat-score-val">{formData.minCompatibilityScore || 0}%</span>
                  </div>
                </div>
              </div>

              <div className="settings-actions">
                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Save size={16} /> Save Configuration
                </button>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => setFormData(adminSettings)}
                >
                  <RefreshCw size={14} /> Revert Changes
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Telemetry & Engine Overview Sidebar */}
        <div>
          <div className="telemetry-sidebar-card">
            <div className="telemetry-header">
              <span className="telemetry-title">
                <Activity size={16} color="#10b981" /> Engine Telemetry
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div className="telemetry-indicator-pulse" />
                <span style={{ fontSize: '11px', color: '#10b981', fontWeight: '700' }}>ONLINE</span>
              </div>
            </div>

            <div className="telemetry-stat-row">
              <span className="telemetry-stat-label">Clustering Model</span>
              <span className="telemetry-pill">Haversine-DBSCAN</span>
            </div>

            <div className="telemetry-stat-row">
              <span className="telemetry-stat-label">Active Radius Limit</span>
              <span className="telemetry-stat-val">{formData.maxGroupDistance || 5} km</span>
            </div>

            <div className="telemetry-stat-row">
              <span className="telemetry-stat-label">Max Orders / Mission</span>
              <span className="telemetry-stat-val">{formData.maxOrdersPerBatch || 3} pkgs</span>
            </div>

            <div className="telemetry-stat-row">
              <span className="telemetry-stat-label">Courier Standard Load</span>
              <span className="telemetry-stat-val">{formData.defaultAgentCapacity || 5} units</span>
            </div>

            <div className="telemetry-stat-row">
              <span className="telemetry-stat-label">Auto-Match Threshold</span>
              <span className="telemetry-stat-val" style={{ color: '#38BDF8' }}>{formData.minCompatibilityScore || 70}%</span>
            </div>

            <div className="telemetry-stat-row" style={{ borderBottom: 'none' }}>
              <span className="telemetry-stat-label">Mesh Optimization</span>
              <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '600' }}>Real-Time Sync</span>
            </div>

            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94A3B8', fontSize: '12px' }}>
                <ShieldCheck size={16} color="#38BDF8" />
                <span>All parameters enforced in sub-second routing passes.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;

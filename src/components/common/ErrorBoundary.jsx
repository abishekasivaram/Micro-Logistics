import React from 'react';
import { AlertOctagon, RefreshCw, Home } from 'lucide-react';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // In production, send to telemetry service (e.g., Sentry)
    console.error('ErrorBoundary caught an uncaught exception:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container" role="alert" aria-live="assertive">
          <div className="error-boundary-card">
            <div className="error-boundary-icon">
              <AlertOctagon size={48} className="text-danger" />
            </div>
            <h2>Something went wrong</h2>
            <p className="error-boundary-message">
              An unexpected application error occurred while rendering this view. Our team has been notified.
            </p>
            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <details className="error-boundary-details">
                <summary>Technical Details</summary>
                <pre>{this.state.error.toString()}</pre>
                <pre>{this.state.errorInfo?.componentStack}</pre>
              </details>
            )}
            <div className="error-boundary-actions">
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={this.handleReload}
              >
                <RefreshCw size={16} style={{ marginRight: '6px' }} /> Reload Page
              </button>
              <button 
                type="button" 
                className="btn btn-outline"
                onClick={this.handleReset}
              >
                <Home size={16} style={{ marginRight: '6px' }} /> Return Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

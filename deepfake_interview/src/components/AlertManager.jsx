import { useState, useEffect, useCallback } from 'react';
import { AlertOctagon, X } from 'lucide-react';
import './AlertManager.css';

function AlertManager() {
  const [alerts, setAlerts] = useState([]);

  const dismissAlert = useCallback((id) => {
    setAlerts((prev) => prev.filter(alert => alert.id !== id));
  }, []);

  useEffect(() => {
    const handleAlertEvent = (e) => {
      const newAlert = {
        id: Date.now() + Math.random(),
        ...e.detail
      };
      setAlerts((prev) => [...prev, newAlert]);
      
      // Auto-dismiss after 7 seconds
      setTimeout(() => {
        setAlerts((current) => current.filter(a => a.id !== newAlert.id));
      }, 7000);
    };

    window.addEventListener('interview-alert', handleAlertEvent);
    return () => window.removeEventListener('interview-alert', handleAlertEvent);
  }, []);

  if (alerts.length === 0) return null;

  return (
    <div className="alert-container">
      {alerts.map(alert => (
        <div key={alert.id} className="alert-toast">
          <div className="alert-header">
            <div className="alert-title">
              <AlertOctagon size={18} />
              <span>INTERVIEW INTEGRITY ALERT</span>
            </div>
            <button className="btn-close" onClick={() => dismissAlert(alert.id)} aria-label="Dismiss">
              <X size={16} />
            </button>
          </div>
          
          <div className="alert-body">
            <h4 className="alert-event-title">{alert.title}</h4>
            {alert.duration && <p className="alert-meta">Duration: {alert.duration} seconds</p>}
            <p className="alert-desc">{alert.description}</p>
            
            {alert.riskContribution !== undefined && (
              <div className="alert-impact">
                Risk contribution: <span className="text-danger">+{alert.riskContribution}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default AlertManager;

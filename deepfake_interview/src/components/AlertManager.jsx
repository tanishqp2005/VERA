import { useState, useEffect } from 'react';
import { AlertOctagon, X } from 'lucide-react';
import './AlertManager.css';

function AlertManager() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    // Listen for custom alert events
    const handleAlertEvent = (e) => {
      const newAlert = {
        id: Date.now(),
        ...e.detail
      };
      setAlerts((prev) => [...prev, newAlert]);
      
      // Auto-dismiss after 8 seconds
      setTimeout(() => {
        dismissAlert(newAlert.id);
      }, 8000);
    };

    window.addEventListener('interview-alert', handleAlertEvent);
    
    // Simulate one alert for demo purposes on load if we want to show it off
    // But better to let the user trigger it.

    return () => window.removeEventListener('interview-alert', handleAlertEvent);
  }, []);

  const dismissAlert = (id) => {
    setAlerts((prev) => prev.filter(alert => alert.id !== id));
  };

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
            <button className="btn-close" onClick={() => dismissAlert(alert.id)}>
              <X size={16} />
            </button>
          </div>
          
          <div className="alert-body">
            <h4 className="alert-event-title">{alert.title}</h4>
            {alert.duration && <p className="alert-meta">Duration: {alert.duration} seconds</p>}
            <p className="alert-desc">{alert.description}</p>
            
            <div className="alert-impact">
              Risk contribution: <span className="text-danger">+{alert.riskContribution}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AlertManager;

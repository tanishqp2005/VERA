import { Link } from 'react-router-dom';
import { ShieldAlert, Activity, Fingerprint, Eye, Bot, Cpu } from 'lucide-react';
import './Home.css';

function Home() {
  return (
    <div className="home-page">
      <div className="hero-section container">
        <div className="hero-content">
          <div className="badge animate-fade-in">AI + Cyber Defense</div>
          <h1 className="hero-title animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Trust the Interview.<br/>
            <span className="highlight">Verify the Evidence.</span>
          </h1>
          <p className="hero-subtitle animate-fade-in" style={{ animationDelay: '0.2s' }}>
            AI-powered interview integrity analysis that detects profile-response inconsistencies, 
            suspicious assistance patterns, and behavioral anomalies — while keeping the 
            final decision in human hands.
          </p>
          <div className="hero-actions animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Link to="/analyze" className="btn btn-primary">
              <ShieldAlert size={18} /> Analyze Interview
            </Link>
            <Link to="/test-cases" className="btn btn-outline">
              <Activity size={18} /> View Demo
            </Link>
          </div>
        </div>

        <div className="hero-visual animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="integrity-monitor">
            <div className="monitor-center">
              <ShieldAlert size={48} className="center-icon" />
              <div className="pulse-rings">
                <div className="ring ring-1"></div>
                <div className="ring ring-2"></div>
                <div className="ring ring-3"></div>
              </div>
            </div>
            
            <div className="nodes">
              <div className="node node-1 glass-panel">
                <div className="node-icon"><Fingerprint size={16} /></div>
                <div className="node-info">
                  <span className="node-label">PROFILE CONSISTENCY</span>
                  <span className="node-value">94%</span>
                </div>
              </div>
              <div className="node node-2 glass-panel">
                <div className="node-icon"><Cpu size={16} /></div>
                <div className="node-info">
                  <span className="node-label">TECHNICAL DEPTH</span>
                  <span className="node-value">81%</span>
                </div>
              </div>
              <div className="node node-3 glass-panel">
                <div className="node-icon"><Bot size={16} /></div>
                <div className="node-info">
                  <span className="node-label">ASSISTANCE SIGNAL</span>
                  <span className="node-value text-safe">LOW</span>
                </div>
              </div>
              <div className="node node-4 glass-panel">
                <div className="node-icon"><Eye size={16} /></div>
                <div className="node-info">
                  <span className="node-label">BEHAVIORAL ANOMALY</span>
                  <span className="node-value text-safe">LOW</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="system-status-panel glass-panel">
            <div className="panel-header">SYSTEM STATUS</div>
            <div className="status-row">
              <span>Profile Engine</span>
              <span className="text-safe">READY</span>
            </div>
            <div className="status-row">
              <span>NLP Comparison</span>
              <span className="text-safe">READY</span>
            </div>
            <div className="status-row">
              <span>Anomaly Engine</span>
              <span className="text-safe">READY</span>
            </div>
            <div className="status-row">
              <span>Risk Engine</span>
              <span className="text-safe">READY</span>
            </div>
            <div className="status-row highlight-row">
              <span>Human Review</span>
              <span className="text-warn">REQUIRED</span>
            </div>
          </div>
        </div>
      </div>
      <div className="privacy-notice container">
        <p>Demo environment uses synthetic candidate profiles. No real biometric or personal data is required.</p>
      </div>
    </div>
  );
}

export default Home;

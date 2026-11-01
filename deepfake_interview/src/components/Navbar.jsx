import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import './Navbar.css';

function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar glass-panel">
      <div className="navbar-container container">
        <Link to="/" className="navbar-brand">
          <ShieldCheck className="brand-icon" size={28} />
          <div className="brand-text">
            <span className="brand-title">VERA</span>
            <span className="brand-subtitle">Virtual Interview Risk Analyzer</span>
          </div>
        </Link>
        
        <div className="navbar-links">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Dashboard</Link>
          <Link to="/live" className={location.pathname === '/live' ? 'active' : ''}>Live Monitor</Link>
          <Link to="/analyze" className={location.pathname === '/analyze' ? 'active' : ''}>Analyze Video</Link>
          <Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>How It Works</Link>
        </div>
        
        <div className="navbar-status">
          <span className="status-label">SYSTEM STATUS</span>
          <div className="status-indicator">
            <span className="status-dot online"></span>
            <span className="status-text">ONLINE</span>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

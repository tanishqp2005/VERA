import { Link, useNavigate } from 'react-router-dom';
import { Activity, ShieldAlert, CheckCircle, Clock, Plus, Users, BarChart2 } from 'lucide-react';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();

  const recentInterviews = [
    { id: 'CAND-5911', name: 'Riya Desai', role: 'ML Intern', date: 'Oct 19, 2023', risk: 72, level: 'HIGH RISK' },
    { id: 'CAND-3912', name: 'Kabir Patel', role: 'Data Intern', date: 'Oct 17, 2023', risk: 52, level: 'MEDIUM RISK' },
    { id: 'CAND-1042', name: 'Aarav Shah', role: 'SDE Intern', date: 'Oct 15, 2023', risk: 18, level: 'LOW RISK' },
    { id: 'CAND-2819', name: 'Rahul Shah', role: 'ML Intern', date: 'Oct 16, 2023', risk: 65, level: 'HIGH RISK' },
  ];

  const getRiskClass = (risk) => {
    if (risk >= 60) return 'text-danger';
    if (risk >= 30) return 'text-warn';
    return 'text-safe';
  };

  return (
    <div className="dashboard-page container">
      <header className="dashboard-header">
        <div>
          <h1>Company Dashboard</h1>
          <p>Monitor interview integrity and candidate evidence across your organization.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-outline" onClick={() => navigate('/live')}>
            LIVE ANALYSIS
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/create')}>
            <Plus size={18} /> CREATE INTERVIEW
          </button>
        </div>
      </header>

      <div className="stats-grid">
        <div className="stat-card glass-panel">
          <div className="stat-icon"><Clock size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">ACTIVE INTERVIEWS</span>
            <span className="stat-value">12</span>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon"><CheckCircle size={24} color="var(--risk-low)" /></div>
          <div className="stat-content">
            <span className="stat-label">COMPLETED</span>
            <span className="stat-value">148</span>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon"><ShieldAlert size={24} color="var(--risk-high)" /></div>
          <div className="stat-content">
            <span className="stat-label">FLAGGED FOR REVIEW</span>
            <span className="stat-value text-danger">24</span>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon"><BarChart2 size={24} color="var(--risk-medium)" /></div>
          <div className="stat-content">
            <span className="stat-label">AVG INTEGRITY RISK</span>
            <span className="stat-value text-warn">28%</span>
          </div>
        </div>
      </div>

      <div className="glass-panel table-panel">
        <div className="panel-heading">
          <Users size={18} />
          <h2>Recent Interviews</h2>
        </div>
        
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>CANDIDATE ID</th>
                <th>NAME</th>
                <th>ROLE</th>
                <th>DATE</th>
                <th>RISK SCORE</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {recentInterviews.map((interview, index) => (
                <tr key={index}>
                  <td className="mono">{interview.id}</td>
                  <td className="font-medium">{interview.name}</td>
                  <td>{interview.role}</td>
                  <td>{interview.date}</td>
                  <td>
                    <div className="risk-badge-container">
                      <span className={`risk-score-value ${getRiskClass(interview.risk)}`}>{interview.risk}</span>
                      <span className={`risk-badge ${getRiskClass(interview.risk).replace('text-', 'bg-')}`}>
                        {interview.level}
                      </span>
                    </div>
                  </td>
                  <td>
                    <button className="btn btn-outline btn-sm" onClick={() => navigate('/test-cases')}>
                      View Demo
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

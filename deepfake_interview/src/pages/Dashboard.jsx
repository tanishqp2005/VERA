import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, CheckCircle, Clock, Plus, Users, BarChart2, Video, Search, Trash2 } from 'lucide-react';
import { getInterviews, getDashboardStats, deleteInterview } from '../logic/interviewStorage';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState(() => getInterviews());
  const [stats, setStats] = useState(() => getDashboardStats());

  const loadData = () => {
    setInterviews(getInterviews());
    setStats(getDashboardStats());
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to remove this interview record?")) {
      deleteInterview(id);
      loadData();
    }
  };

  const getRiskClass = (risk) => {
    if (typeof risk !== 'number') return 'text-muted';
    if (risk >= 60) return 'text-danger';
    if (risk >= 30) return 'text-warn';
    return 'text-safe';
  };

  const getRiskBadgeBg = (risk) => {
    if (typeof risk !== 'number') return 'bg-muted';
    if (risk >= 60) return 'bg-danger';
    if (risk >= 30) return 'bg-warn';
    return 'bg-safe';
  };

  return (
    <div className="dashboard-page container">
      <header className="dashboard-header">
        <div>
          <h1>Company Dashboard</h1>
          <p>Monitor virtual interview integrity, evidence, and risk metrics across your organization.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button className="btn btn-outline" onClick={() => navigate('/live')}>
            <Video size={18} /> LIVE MONITOR
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
            <span className="stat-label">TOTAL SESSIONS</span>
            <span className="stat-value">{stats.total}</span>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon"><CheckCircle size={24} color="var(--risk-low)" /></div>
          <div className="stat-content">
            <span className="stat-label">COMPLETED</span>
            <span className="stat-value">{stats.completed}</span>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon"><ShieldAlert size={24} color="var(--risk-high)" /></div>
          <div className="stat-content">
            <span className="stat-label">FLAGGED FOR REVIEW</span>
            <span className={`stat-value ${stats.flagged > 0 ? 'text-danger' : ''}`}>{stats.flagged}</span>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon"><BarChart2 size={24} color="var(--risk-medium)" /></div>
          <div className="stat-content">
            <span className="stat-label">AVG INTEGRITY RISK</span>
            <span className="stat-value text-warn">{stats.avgRisk}%</span>
          </div>
        </div>
      </div>

      <div className="glass-panel table-panel">
        <div className="panel-heading">
          <Users size={18} />
          <h2>Interview Records</h2>
        </div>
        
        {interviews.length === 0 ? (
          <div className="empty-state text-center py-8">
            <ShieldAlert size={48} className="text-muted mb-3" style={{ opacity: 0.5 }} />
            <h3>No Interviews Recorded Yet</h3>
            <p className="text-muted max-w-md mx-auto mb-4">
              Get started by creating a candidate baseline, conducting a real-time live session, or analyzing an uploaded interview video.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => navigate('/create')}>
                <Plus size={16} /> Create Interview
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/live')}>
                <Video size={16} /> Start Live Session
              </button>
            </div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>CANDIDATE ID</th>
                  <th>NAME</th>
                  <th>ROLE</th>
                  <th>DATE</th>
                  <th>RISK SCORE</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {interviews.map((interview) => {
                  const candidate = interview.candidate || {};
                  const riskScore = interview.riskScore !== undefined ? interview.riskScore : interview.score;
                  const riskLevel = interview.riskLevel || (riskScore !== undefined ? (riskScore >= 60 ? 'HIGH RISK' : riskScore >= 30 ? 'MEDIUM RISK' : 'LOW RISK') : 'PENDING');
                  const dateStr = candidate.interviewDate || candidate.date || interview.updatedAt?.split('T')[0] || 'Today';

                  return (
                    <tr key={interview.id || candidate.id}>
                      <td className="mono">{candidate.id || interview.id}</td>
                      <td className="font-medium">{candidate.name || 'Unnamed Candidate'}</td>
                      <td>{candidate.role || 'Unspecified'}</td>
                      <td>{dateStr}</td>
                      <td>
                        {riskScore !== undefined ? (
                          <div className="risk-badge-container">
                            <span className={`risk-score-value ${getRiskClass(riskScore)}`}>
                              {riskScore}/100
                            </span>
                            <span className={`risk-badge ${getRiskBadgeBg(riskScore)}`}>
                              {riskLevel}
                            </span>
                          </div>
                        ) : (
                          <span className="risk-badge bg-muted">READY TO ANALYZE</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {riskScore !== undefined ? (
                            <>
                              <button 
                                className="btn btn-outline btn-sm" 
                                onClick={() => navigate('/results', { state: interview })}
                                title="View integrity analysis results"
                              >
                                View Report
                              </button>
                              <button 
                                className="btn btn-outline btn-sm" 
                                onClick={() => navigate('/investigation', { state: interview })}
                                title="Open investigation console"
                              >
                                <Search size={14} />
                              </button>
                            </>
                          ) : (
                            <button 
                              className="btn btn-primary btn-sm" 
                              onClick={() => navigate('/analyze', { state: { candidateData: interview } })}
                            >
                              Analyze
                            </button>
                          )}
                          <button 
                            className="btn-icon" 
                            style={{ color: 'var(--text-muted)' }}
                            onClick={(e) => handleDelete(interview.id || candidate.id, e)}
                            title="Delete interview"
                            aria-label="Delete interview"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;

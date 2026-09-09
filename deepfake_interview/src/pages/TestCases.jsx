import { useNavigate } from 'react-router-dom';
import { testCases } from '../data/testCases';
import { Play, Users, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import './TestCases.css';

function TestCases() {
  const navigate = useNavigate();

  const handleRunTestCase = (candidateData) => {
    navigate('/review', { state: { candidateData } });
  };

  const getIconForCase = (id) => {
    switch(id) {
      case 'normal': return <CheckCircle2 color="var(--risk-low)" size={24} />;
      case 'skill_mismatch': return <AlertTriangle color="var(--risk-medium)" size={24} />;
      case 'prompting': return <Users color="var(--risk-medium)" size={24} />;
      case 'av_anomaly': return <AlertTriangle color="var(--risk-high)" size={24} />;
      case 'multiple_inconsistencies': return <AlertTriangle color="var(--risk-high)" size={24} />;
      case 'poor_quality': return <Users color="var(--text-muted)" size={24} />;
      case 'edge_case': return <ShieldCheck color="var(--risk-low)" size={24} />;
      default: return <Users size={24} />;
    }
  };

  return (
    <div className="test-cases-page container">
      <div className="page-header">
        <h1>Synthetic Demo Cases</h1>
        <p>Select a pre-configured synthetic candidate profile to demonstrate the risk engine logic. No real personal data is used.</p>
      </div>

      <div className="test-cases-grid">
        {testCases.map((tc) => (
          <div key={tc.id} className="test-case-card glass-panel">
            <div className="card-header">
              <div className="card-icon">{getIconForCase(tc.id)}</div>
              <h2>{tc.label}</h2>
            </div>
            
            <p className="case-description">{tc.description}</p>
            
            <div className="case-details">
              <div className="detail-row">
                <span className="label">Candidate:</span>
                <span className="value">{tc.candidate.name} ({tc.candidate.role})</span>
              </div>
              <div className="detail-row">
                <span className="label">Claimed Exp:</span>
                <span className="value">{tc.candidate.experience}</span>
              </div>
            </div>

            <button className="btn btn-primary run-btn" onClick={() => handleRunTestCase(tc)}>
              <Play size={16} /> LOAD SCENARIO
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TestCases;

import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { calculateRisk } from '../logic/riskEngine';
import { ShieldAlert, ArrowLeft, Download, MessageSquare, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import './Results.css';

function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);

  const data = location.state;

  useEffect(() => {
    if (!data || !data.candidate) {
      navigate('/analyze');
      return;
    }
    
    // Run risk engine
    const res = calculateRisk(data.candidate, data.interview, data.observations);
    setResult(res);
  }, [data, navigate]);

  if (!result || !data) return null;

  const { score, level, reasons, evidence, subScores } = result;

  const getScoreColor = () => {
    if (score >= 60) return 'var(--risk-high)';
    if (score >= 30) return 'var(--risk-medium)';
    return 'var(--risk-low)';
  };

  const getScoreClass = () => {
    if (score >= 60) return 'high-risk';
    if (score >= 30) return 'medium-risk';
    return 'low-risk';
  };

  return (
    <div className="results-page container">
      <div className="back-nav">
        <button className="btn btn-outline" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back to Analysis
        </button>
      </div>

      <header className="results-header">
        <div className="header-subtitle">INTERVIEW INTEGRITY RESULT</div>
        <h1>Candidate: {data.candidate.name}</h1>
        <div className="role-badge">{data.candidate.role}</div>
      </header>

      <div className="results-grid">
        {/* LEFT COLUMN: Score & Breakdown */}
        <div className="results-left">
          <div className="glass-panel score-panel">
            <div className={`circular-score ${getScoreClass()}`}>
              <svg viewBox="0 0 100 100" className="score-svg">
                <circle className="score-bg" cx="50" cy="50" r="45"></circle>
                <circle 
                  className="score-progress" 
                  cx="50" cy="50" r="45" 
                  strokeDasharray="283" 
                  strokeDashoffset={283 - (283 * score) / 100}
                ></circle>
              </svg>
              <div className="score-content">
                <span className="score-value">{score}<span className="score-max">/100</span></span>
                <span className="score-label">{level}</span>
              </div>
            </div>
            
            <p className="score-description">
              {score >= 60 
                ? "Potential integrity inconsistencies detected."
                : score >= 30 
                  ? "Some unusual patterns detected. Review advised."
                  : "No significant integrity risks detected."}
            </p>
          </div>

          <div className="glass-panel breakdown-panel">
            <h3>Risk Breakdown <span className="prototype-label">Prototype indicators</span></h3>
            
            <div className="breakdown-items">
              <div className="breakdown-item">
                <div className="item-header">
                  <span>PROFILE CONSISTENCY</span>
                  <span>{subScores.profileConsistency}%</span>
                </div>
                <div className="progress-bar"><div className="progress-fill" style={{width: `${subScores.profileConsistency}%`, background: subScores.profileConsistency < 70 ? 'var(--risk-medium)' : 'var(--risk-low)'}}></div></div>
              </div>
              
              <div className="breakdown-item">
                <div className="item-header">
                  <span>TECHNICAL DEPTH</span>
                  <span>{subScores.technicalDepth}%</span>
                </div>
                <div className="progress-bar"><div className="progress-fill" style={{width: `${subScores.technicalDepth}%`, background: subScores.technicalDepth < 70 ? 'var(--risk-medium)' : 'var(--risk-low)'}}></div></div>
              </div>
              
              <div className="breakdown-item">
                <div className="item-header">
                  <span>ANSWER CONSISTENCY</span>
                  <span>{subScores.answerConsistency}%</span>
                </div>
                <div className="progress-bar"><div className="progress-fill" style={{width: `${subScores.answerConsistency}%`, background: subScores.answerConsistency < 70 ? 'var(--risk-medium)' : 'var(--risk-low)'}}></div></div>
              </div>
              
              <div className="breakdown-item">
                <div className="item-header">
                  <span>ASSISTANCE SIGNAL</span>
                  <span>{subScores.assistanceSignal}%</span>
                </div>
                <div className="progress-bar"><div className="progress-fill" style={{width: `${subScores.assistanceSignal}%`, background: subScores.assistanceSignal < 70 ? 'var(--risk-high)' : 'var(--risk-low)'}}></div></div>
              </div>
              
              <div className="breakdown-item">
                <div className="item-header">
                  <span>OBSERVATION SIGNAL</span>
                  <span>{subScores.observationSignal}%</span>
                </div>
                <div className="progress-bar"><div className="progress-fill" style={{width: `${subScores.observationSignal}%`, background: subScores.observationSignal < 70 ? 'var(--risk-high)' : 'var(--risk-low)'}}></div></div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Reasons & Actions */}
        <div className="results-right">
          <div className="glass-panel reasons-panel">
            <h3>Why was this flagged?</h3>
            {reasons.length > 0 ? (
              <div className="reasons-list">
                {reasons.map((reason, index) => (
                  <div key={index} className="reason-card">
                    <div className="reason-number">0{index + 1}</div>
                    <div className="reason-content">
                      <h4>{reason.title}</h4>
                      <p>{reason.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-reasons">
                <CheckCircle size={32} color="var(--risk-low)" />
                <p>Profile and answers appear consistent with normal interview patterns.</p>
              </div>
            )}
          </div>

          <div className="glass-panel evidence-panel">
            <h3>Evidence Timeline</h3>
            <div className="timeline">
              {evidence.map((ev, i) => (
                <div key={i} className="timeline-item">
                  <div className="timeline-time">{ev.time}</div>
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">{ev.message}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel action-panel">
        <div className="action-header">
          <AlertTriangle color="var(--risk-medium)" />
          <h3>RECOMMENDED REVIEW ACTION</h3>
        </div>
        
        <p className="action-description">
          {score >= 60 
            ? "Ask 2-3 follow-up technical questions targeting the claimed skills. Conduct a live coding or architecture exercise to verify true depth."
            : score >= 30 
              ? "Probe slightly deeper on areas of inconsistency. Ensure candidate is explaining concepts in their own words."
              : "Proceed with standard interview evaluation process. No anomalous signals detected."
          }
        </p>
        
        <div className="action-buttons">
          <button className="btn btn-outline"><MessageSquare size={16} /> REVIEW ANSWERS</button>
          {score >= 30 && <button className="btn btn-primary"><ShieldAlert size={16} /> ASK FOLLOW-UP</button>}
          <button className="btn btn-secondary"><Download size={16} /> EXPORT REPORT</button>
        </div>
        
        <div className="action-disclaimer">
          <Info size={14} /> The system does not make hiring decisions. It surfaces inconsistencies for interviewer verification.
        </div>
      </div>
    </div>
  );
}

export default Results;

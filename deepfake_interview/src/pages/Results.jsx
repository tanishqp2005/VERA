import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { calculateRisk } from '../logic/riskEngine';
import SkillMatrix from '../components/SkillMatrix';
import FollowUpQuestions from '../components/FollowUpQuestions';
import { ArrowLeft, Download, AlertTriangle, CheckCircle, Info, Search, FileText } from 'lucide-react';
import './Results.css';

function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state;

  const [result] = useState(() => (data && data.candidate) ? calculateRisk(data) : null);

  useEffect(() => {
    if (!data || !data.candidate) {
      navigate('/analyze');
    }
  }, [data, navigate]);

  if (!result || !data) return null;

  const { score, level, reasons, timeline, subScores, evidenceQuality } = result;

  const getScoreClass = () => {
    if (score >= 60) return 'high-risk';
    if (score >= 30) return 'medium-risk';
    return 'low-risk';
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'danger': return <AlertTriangle size={14} color="var(--risk-high)" />;
      case 'warning': return <AlertTriangle size={14} color="var(--risk-medium)" />;
      case 'success': return <CheckCircle size={14} color="var(--risk-low)" />;
      default: return <Info size={14} color="var(--secondary)" />;
    }
  };

  const goToInvestigation = (timestamp = null) => {
    navigate('/investigation', { state: { ...data, timeline, activeTimestamp: timestamp } });
  };

  return (
    <div className="results-page container">
      <div className="back-nav">
        <button className="btn btn-outline" onClick={() => navigate('/')}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </div>

      <header className="results-header">
        <div className="header-meta">
          <div className="header-subtitle">INTERVIEW INTEGRITY RESULT</div>
          <div className="role-badge">{data.candidate.role}</div>
        </div>
        <div className="header-title-row">
          <h1>Candidate: {data.candidate.name} <span className="text-muted text-sm mono">({data.candidate.id})</span></h1>
          <button className="btn btn-primary" onClick={() => goToInvestigation()}>
            <Search size={18} /> INVESTIGATION MODE
          </button>
        </div>
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
                ? "Potential interview-integrity inconsistencies detected."
                : score >= 30 
                  ? "Some unusual patterns detected. Human review advised."
                  : "No significant integrity risks detected."}
            </p>
          </div>

          <div className="glass-panel breakdown-panel">
            <h3>Risk Contribution</h3>
            
            <div className="breakdown-items">
              <div className="breakdown-item">
                <div className="item-header">
                  <span>PROFILE CONSISTENCY</span>
                  <span>{100 - subScores.profileConsistency}% impact</span>
                </div>
                <div className="progress-bar"><div className="progress-fill" style={{width: `${subScores.profileConsistency}%`, background: subScores.profileConsistency < 70 ? 'var(--risk-medium)' : 'var(--risk-low)'}}></div></div>
              </div>
              
              <div className="breakdown-item">
                <div className="item-header">
                  <span>TECHNICAL DEPTH</span>
                  <span>{100 - subScores.technicalDepth}% impact</span>
                </div>
                <div className="progress-bar"><div className="progress-fill" style={{width: `${subScores.technicalDepth}%`, background: subScores.technicalDepth < 70 ? 'var(--risk-medium)' : 'var(--risk-low)'}}></div></div>
              </div>
              
              <div className="breakdown-item">
                <div className="item-header">
                  <span>ASSISTANCE SIGNAL</span>
                  <span>{100 - subScores.assistanceSignal}% impact</span>
                </div>
                <div className="progress-bar"><div className="progress-fill" style={{width: `${subScores.assistanceSignal}%`, background: subScores.assistanceSignal < 70 ? 'var(--risk-high)' : 'var(--risk-low)'}}></div></div>
              </div>
              
              <div className="breakdown-item">
                <div className="item-header">
                  <span>SESSION INTEGRITY</span>
                  <span>{100 - subScores.observationSignal}% impact</span>
                </div>
                <div className="progress-bar"><div className="progress-fill" style={{width: `${subScores.observationSignal}%`, background: subScores.observationSignal < 70 ? 'var(--risk-high)' : 'var(--risk-low)'}}></div></div>
              </div>
            </div>
          </div>
          
          <div className="glass-panel evidence-quality-panel">
            <div className="item-header mb-1">
              <span>ANALYSIS CONFIDENCE (Evidence Quality)</span>
              <span>{evidenceQuality.overall}%</span>
            </div>
            <div className="progress-bar"><div className="progress-fill" style={{width: `${evidenceQuality.overall}%`, background: 'var(--secondary)'}}></div></div>
            <p className="mt-2 text-sm text-muted">{evidenceQuality.message}</p>
          </div>
        </div>

        {/* RIGHT COLUMN: Reasons, Matrix, Timeline, Followups */}
        <div className="results-right">
          
          {/* Skill Verification Matrix */}
          <div className="glass-panel matrix-panel">
            <h3>Skill Verification Matrix</h3>
            <SkillMatrix candidate={data.candidate} transcript={data.transcript} />
          </div>

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

          <div className="glass-panel timeline-panel">
            <div className="timeline-header-row">
              <h3>Evidence Timeline</h3>
              <span className="prototype-label">Click event to investigate</span>
            </div>
            <div className="timeline">
              {timeline.map((ev, i) => (
                <div 
                  key={i} 
                  className={`timeline-item severity-${ev.severity} clickable-event`}
                  onClick={() => goToInvestigation(ev.timestamp)}
                >
                  <div className="timeline-time">{ev.timestamp.substring(3)}</div>
                  <div className="timeline-marker">{getSeverityIcon(ev.severity)}</div>
                  <div className="timeline-content">
                    <div className="event-type">{ev.type}</div>
                    <div className="event-desc">{ev.description}</div>
                    {ev.riskContribution > 0 && <div className="event-impact">+{ev.riskContribution} Risk</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Follow up Generator */}
          <div className="glass-panel followup-panel">
            <FollowUpQuestions candidate={data.candidate} reasons={reasons} />
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
            ? "Ask 2-3 follow-up technical questions targeting the claimed skills. Conduct an impromptu live coding or architecture exercise to verify true depth."
            : score >= 30 
              ? "Probe slightly deeper on areas of inconsistency. Ensure candidate is explaining concepts in their own words."
              : "Proceed with standard interview evaluation process. No anomalous signals detected."
          }
        </p>
        
        <div className="action-buttons">
          <button className="btn btn-outline" onClick={() => goToInvestigation()}><FileText size={16} /> VIEW TRANSCRIPT</button>
          <button className="btn btn-secondary" onClick={() => window.print()}><Download size={16} /> EXPORT REPORT (PDF)</button>
        </div>
        
        <div className="action-disclaimer">
          <Info size={14} /> The system does not make hiring decisions. It surfaces inconsistencies for human interviewer verification.
        </div>
      </div>
    </div>
  );
}

export default Results;

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, MessageSquare, Eye, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { testCases } from '../data/testCases';
import './Analyze.css';

function Analyze() {
  const navigate = useNavigate();
  const location = useLocation();
  const preloadedCandidate = location.state?.candidateData || null;

  const [candidate, setCandidate] = useState(preloadedCandidate?.candidate || {
    name: '', role: '', experience: 'Beginner', skills: '', summary: '', projects: '', certifications: ''
  });

  const [interview, setInterview] = useState(preloadedCandidate?.interview || [
    { question: '', answer: '' },
    { question: '', answer: '' },
    { question: '', answer: '' }
  ]);

  const [observations, setObservations] = useState(preloadedCandidate?.observations || {
    prompting: 'None',
    consistency: 'Consistent',
    responsePattern: 'Natural',
    technicalConfidence: 'Moderate',
    lipSync: 'Normal',
    eyeContact: 'Normal'
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);

  const analysisStepsText = [
    "Collecting evidence...",
    "Comparing profile claims...",
    "Analyzing answer consistency...",
    "Checking anomaly signals...",
    "Generating explainable risk score..."
  ];

  // Auto-fill form if candidate skills was an array
  useEffect(() => {
    if (preloadedCandidate && Array.isArray(preloadedCandidate.candidate.skills)) {
      setCandidate({
        ...preloadedCandidate.candidate,
        skills: preloadedCandidate.candidate.skills.join(', ')
      });
    }
  }, [preloadedCandidate]);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    let step = 0;
    
    const interval = setInterval(() => {
      step++;
      setAnalysisStep(step);
      
      if (step >= analysisStepsText.length) {
        clearInterval(interval);
        setTimeout(() => {
          navigate('/results', { state: { candidate, interview, observations } });
        }, 500);
      }
    }, 600); // Fast animation for demo
  };

  const handleInterviewChange = (index, field, value) => {
    const newInterview = [...interview];
    newInterview[index][field] = value;
    setInterview(newInterview);
  };

  if (isAnalyzing) {
    return (
      <div className="analysis-loader container">
        <div className="loader-content">
          <ShieldAlert size={64} className="loader-icon pulse" />
          <h2 className="loader-title">RUNNING INTEGRITY ANALYSIS</h2>
          
          <div className="steps-container">
            {analysisStepsText.map((text, index) => (
              <div 
                key={index} 
                className={`step-item ${index < analysisStep ? 'completed' : ''} ${index === analysisStep ? 'active' : ''}`}
              >
                {index < analysisStep ? <CheckCircle2 size={16} /> : <div className="step-dot"></div>}
                <span>{text}</span>
              </div>
            ))}
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${Math.min(100, (analysisStep / analysisStepsText.length) * 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="analyze-page container">
      <div className="page-header">
        <h1>Interview Workspace</h1>
        <p>Enter candidate details, interview answers, and observation signals for analysis.</p>
        {!preloadedCandidate && (
          <button 
            className="btn btn-secondary demo-btn"
            onClick={() => navigate('/test-cases')}
          >
            Load Demo Data Instead
          </button>
        )}
      </div>

      <div className="workspace-layout">
        <div className="workspace-left">
          <div className="glass-panel section-panel">
            <div className="panel-heading">
              <User size={18} />
              <h2>SECTION A: Candidate Profile</h2>
            </div>
            
            <div className="form-group">
              <label>Candidate Name</label>
              <input type="text" value={candidate.name} onChange={e => setCandidate({...candidate, name: e.target.value})} placeholder="e.g. Aarav Sharma" />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Role Applied For</label>
                <input type="text" value={candidate.role} onChange={e => setCandidate({...candidate, role: e.target.value})} placeholder="e.g. ML Intern" />
              </div>
              <div className="form-group">
                <label>Experience Level</label>
                <select value={candidate.experience} onChange={e => setCandidate({...candidate, experience: e.target.value})}>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Claimed Skills (comma separated)</label>
              <input type="text" value={candidate.skills} onChange={e => setCandidate({...candidate, skills: e.target.value})} placeholder="Python, Machine Learning..." />
            </div>

            <div className="form-group">
              <label>Resume Summary</label>
              <textarea rows={3} value={candidate.summary} onChange={e => setCandidate({...candidate, summary: e.target.value})}></textarea>
            </div>
            
            <div className="form-group">
              <label>Projects</label>
              <input type="text" value={candidate.projects} onChange={e => setCandidate({...candidate, projects: e.target.value})} />
            </div>
            
            <div className="form-group">
              <label>Certifications</label>
              <input type="text" value={candidate.certifications} onChange={e => setCandidate({...candidate, certifications: e.target.value})} />
            </div>
          </div>
        </div>

        <div className="workspace-right">
          <div className="glass-panel section-panel">
            <div className="panel-heading">
              <MessageSquare size={18} />
              <h2>SECTION B: Interview Answers</h2>
            </div>
            
            {interview.map((item, index) => (
              <div key={index} className="qa-pair">
                <div className="form-group">
                  <label>Question {index + 1}</label>
                  <input type="text" value={item.question} onChange={e => handleInterviewChange(index, 'question', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Candidate Answer {index + 1}</label>
                  <textarea rows={2} value={item.answer} onChange={e => handleInterviewChange(index, 'answer', e.target.value)}></textarea>
                </div>
              </div>
            ))}
          </div>

          <div className="glass-panel section-panel">
            <div className="panel-heading">
              <Eye size={18} />
              <h2>SECTION C: Observation Signals</h2>
            </div>
            <div className="disclaimer-text">
              Prototype observation signals are assistive indicators and should not be treated as definitive biometric or deepfake detection.
            </div>
            
            <div className="signals-grid">
              <div className="form-group">
                <label>External Prompting</label>
                <select value={observations.prompting} onChange={e => setObservations({...observations, prompting: e.target.value})}>
                  <option value="None">None</option>
                  <option value="Possible">Possible</option>
                  <option value="Strong">Strong</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Answer Consistency</label>
                <select value={observations.consistency} onChange={e => setObservations({...observations, consistency: e.target.value})}>
                  <option value="Consistent">Consistent</option>
                  <option value="Slightly inconsistent">Slightly inconsistent</option>
                  <option value="Highly inconsistent">Highly inconsistent</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Response Pattern</label>
                <select value={observations.responsePattern} onChange={e => setObservations({...observations, responsePattern: e.target.value})}>
                  <option value="Natural">Natural</option>
                  <option value="Rehearsed">Rehearsed</option>
                  <option value="Highly scripted">Highly scripted</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Technical Confidence</label>
                <select value={observations.technicalConfidence} onChange={e => setObservations({...observations, technicalConfidence: e.target.value})}>
                  <option value="Strong">Strong</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Weak">Weak</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Lip-sync Observation</label>
                <select value={observations.lipSync} onChange={e => setObservations({...observations, lipSync: e.target.value})}>
                  <option value="Normal">Normal</option>
                  <option value="Possible mismatch">Possible mismatch</option>
                  <option value="Strong mismatch">Strong mismatch</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Eye-contact Observation</label>
                <select value={observations.eyeContact} onChange={e => setObservations({...observations, eyeContact: e.target.value})}>
                  <option value="Normal">Normal</option>
                  <option value="Irregular">Irregular</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="analyze-action-bar glass-panel">
        <button className="btn btn-primary btn-large" onClick={handleAnalyze}>
          RUN INTERVIEW INTEGRITY ANALYSIS
        </button>
      </div>
    </div>
  );
}

export default Analyze;

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, MessageSquare, ArrowRight } from 'lucide-react';
import './ReviewTestCase.css';

function ReviewTestCase() {
  const navigate = useNavigate();
  const location = useLocation();
  const preloadedData = location.state?.candidateData;

  if (!preloadedData) {
    navigate('/test-cases');
    return null;
  }

  // Parse transcript back into Q&A format for the form
  const parseTranscriptToQA = (transcript) => {
    let qa = [];
    let currentQ = '';
    
    transcript.forEach(t => {
      if (t.speaker === 'INTERVIEWER') {
        currentQ = t.text;
      } else if (t.speaker === 'CANDIDATE') {
        qa.push({ question: currentQ, answer: t.text });
        currentQ = '';
      }
    });
    
    // Ensure we have at least 3 fields
    while (qa.length < 3) {
      qa.push({ question: '', answer: '' });
    }
    
    return qa;
  };

  const [candidate, setCandidate] = useState({
    name: preloadedData.candidate.name || '',
    role: preloadedData.candidate.role || '',
    experience: preloadedData.candidate.experience || 'Beginner',
    skills: preloadedData.candidate.skills ? preloadedData.candidate.skills.join(', ') : '',
    summary: preloadedData.candidate.summary || '',
    projects: preloadedData.candidate.projects || '',
    certifications: preloadedData.candidate.certifications || ''
  });

  const [interview, setInterview] = useState(parseTranscriptToQA(preloadedData.transcript));

  const handleProceed = () => {
    // Re-construct the Phase 2 payload format from this form data
    const reconstructedTranscript = [];
    interview.forEach((qa, idx) => {
      if (qa.question) reconstructedTranscript.push({ timestamp: `00:0${idx + 1}:10`, speaker: 'INTERVIEWER', text: qa.question, id: `q${idx}` });
      if (qa.answer) reconstructedTranscript.push({ timestamp: `00:0${idx + 1}:15`, speaker: 'CANDIDATE', text: qa.answer, id: `a${idx}` });
    });

    const updatedData = {
      ...preloadedData,
      candidate: {
        ...preloadedData.candidate,
        ...candidate,
        skills: candidate.skills.split(',').map(s => s.trim()).filter(Boolean)
      },
      transcript: reconstructedTranscript.length > 0 ? reconstructedTranscript : preloadedData.transcript
    };

    navigate('/analyze', { state: { candidateData: updatedData } });
  };

  return (
    <div className="review-test-page container">
      <div className="page-header">
        <h1>VIRTUAL INTERVIEW RISK ANALYZER</h1>
        <p>Review candidate profile and interview evidence before proceeding to analysis.</p>
      </div>

      <div className="review-layout">
        <div className="glass-panel review-section">
          <div className="section-header">
            <User size={18} />
            <h2>SECTION A: Candidate Profile</h2>
          </div>
          
          <div className="form-group">
            <label>Candidate Name</label>
            <input type="text" value={candidate.name} onChange={e => setCandidate({...candidate, name: e.target.value})} />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Role Applied For</label>
              <input type="text" value={candidate.role} onChange={e => setCandidate({...candidate, role: e.target.value})} />
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
            <input type="text" value={candidate.skills} onChange={e => setCandidate({...candidate, skills: e.target.value})} />
          </div>
          
          <div className="form-group">
            <label>Resume Summary</label>
            <textarea rows="3" value={candidate.summary} onChange={e => setCandidate({...candidate, summary: e.target.value})} />
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

        <div className="glass-panel review-section">
          <div className="section-header">
            <MessageSquare size={18} />
            <h2>SECTION B: Interview Answers</h2>
          </div>
          
          {interview.map((qa, i) => (
            <div key={i} className="qa-block">
              <div className="form-group">
                <label>Question {i + 1}</label>
                <input 
                  type="text" 
                  value={qa.question} 
                  onChange={e => {
                    const newQA = [...interview];
                    newQA[i].question = e.target.value;
                    setInterview(newQA);
                  }}
                />
              </div>
              <div className="form-group">
                <label>Candidate Answer {i + 1}</label>
                <textarea 
                  rows="3"
                  value={qa.answer} 
                  onChange={e => {
                    const newQA = [...interview];
                    newQA[i].answer = e.target.value;
                    setInterview(newQA);
                  }}
                />
              </div>
              {i < interview.length - 1 && <hr className="qa-divider" />}
            </div>
          ))}
        </div>
      </div>

      <div className="form-actions text-center mt-2">
        <button className="btn btn-primary btn-large" onClick={handleProceed}>
          PROCEED TO ANALYZE <ArrowRight size={18} style={{marginLeft: '8px'}}/>
        </button>
      </div>
    </div>
  );
}

export default ReviewTestCase;

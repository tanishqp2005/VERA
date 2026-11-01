import { useState, useId } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Upload, CheckCircle2, Video, ArrowLeft } from 'lucide-react';
import { saveInterview } from '../logic/interviewStorage';
import './CreateInterview.css';

function generateCandidateId() {
  return `CAND-${Date.now().toString().slice(-4)}`;
}

function CreateInterview() {
  const navigate = useNavigate();
  const idPrefix = useId();
  
  const [formData, setFormData] = useState(() => ({
    name: '',
    candidateId: generateCandidateId(),
    role: '',
    interviewType: 'Technical',
    experience: 'Intermediate',
    expectedSkills: '',
    summary: '',
    date: new Date().toISOString().split('T')[0]
  }));

  const [createdCandidate, setCreatedCandidate] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const skillsList = formData.expectedSkills
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const candidateProfile = {
      id: formData.candidateId,
      name: formData.name,
      role: formData.role,
      interviewType: formData.interviewType,
      experience: formData.experience,
      skills: skillsList,
      summary: formData.summary,
      interviewDate: formData.date
    };

    const newInterview = {
      id: formData.candidateId,
      candidate: candidateProfile,
      status: 'PENDING_ANALYSIS',
      createdAt: new Date().toISOString()
    };

    saveInterview(newInterview);
    setCreatedCandidate(newInterview);
  };

  const handleStartLive = () => {
    navigate('/live', { state: { candidateData: createdCandidate } });
  };

  const handleUploadVideo = () => {
    navigate('/analyze', { state: { candidateData: createdCandidate } });
  };

  return (
    <div className="create-interview-page container">
      <div className="page-header">
        <h1>Create Interview Baseline</h1>
        <p>Set up a candidate profile, expected competency baseline, and interview parameters.</p>
      </div>

      {!createdCandidate ? (
        <form className="glass-panel create-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor={`${idPrefix}-name`}>Candidate Name</label>
              <input 
                id={`${idPrefix}-name`}
                type="text" 
                required 
                value={formData.name} 
                onChange={e => setFormData({ ...formData, name: e.target.value })} 
                placeholder="e.g. Alex Johnson" 
              />
            </div>
            <div className="form-group">
              <label htmlFor={`${idPrefix}-cid`}>Candidate ID</label>
              <input 
                id={`${idPrefix}-cid`}
                type="text" 
                className="mono" 
                readOnly 
                value={formData.candidateId} 
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor={`${idPrefix}-role`}>Role</label>
              <input 
                id={`${idPrefix}-role`}
                type="text" 
                required 
                value={formData.role} 
                onChange={e => setFormData({ ...formData, role: e.target.value })} 
                placeholder="e.g. Senior Software Engineer" 
              />
            </div>
            <div className="form-group">
              <label htmlFor={`${idPrefix}-type`}>Interview Type</label>
              <select 
                id={`${idPrefix}-type`}
                value={formData.interviewType} 
                onChange={e => setFormData({ ...formData, interviewType: e.target.value })}
              >
                <option value="Technical">Technical</option>
                <option value="Behavioral">Behavioral</option>
                <option value="System Design">System Design</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor={`${idPrefix}-exp`}>Expected Experience Level</label>
              <select 
                id={`${idPrefix}-exp`}
                value={formData.experience} 
                onChange={e => setFormData({ ...formData, experience: e.target.value })}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor={`${idPrefix}-date`}>Interview Date</label>
              <input 
                id={`${idPrefix}-date`}
                type="date" 
                required 
                value={formData.date} 
                onChange={e => setFormData({ ...formData, date: e.target.value })} 
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor={`${idPrefix}-skills`}>Expected Skills (comma separated)</label>
            <input 
              id={`${idPrefix}-skills`}
              type="text" 
              required 
              value={formData.expectedSkills} 
              onChange={e => setFormData({ ...formData, expectedSkills: e.target.value })} 
              placeholder="e.g. React, Node.js, Distributed Systems, SQL, Cloud Architecture" 
            />
          </div>

          <div className="form-group">
            <label htmlFor={`${idPrefix}-summary`}>Resume / Background Summary</label>
            <textarea 
              id={`${idPrefix}-summary`}
              rows={3} 
              value={formData.summary} 
              onChange={e => setFormData({ ...formData, summary: e.target.value })} 
              placeholder="Candidate background, previous companies, key claimed achievements..."
            ></textarea>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={() => navigate('/')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <PlusCircle size={18} /> Initialize Profile
            </button>
          </div>
        </form>
      ) : (
        <div className="glass-panel success-panel text-center py-6">
          <CheckCircle2 size={56} color="var(--risk-low)" className="mx-auto mb-3" />
          <h2>Candidate Profile Created</h2>
          <p className="text-muted mb-6">
            Profile for <strong className="text-white">{createdCandidate.candidate.name}</strong> ({createdCandidate.candidate.id}) has been saved.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={handleStartLive}>
              <Video size={18} /> Start Live Session
            </button>
            <button className="btn btn-secondary" onClick={handleUploadVideo}>
              <Upload size={18} /> Upload Video & Analyze
            </button>
            <button className="btn btn-outline" onClick={() => navigate('/')}>
              <ArrowLeft size={18} /> Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateInterview;

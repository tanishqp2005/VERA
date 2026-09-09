import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Upload, CheckCircle2 } from 'lucide-react';
import './CreateInterview.css';

function CreateInterview() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    candidateId: `CAND-${Math.floor(Math.random() * 9000) + 1000}`,
    role: '',
    interviewType: 'Technical',
    experience: 'Intermediate',
    expectedSkills: '',
    summary: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [isCreated, setIsCreated] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsCreated(true);
  };

  const handleUploadVideo = () => {
    // Pass the created candidate data to the upload/analyze page
    navigate('/analyze', { 
      state: { 
        candidateData: {
          candidate: {
            ...formData,
            skills: formData.expectedSkills.split(',').map(s => s.trim()).filter(s => s)
          }
        }
      } 
    });
  };

  return (
    <div className="create-interview-page container">
      <div className="page-header">
        <h1>Create Interview</h1>
        <p>Set up a new candidate interview profile and expected skills baseline.</p>
      </div>

      {!isCreated ? (
        <form className="glass-panel create-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Candidate Name</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Riya Desai" />
            </div>
            <div className="form-group">
              <label>Candidate ID</label>
              <input type="text" className="mono" readOnly value={formData.candidateId} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Role</label>
              <input type="text" required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} placeholder="e.g. ML Intern" />
            </div>
            <div className="form-group">
              <label>Interview Type</label>
              <select value={formData.interviewType} onChange={e => setFormData({...formData, interviewType: e.target.value})}>
                <option value="Technical">Technical</option>
                <option value="Behavioral">Behavioral</option>
                <option value="System Design">System Design</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Expected Experience Level</label>
              <select value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})}>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
            <div className="form-group">
              <label>Interview Date</label>
              <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
          </div>

          <div className="form-group">
            <label>Expected Skills (comma separated)</label>
            <input type="text" required value={formData.expectedSkills} onChange={e => setFormData({...formData, expectedSkills: e.target.value})} placeholder="Python, Machine Learning, Deep Learning, TensorFlow, SQL" />
          </div>

          <div className="form-group">
            <label>Resume/Profile Summary</label>
            <textarea rows={3} value={formData.summary} onChange={e => setFormData({...formData, summary: e.target.value})} placeholder="Paste candidate summary or background here..."></textarea>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              <PlusCircle size={18} /> CREATE INTERVIEW
            </button>
          </div>
        </form>
      ) : (
        <div className="glass-panel success-panel">
          <CheckCircle2 size={48} className="success-icon pulse-green-icon" />
          <h2>INTERVIEW READY</h2>
          <p>Candidate profile for <strong>{formData.name}</strong> ({formData.candidateId}) has been created.</p>
          
          <div className="upload-prompt">
            <button className="btn btn-primary btn-large" onClick={handleUploadVideo}>
              <Upload size={20} /> UPLOAD INTERVIEW VIDEO
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateInterview;

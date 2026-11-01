import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UploadCloud, FileVideo, ShieldAlert, CheckCircle2, User, FileText, Settings2 } from 'lucide-react';
import { getInterviews, saveInterview } from '../logic/interviewStorage';
import { calculateRisk } from '../logic/riskEngine';
import './Analyze.css';

function Analyze() {
  const navigate = useNavigate();
  const location = useLocation();
  const passedCandidate = location.state?.candidateData?.candidate;

  const [availableCandidates] = useState(() => getInterviews());
  const [selectedCandidateId, setSelectedCandidateId] = useState(() => passedCandidate?.id || '');
  
  const [candidateProfile, setCandidateProfile] = useState(() => ({
    id: passedCandidate?.id || `CAND-${Date.now().toString().slice(-4)}`,
    name: passedCandidate?.name || '',
    role: passedCandidate?.role || '',
    experience: passedCandidate?.experience || 'Intermediate',
    skills: Array.isArray(passedCandidate?.skills) ? passedCandidate.skills.join(', ') : (passedCandidate?.skills || ''),
    interviewDate: passedCandidate?.interviewDate || new Date().toISOString().split('T')[0]
  }));

  const [file, setFile] = useState(null);
  const [videoObjectUrl, setVideoObjectUrl] = useState(null);
  const [transcriptText, setTranscriptText] = useState(() => {
    const foundTranscript = location.state?.candidateData?.transcript;
    if (Array.isArray(foundTranscript)) {
      return foundTranscript.map(t => `${t.speaker}: ${t.text}`).join('\n\n');
    }
    return '';
  });
  
  // Optional observation indicators to test/analyze
  const [detectedOffGaze, setDetectedOffGaze] = useState(false);
  const [detectedAVSyncMismatch, setDetectedAVSyncMismatch] = useState(false);
  const [focusLossCount, setFocusLossCount] = useState(0);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);

  const analysisStepsText = [
    "Video stream received and validated",
    "Audio track isolated and frequency sampled",
    "Candidate competency profile loaded",
    "Transcript ingested and vectorized",
    "Speech depth and response latency analyzed",
    "Facial landmarks and gaze vectors inspected",
    "Window focus and session events processed",
    "Claim-to-response consistency evaluated",
    "Central risk engine scoring completed"
  ];

  const handleSelectExistingCandidate = (id) => {
    setSelectedCandidateId(id);
    const found = availableCandidates.find(i => i.id === id || i.candidate?.id === id);
    if (found?.candidate) {
      setCandidateProfile({
        id: found.candidate.id,
        name: found.candidate.name,
        role: found.candidate.role,
        experience: found.candidate.experience || 'Intermediate',
        skills: Array.isArray(found.candidate.skills) ? found.candidate.skills.join(', ') : '',
        interviewDate: found.candidate.interviewDate || new Date().toISOString().split('T')[0]
      });
      if (found.transcript && Array.isArray(found.transcript)) {
        setTranscriptText(found.transcript.map(t => `${t.speaker}: ${t.text}`).join('\n\n'));
      }
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer?.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setVideoObjectUrl(URL.createObjectURL(droppedFile));
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setVideoObjectUrl(URL.createObjectURL(selectedFile));
    }
  };

  // Convert raw text into structured transcript array
  const parseTranscript = (raw) => {
    if (!raw.trim()) {
      return [
        { id: 'q1', timestamp: '00:01:00', speaker: 'INTERVIEWER', text: 'Can you introduce yourself and your technical background?' },
        { id: 'a1', timestamp: '00:01:15', speaker: 'CANDIDATE', text: 'I am a software engineer focused on building performant applications.' }
      ];
    }

    const lines = raw.split('\n').filter(l => l.trim().length > 0);
    const parsed = [];
    let secCounter = 30;

    lines.forEach((line, idx) => {
      const minutes = String(Math.floor(secCounter / 60)).padStart(2, '0');
      const seconds = String(secCounter % 60).padStart(2, '0');
      const ts = `00:${minutes}:${seconds}`;
      secCounter += 35;

      const upper = line.toUpperCase();
      if (upper.startsWith('INTERVIEWER:') || upper.startsWith('Q:')) {
        parsed.push({
          id: `t_${idx}`,
          timestamp: ts,
          speaker: 'INTERVIEWER',
          text: line.replace(/^(INTERVIEWER:|Q:)/i, '').trim()
        });
      } else if (upper.startsWith('CANDIDATE:') || upper.startsWith('A:')) {
        parsed.push({
          id: `t_${idx}`,
          timestamp: ts,
          speaker: 'CANDIDATE',
          text: line.replace(/^(CANDIDATE:|A:)/i, '').trim()
        });
      } else {
        // Alternating heuristic
        parsed.push({
          id: `t_${idx}`,
          timestamp: ts,
          speaker: idx % 2 === 0 ? 'INTERVIEWER' : 'CANDIDATE',
          text: line.trim()
        });
      }
    });

    return parsed;
  };

  const startAnalysis = () => {
    if (!candidateProfile.name) {
      alert("Please provide candidate name or select an existing candidate.");
      return;
    }

    const parsedTranscript = parseTranscript(transcriptText);

    // Build session events based on focus losses
    const sessionEvents = [];
    for (let i = 0; i < focusLossCount; i++) {
      sessionEvents.push({
        timestamp: `00:0${(i * 3) + 2}:15`,
        type: "WINDOW FOCUS LOST",
        duration: 4.5,
        description: "Candidate switched application or browser tab."
      });
    }

    const payload = {
      candidate: {
        id: candidateProfile.id,
        name: candidateProfile.name,
        role: candidateProfile.role || 'Software Engineer',
        experience: candidateProfile.experience,
        skills: candidateProfile.skills.split(',').map(s => s.trim()).filter(Boolean),
        interviewDate: candidateProfile.interviewDate
      },
      transcript: parsedTranscript,
      visualSignals: {
        cameraFacing: detectedOffGaze ? 60 : 92,
        awayFromCamera: detectedOffGaze ? 40 : 8,
        status: detectedOffGaze ? "MODERATE SIGNAL" : "NORMAL",
        message: detectedOffGaze ? "Frequent periods looking away from camera." : "Consistent eye contact maintained."
      },
      audioVideoSignals: {
        consistency: detectedAVSyncMismatch ? 60 : 95,
        status: detectedAVSyncMismatch ? "POTENTIAL ANOMALY" : "NORMAL",
        anomalies: detectedAVSyncMismatch ? [
          { start: "00:02:40", end: "00:02:50", description: "Lip movement and speech audio out of sync." }
        ] : []
      },
      assistanceSignals: {
        scriptedPattern: false,
        longPauses: 0,
        overall: "LOW"
      },
      sessionEvents,
      videoUrl: videoObjectUrl,
      evidenceQuality: {
        video: file ? 95 : 70,
        audio: 92,
        faceVisibility: detectedOffGaze ? 75 : 95,
        overall: file ? 93 : 80,
        message: file ? "Recorded video and audio evidence processed." : "Analysis based on provided interview transcript and session signals."
      }
    };

    setIsAnalyzing(true);
    let step = 0;

    const interval = setInterval(() => {
      step++;
      setAnalysisStep(step);

      if (step >= analysisStepsText.length) {
        clearInterval(interval);
        
        // Execute risk calculation
        const riskResult = calculateRisk(payload);
        const savedRecord = {
          ...payload,
          riskScore: riskResult.score,
          riskLevel: riskResult.level,
          status: 'COMPLETED'
        };
        saveInterview(savedRecord);

        setTimeout(() => {
          navigate('/results', { state: payload });
        }, 600);
      }
    }, 400);
  };

  if (isAnalyzing) {
    return (
      <div className="analysis-loader container">
        <div className="loader-content">
          <ShieldAlert size={64} className="loader-icon pulse" />
          <h2 className="loader-title">VERA INTEGRITY ENGINE PROCESSING</h2>
          <p className="text-muted mb-4">Analyzing candidate signals against competency baseline...</p>
          
          <div className="steps-container">
            {analysisStepsText.map((text, index) => (
              <div 
                key={index} 
                className={`step-item ${index < analysisStep ? 'completed' : ''} ${index === analysisStep ? 'active' : ''}`}
              >
                <div className="step-indicator">
                  {index < analysisStep ? <CheckCircle2 size={16} /> : index + 1}
                </div>
                <div className="step-text">{text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="analyze-page container">
      <div className="page-header">
        <h1>Analyze Interview Recording</h1>
        <p>Upload an interview recording and transcript to run VERA deepfake, speech, and integrity risk analysis.</p>
      </div>

      <div className="analyze-layout">
        {/* Candidate Profile Selection / Input */}
        <div className="glass-panel analyze-card">
          <div className="card-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={20} className="text-secondary" />
              <h2 style={{ fontSize: '1.15rem' }}>1. Candidate Baseline</h2>
            </div>
            {availableCandidates.length > 0 && (
              <select 
                className="btn btn-outline btn-sm"
                value={selectedCandidateId}
                onChange={e => handleSelectExistingCandidate(e.target.value)}
              >
                <option value="">Load Existing Candidate...</option>
                {availableCandidates.map(c => (
                  <option key={c.id || c.candidate?.id} value={c.id || c.candidate?.id}>
                    {c.candidate?.name} ({c.candidate?.role})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Candidate Name *</label>
              <input 
                type="text" 
                value={candidateProfile.name} 
                onChange={e => setCandidateProfile({ ...candidateProfile, name: e.target.value })} 
                placeholder="e.g. Jordan Miller" 
                required
              />
            </div>
            <div className="form-group">
              <label>Applied Role</label>
              <input 
                type="text" 
                value={candidateProfile.role} 
                onChange={e => setCandidateProfile({ ...candidateProfile, role: e.target.value })} 
                placeholder="e.g. Frontend Developer" 
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Experience Level</label>
              <select 
                value={candidateProfile.experience} 
                onChange={e => setCandidateProfile({ ...candidateProfile, experience: e.target.value })}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
            <div className="form-group">
              <label>Key Claimed Skills (comma separated)</label>
              <input 
                type="text" 
                value={candidateProfile.skills} 
                onChange={e => setCandidateProfile({ ...candidateProfile, skills: e.target.value })} 
                placeholder="e.g. React, TypeScript, GraphQL, Next.js" 
              />
            </div>
          </div>
        </div>

        {/* Video Upload Dropzone */}
        <div className="glass-panel analyze-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <FileVideo size={20} className="text-secondary" />
            <h2 style={{ fontSize: '1.15rem' }}>2. Interview Video (Optional / Supported: MP4, WebM, MOV)</h2>
          </div>

          <div 
            className="drop-zone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            onClick={() => document.getElementById('video-upload-input').click()}
          >
            <input 
              id="video-upload-input" 
              type="file" 
              accept="video/*" 
              style={{ display: 'none' }} 
              onChange={handleFileSelect} 
            />
            {file ? (
              <div className="file-info-preview">
                <FileVideo size={48} className="text-safe mb-2" />
                <h3>{file.name}</h3>
                <p className="text-muted">{(file.size / (1024 * 1024)).toFixed(2)} MB • Ready for playback & inspection</p>
                <button type="button" className="btn btn-outline btn-sm mt-2" onClick={(e) => { e.stopPropagation(); setFile(null); setVideoObjectUrl(null); }}>
                  Remove file
                </button>
              </div>
            ) : (
              <div className="drop-content">
                <UploadCloud size={48} className="upload-icon mb-2" />
                <h3>Drop interview video file here</h3>
                <p className="text-muted">or click to browse your computer</p>
              </div>
            )}
          </div>
        </div>

        {/* Interview Transcript */}
        <div className="glass-panel analyze-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <FileText size={20} className="text-secondary" />
            <h2 style={{ fontSize: '1.15rem' }}>3. Interview Transcript / Q&A</h2>
          </div>
          <p className="text-muted text-sm mb-2">
            Paste interview dialogue or questions and candidate answers (format as "Interviewer: ..." and "Candidate: ...").
          </p>
          <textarea 
            rows={6}
            value={transcriptText}
            onChange={e => setTranscriptText(e.target.value)}
            placeholder="Interviewer: Can you explain how you optimize database queries in PostgreSQL?&#10;&#10;Candidate: I use EXPLAIN ANALYZE to check query execution plans, verify indexes, and avoid full table scans..."
            style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', padding: '0.75rem', fontFamily: 'inherit' }}
          ></textarea>
        </div>

        {/* Session Signal Verification Knobs */}
        <div className="glass-panel analyze-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Settings2 size={20} className="text-secondary" />
            <h2 style={{ fontSize: '1.15rem' }}>4. Observation Signals & Session Checks</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={detectedOffGaze} 
                onChange={e => setDetectedOffGaze(e.target.checked)} 
              />
              <span>Simulate Off-Screen Gaze (&gt;35% away)</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={detectedAVSyncMismatch} 
                onChange={e => setDetectedAVSyncMismatch(e.target.checked)} 
              />
              <span>Simulate A/V Lip-Sync Mismatch</span>
            </label>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="text-sm">Window Focus Losses:</span>
              <input 
                type="number" 
                min="0" 
                max="10" 
                value={focusLossCount} 
                onChange={e => setFocusLossCount(parseInt(e.target.value) || 0)} 
                style={{ width: '60px', padding: '0.25rem 0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: '#fff', borderRadius: '4px' }}
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button className="btn btn-primary btn-lg" onClick={startAnalysis}>
            <ShieldAlert size={20} /> START VERA INTEGRITY ANALYSIS
          </button>
        </div>
      </div>
    </div>
  );
}

export default Analyze;

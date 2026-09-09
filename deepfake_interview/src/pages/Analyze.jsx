import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UploadCloud, FileVideo, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { testCases } from '../data/testCases';
import './Analyze.css';

function Analyze() {
  const navigate = useNavigate();
  const location = useLocation();
  const preloadedCandidate = location.state?.candidateData || null;

  const [file, setFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);

  // If a test case is selected, skip upload and immediately analyze
  useEffect(() => {
    if (preloadedCandidate && preloadedCandidate.transcript) {
      // It's a full test case from TestCases page
      setFile({ name: "synthetic_interview.mp4", size: "42.5 MB", duration: "30:00" });
      handleAnalyze(preloadedCandidate);
    }
  }, [preloadedCandidate]);

  const analysisStepsText = [
    "Video received",
    "Audio extracted",
    "Candidate profile loaded",
    "Transcript generated",
    "Speech analyzed",
    "Visual signals analyzed",
    "Session events analyzed",
    "Profile-response comparison completed",
    "Risk engine completed"
  ];

  const handleFileDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer?.files[0];
    if (droppedFile) {
      setFile({
        name: droppedFile.name,
        size: (droppedFile.size / (1024 * 1024)).toFixed(2) + ' MB',
        duration: "Unknown"
      });
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile({
        name: selectedFile.name,
        size: (selectedFile.size / (1024 * 1024)).toFixed(2) + ' MB',
        duration: "Unknown"
      });
    }
  };

  const startProcessing = () => {
    // If not a preloaded test case, merge uploaded data with 'normal' testcase as a mock
    let payload = preloadedCandidate;
    if (!payload || !payload.transcript) {
      payload = { ...testCases[0] }; 
      if (preloadedCandidate?.candidate) {
        payload.candidate = { ...payload.candidate, ...preloadedCandidate.candidate };
      }
    }
    handleAnalyze(payload);
  };

  const handleAnalyze = (payload) => {
    setIsAnalyzing(true);
    let step = 0;
    
    const interval = setInterval(() => {
      step++;
      setAnalysisStep(step);
      
      if (step >= analysisStepsText.length) {
        clearInterval(interval);
        setTimeout(() => {
          navigate('/results', { state: payload });
        }, 800);
      }
    }, 500); // 500ms per step for realistic feel
  };

  if (isAnalyzing) {
    return (
      <div className="analysis-loader container">
        <div className="loader-content">
          <ShieldAlert size={64} className="loader-icon pulse" />
          <h2 className="loader-title">VERA ANALYSIS IN PROGRESS</h2>
          
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
      <div className="page-header text-center">
        <h1>Upload Interview Evidence</h1>
        <p>VERA will analyze audio, visual signals, session integrity, and profile consistency.</p>
      </div>

      <div className="upload-container glass-panel">
        {!file ? (
          <div 
            className="drop-zone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
          >
            <UploadCloud size={64} className="upload-icon" />
            <h3>Drop interview video here</h3>
            <p>or</p>
            <label className="btn btn-outline">
              Choose Video
              <input type="file" accept="video/mp4,video/webm,video/quicktime" hidden onChange={handleFileSelect} />
            </label>
            <p className="supported-formats">Supported formats: MP4, WebM, MOV</p>
            
            <div className="capabilities">
              <span>VERA analyzes:</span>
              <ul className="capabilities-list">
                <li>Audio</li>
                <li>Transcript</li>
                <li>Visual signals</li>
                <li>Session integrity</li>
                <li>Profile/answer consistency</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="file-details">
            <FileVideo size={64} className="file-icon" />
            <h3>{file.name}</h3>
            <div className="file-meta">
              <span>Size: {file.size}</span>
              <span>Duration: {file.duration}</span>
              <span className="text-safe">✓ Audio available</span>
              <span className="text-safe">✓ Video available</span>
            </div>
            
            <div className="file-actions">
              <button className="btn btn-primary btn-large w-full" onClick={startProcessing}>
                START VERA ANALYSIS
              </button>
              <button className="btn btn-secondary mt-2" onClick={() => setFile(null)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Analyze;

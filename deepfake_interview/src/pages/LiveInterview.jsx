import { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as faceapi from '@vladmandic/face-api';
import { Camera, Activity, AlertTriangle, ShieldCheck, Play, Square, User, Plus, MessageSquare } from 'lucide-react';
import { calculateRisk } from '../logic/riskEngine';
import { saveInterview, getInterviews } from '../logic/interviewStorage';
import './LiveInterview.css';

// Format seconds to HH:MM:SS
function formatTime(secs) {
  const h = String(Math.floor(secs / 3600)).padStart(2, '0');
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function LiveInterview() {
  const location = useLocation();
  const navigate = useNavigate();

  const passedCandidate = location.state?.candidateData?.candidate || null;
  const [selectedCandidate, setSelectedCandidate] = useState(passedCandidate);
  const [availableCandidates] = useState(() => getInterviews().map(i => i.candidate).filter(Boolean));

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [streamActive, setStreamActive] = useState(false);
  const [status, setStatus] = useState("Loading AI models...");
  
  // Real-time Telemetry
  const [expression, setExpression] = useState('Neutral');
  const [eyeContact, setEyeContact] = useState(100);
  const [audioLevel, setAudioLevel] = useState(0);
  const [lipSyncStatus, setLipSyncStatus] = useState('Normal');

  // Session State
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const sessionTimerRef = useRef(null);

  // Accumulated Session Counters for rendering without ref reads
  const [eventsCount, setEventsCount] = useState(0);
  const [anomaliesCount, setAnomaliesCount] = useState(0);

  // Accumulated Session Telemetry
  const eyeContactHistoryRef = useRef([]);
  const anomaliesRef = useRef([]);
  const sessionEventsRef = useRef([]);
  const blurStartTimeRef = useRef(null);

  // Live Q&A Notes
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [transcript, setTranscript] = useState([]);

  const stopMediaTracks = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
  }, []);

  // Load Face-API models
  useEffect(() => {
    let isMounted = true;
    const loadModels = async () => {
      try {
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ]);
        if (isMounted) {
          setModelsLoaded(true);
          setStatus("AI Models loaded. Ready to start camera.");
        }
      } catch (err) {
        console.error("Failed to load face-api models", err);
        if (isMounted) {
          setStatus("Failed to load AI models. Check internet connection.");
        }
      }
    };
    loadModels();

    return () => {
      isMounted = false;
      stopMediaTracks();
    };
  }, [stopMediaTracks]);

  // Window Focus / Blur Event tracking during active session
  useEffect(() => {
    if (!isSessionActive) return;

    const handleBlur = () => {
      blurStartTimeRef.current = Date.now();
    };

    const handleFocus = () => {
      if (blurStartTimeRef.current) {
        const durationSecs = ((Date.now() - blurStartTimeRef.current) / 1000).toFixed(1);
        const timestamp = formatTime(sessionSeconds);
        const eventItem = {
          timestamp,
          type: "WINDOW FOCUS LOST",
          duration: parseFloat(durationSecs),
          description: `Candidate navigated away from the interview tab for ${durationSecs}s.`
        };

        sessionEventsRef.current.push(eventItem);
        setEventsCount(prev => prev + 1);

        // Fire toast alert
        window.dispatchEvent(new CustomEvent('interview-alert', {
          detail: {
            title: "WINDOW FOCUS LOST",
            duration: durationSecs,
            description: "Candidate switched application or browser tab.",
            riskContribution: 12
          }
        }));

        blurStartTimeRef.current = null;
      }
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isSessionActive, sessionSeconds]);

  // Session Timer
  useEffect(() => {
    if (isSessionActive) {
      sessionTimerRef.current = setInterval(() => {
        setSessionSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(sessionTimerRef.current);
    }
    return () => clearInterval(sessionTimerRef.current);
  }, [isSessionActive]);

  const setupAudioAnalysis = (stream) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
    } catch (e) {
      console.warn("Audio analysis init failed:", e);
    }
  };

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setStreamActive(true);
      setStatus("Camera active. Ready to begin session.");
      setupAudioAnalysis(stream);
    } catch (err) {
      console.error("Camera access error:", err);
      setStatus("Camera/Microphone access denied.");
    }
  };

  const getAudioLevel = useCallback(() => {
    if (!analyserRef.current) return 0;
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i];
    }
    return sum / bufferLength;
  }, []);

  const handleVideoOnPlay = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    const intervalId = setInterval(async () => {
      if (!modelsLoaded || !video || video.paused || video.ended) return;

      const displaySize = { width: video.videoWidth, height: video.videoHeight };
      if (displaySize.width === 0) return;

      faceapi.matchDimensions(canvas, displaySize);

      try {
        const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions();

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (detections) {
          const resizedDetections = faceapi.resizeResults(detections, displaySize);
          faceapi.draw.drawDetections(canvas, resizedDetections);
          faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

          // 1. Dominant Expression
          const expressions = detections.expressions;
          const dominantExpression = Object.keys(expressions).reduce((a, b) => expressions[a] > expressions[b] ? a : b);
          setExpression(dominantExpression.charAt(0).toUpperCase() + dominantExpression.slice(1));

          // 2. Eye Contact Estimation
          const landmarks = detections.landmarks;
          const leftEye = landmarks.getLeftEye();
          const rightEye = landmarks.getRightEye();
          const jaw = landmarks.getJawOutline();
          
          const leftEdgeDist = leftEye[0].x - jaw[0].x;
          const rightEdgeDist = jaw[16].x - rightEye[3].x;
          const ratio = Math.min(leftEdgeDist, rightEdgeDist) / (Math.max(leftEdgeDist, rightEdgeDist) || 1);
          const contactPct = Math.min(100, Math.round(ratio * 100 * 1.5));
          setEyeContact(contactPct);

          if (isSessionActive) {
            eyeContactHistoryRef.current.push(contactPct);
          }

          // 3. Lip Sync (Mouth Openness vs Audio Level)
          const mouth = landmarks.getMouth();
          const upperLipBottom = mouth[14];
          const lowerLipTop = mouth[18];
          const mouthOpenness = Math.abs(lowerLipTop.y - upperLipBottom.y);
          
          const currentAudio = getAudioLevel();
          setAudioLevel(Math.round(currentAudio));

          if (currentAudio > 30 && mouthOpenness < 2) {
            setLipSyncStatus('Mismatch (Audio, no mouth movement)');
            if (isSessionActive && anomaliesRef.current.length < 5) {
              anomaliesRef.current.push({
                start: formatTime(sessionSeconds),
                end: formatTime(sessionSeconds + 3),
                description: "Audio speech detected without corresponding mouth movement."
              });
              setAnomaliesCount(prev => prev + 1);
            }
          } else if (currentAudio < 5 && mouthOpenness > 15) {
            setLipSyncStatus('Mismatch (Mouth movement, no audio)');
            if (isSessionActive && anomaliesRef.current.length < 5) {
              anomaliesRef.current.push({
                start: formatTime(sessionSeconds),
                end: formatTime(sessionSeconds + 3),
                description: "Mouth movement observed without audible speech signal."
              });
              setAnomaliesCount(prev => prev + 1);
            }
          } else {
            setLipSyncStatus('Normal');
          }
        } else {
          setEyeContact(0);
          setExpression('No Face Detected');
        }
      } catch (err) {
        console.warn("Detection loop error", err);
      }
    }, 200);

    return () => clearInterval(intervalId);
  };

  const startSession = () => {
    setIsSessionActive(true);
    setSessionSeconds(0);
    setEventsCount(0);
    setAnomaliesCount(0);
    recordedChunksRef.current = [];
    eyeContactHistoryRef.current = [];
    anomaliesRef.current = [];
    sessionEventsRef.current = [];

    // Start MediaRecorder if supported
    if (streamRef.current && window.MediaRecorder) {
      try {
        const recorder = new MediaRecorder(streamRef.current);
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            recordedChunksRef.current.push(e.data);
          }
        };
        recorder.start(1000);
        mediaRecorderRef.current = recorder;
      } catch (e) {
        console.warn("MediaRecorder start error:", e);
      }
    }
  };

  const handleAddQA = () => {
    if (!currentQuestion && !currentAnswer) return;
    const ts = formatTime(sessionSeconds);
    const updated = [...transcript];
    if (currentQuestion) {
      updated.push({
        id: `q_${Date.now()}`,
        timestamp: ts,
        speaker: 'INTERVIEWER',
        text: currentQuestion
      });
    }
    if (currentAnswer) {
      updated.push({
        id: `a_${Date.now() + 1}`,
        timestamp: ts,
        speaker: 'CANDIDATE',
        text: currentAnswer
      });
    }
    setTranscript(updated);
    setCurrentQuestion('');
    setCurrentAnswer('');
  };

  const finishSession = () => {
    setIsSessionActive(false);

    // Stop MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    // Compute average eye contact
    const totalEye = eyeContactHistoryRef.current.reduce((a, b) => a + b, 0);
    const avgEyeContact = eyeContactHistoryRef.current.length > 0
      ? Math.round(totalEye / eyeContactHistoryRef.current.length)
      : eyeContact;

    // Build recorded video object URL if chunks exist
    let videoUrl = null;
    if (recordedChunksRef.current.length > 0) {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      videoUrl = URL.createObjectURL(blob);
    }

    const candidateProfile = selectedCandidate || {
      id: `CAND-${Date.now().toString().slice(-4)}`,
      name: "Live Session Candidate",
      role: "Live Assessment",
      experience: "Intermediate",
      skills: ["General Competency"],
      interviewDate: new Date().toISOString().split('T')[0]
    };

    const sessionPayload = {
      candidate: candidateProfile,
      transcript: transcript.length > 0 ? transcript : [
        { id: 'q1', timestamp: "00:00:10", speaker: 'INTERVIEWER', text: "Welcome to the interview. Please tell us about your experience." },
        { id: 'a1', timestamp: "00:00:20", speaker: 'CANDIDATE', text: "Thank you. I have been working on various software engineering projects." }
      ],
      visualSignals: {
        cameraFacing: avgEyeContact,
        awayFromCamera: 100 - avgEyeContact,
        status: avgEyeContact < 60 ? "MODERATE SIGNAL" : "NORMAL",
        message: avgEyeContact < 60 ? "Frequent off-camera gaze detected." : "Consistent eye contact maintained."
      },
      audioVideoSignals: {
        consistency: anomaliesRef.current.length > 0 ? 65 : 98,
        status: anomaliesRef.current.length > 0 ? "POTENTIAL ANOMALY" : "NORMAL",
        anomalies: anomaliesRef.current
      },
      assistanceSignals: {
        scriptedPattern: false,
        longPauses: 0,
        overall: "LOW"
      },
      sessionEvents: sessionEventsRef.current,
      videoUrl,
      evidenceQuality: {
        video: 95,
        audio: 95,
        faceVisibility: avgEyeContact,
        overall: 95,
        message: "Real-time session evidence captured directly."
      }
    };

    // Calculate real risk score
    const riskResult = calculateRisk(sessionPayload);

    // Save to storage
    const savedRecord = {
      ...sessionPayload,
      riskScore: riskResult.score,
      riskLevel: riskResult.level,
      status: 'COMPLETED'
    };
    saveInterview(savedRecord);

    stopMediaTracks();

    // Navigate to results
    navigate('/results', { state: sessionPayload });
  };

  return (
    <div className="live-interview-page container">
      <header className="live-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1>Live VERA Integrity Monitor</h1>
            <p>Real-time computer vision face tracking, gaze direction, audio-speech FFT, and lip-sync analysis.</p>
          </div>

          {/* Candidate selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <User size={18} className="text-muted" />
            <span className="text-sm text-muted">Target Candidate:</span>
            {availableCandidates.length > 0 ? (
              <select 
                className="btn btn-outline btn-sm"
                value={selectedCandidate?.id || ''}
                onChange={(e) => {
                  const found = availableCandidates.find(c => c.id === e.target.value);
                  setSelectedCandidate(found || null);
                }}
              >
                <option value="">Quick Assessment Candidate</option>
                {availableCandidates.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.role})</option>
                ))}
              </select>
            ) : (
              <span className="mono text-sm font-medium">{selectedCandidate?.name || 'Quick Candidate'}</span>
            )}
          </div>
        </div>
      </header>

      <div className="live-content-grid">
        {/* Left Column: Video & Controls */}
        <div className="video-section glass-panel">
          <div className="video-container">
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              onPlay={handleVideoOnPlay}
              className="live-video"
            />
            <canvas ref={canvasRef} className="live-canvas" />
            
            {!streamActive && (
              <div className="video-placeholder">
                <Camera size={48} className="placeholder-icon mb-2" />
                <p>{status}</p>
                {modelsLoaded && (
                  <button className="btn btn-primary mt-3" onClick={startVideo}>
                    START CAMERA & MIC
                  </button>
                )}
              </div>
            )}

            {isSessionActive && (
              <div style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'rgba(239, 68, 68, 0.9)', color: '#fff', padding: '0.25rem 0.75rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
                <span className="pulse">●</span> REC {formatTime(sessionSeconds)}
              </div>
            )}
          </div>

          {/* Session Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="text-sm text-muted">Session Duration: </span>
              <span className="mono font-bold" style={{ fontSize: '1.1rem' }}>{formatTime(sessionSeconds)}</span>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {streamActive && !isSessionActive && (
                <button className="btn btn-primary" onClick={startSession}>
                  <Play size={16} /> START MONITORING SESSION
                </button>
              )}
              {isSessionActive && (
                <button className="btn btn-secondary" style={{ background: 'var(--risk-high)', color: '#fff' }} onClick={finishSession}>
                  <Square size={16} /> END SESSION & GENERATE REPORT
                </button>
              )}
            </div>
          </div>

          {/* Live Q&A Notes */}
          {isSessionActive && (
            <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <MessageSquare size={16} className="text-muted" />
                <h4 style={{ fontSize: '0.95rem' }}>Live Interview Notes / Transcript</h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  value={currentQuestion} 
                  onChange={e => setCurrentQuestion(e.target.value)} 
                  placeholder="Interviewer question..." 
                  style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', padding: '0.5rem', borderRadius: '4px', color: '#fff' }}
                />
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    type="text" 
                    value={currentAnswer} 
                    onChange={e => setCurrentAnswer(e.target.value)} 
                    placeholder="Candidate response summary..." 
                    style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', padding: '0.5rem', borderRadius: '4px', color: '#fff' }}
                  />
                  <button className="btn btn-outline btn-sm" onClick={handleAddQA}>
                    <Plus size={14} /> Log QA
                  </button>
                </div>
              </div>

              {transcript.length > 0 && (
                <div style={{ marginTop: '0.75rem', maxHeight: '120px', overflowY: 'auto', fontSize: '0.85rem' }}>
                  {transcript.map((t, idx) => (
                    <div key={idx} style={{ padding: '0.25rem 0', color: t.speaker === 'INTERVIEWER' ? 'var(--secondary)' : 'var(--text-main)' }}>
                      <strong>{t.speaker}:</strong> {t.text}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Real-Time Telemetry */}
        <div className="telemetry-section">
          <div className="glass-panel telemetry-card">
            <h3><Activity size={18}/> System Status</h3>
            <div className="telemetry-value text-safe">{status}</div>
          </div>

          <div className="glass-panel telemetry-card">
            <h3>Facial Expression</h3>
            <div className="telemetry-value mono">{expression}</div>
          </div>

          <div className="glass-panel telemetry-card">
            <h3>Eye Contact Stability</h3>
            <div className="progress-bar mt-2 mb-1">
              <div 
                className="progress-fill" 
                style={{
                  width: `${eyeContact}%`, 
                  background: eyeContact < 50 ? 'var(--risk-high)' : 'var(--risk-low)'
                }}
              ></div>
            </div>
            <div className="telemetry-value mono">{eyeContact}%</div>
            {eyeContact < 50 && streamActive && (
              <div className="alert-text text-danger mt-1">
                <AlertTriangle size={14}/> Candidate looking off-screen
              </div>
            )}
          </div>

          <div className="glass-panel telemetry-card">
            <h3>A/V Lip-Sync Integrity</h3>
            <div className="sync-meters mt-2">
              <div className="meter-label">Audio Speech Frequency: {audioLevel}</div>
              <div className="progress-bar mb-2">
                <div className="progress-fill" style={{width: `${Math.min(100, audioLevel * 1.5)}%`, background: 'var(--secondary)'}}></div>
              </div>
              
              <div className={`telemetry-value ${lipSyncStatus === 'Normal' ? 'text-safe' : 'text-danger'}`}>
                {lipSyncStatus === 'Normal' ? <ShieldCheck size={16}/> : <AlertTriangle size={16}/>} 
                <span className="ml-1" style={{ fontSize: '0.9rem' }}>{lipSyncStatus}</span>
              </div>
            </div>
          </div>

          {isSessionActive && (
            <div className="glass-panel telemetry-card" style={{ borderLeft: '3px solid var(--secondary)' }}>
              <h3>Session Telemetry Log</h3>
              <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div>Window Focus Losses: <strong className="mono">{eventsCount}</strong></div>
                <div>A/V Sync Anomalies: <strong className="mono">{anomaliesCount}</strong></div>
                <div>Recorded Q&A entries: <strong className="mono">{transcript.length}</strong></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LiveInterview;

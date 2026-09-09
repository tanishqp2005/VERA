import { useEffect, useRef, useState } from 'react';
import * as faceapi from '@vladmandic/face-api';
import { Camera, Mic, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';
import './LiveInterview.css';

function LiveInterview() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);
  const streamRef = useRef(null);

  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [streamActive, setStreamActive] = useState(false);
  const [status, setStatus] = useState("Loading AI models...");
  
  // Analysis state
  const [expression, setExpression] = useState('Neutral');
  const [eyeContact, setEyeContact] = useState(100);
  const [audioLevel, setAudioLevel] = useState(0);
  const [lipSyncStatus, setLipSyncStatus] = useState('Normal');

  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ]);
        setModelsLoaded(true);
        setStatus("Models loaded. Waiting for camera...");
      } catch (err) {
        console.error("Failed to load face-api models", err);
        setStatus("Failed to load AI models.");
      }
    };
    loadModels();

    return () => {
      stopMediaTracks();
    };
  }, []);

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        streamRef.current = stream;
        let video = videoRef.current;
        video.srcObject = stream;
        video.play();
        setStreamActive(true);
        setStatus("Monitoring active...");

        // Setup AudioContext for lip sync heuristic
        setupAudioAnalysis(stream);
      })
      .catch((err) => {
        console.error("error:", err);
        setStatus("Camera access denied.");
      });
  };

  const stopMediaTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
  };

  const setupAudioAnalysis = (stream) => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContextRef.current = new AudioContext();
    analyserRef.current = audioContextRef.current.createAnalyser();
    microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
    microphoneRef.current.connect(analyserRef.current);
    analyserRef.current.fftSize = 256;
  };

  const getAudioLevel = () => {
    if (!analyserRef.current) return 0;
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    let sum = 0;
    for(let i = 0; i < bufferLength; i++) {
      sum += dataArray[i];
    }
    return sum / bufferLength;
  };

  const handleVideoOnPlay = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    // Create an interval to analyze frames
    setInterval(async () => {
      if (!modelsLoaded || !video || video.paused || video.ended) return;

      const displaySize = { width: video.videoWidth, height: video.videoHeight };
      if (displaySize.width === 0) return; // Not ready yet

      faceapi.matchDimensions(canvas, displaySize);

      const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (detections) {
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

        // 1. Expression Analysis
        const expressions = detections.expressions;
        const dominantExpression = Object.keys(expressions).reduce((a, b) => expressions[a] > expressions[b] ? a : b);
        setExpression(dominantExpression.charAt(0).toUpperCase() + dominantExpression.slice(1));

        // 2. Eye Contact (Heuristic using landmarks)
        // A simple heuristic: check the distance between outer eyes and face edge
        const landmarks = detections.landmarks;
        const leftEye = landmarks.getLeftEye();
        const rightEye = landmarks.getRightEye();
        const jaw = landmarks.getJawOutline();
        
        const leftEdgeDist = leftEye[0].x - jaw[0].x;
        const rightEdgeDist = jaw[16].x - rightEye[3].x;
        
        // Ratio close to 1 means facing forward
        const ratio = Math.min(leftEdgeDist, rightEdgeDist) / Math.max(leftEdgeDist, rightEdgeDist);
        const contactPct = Math.min(100, Math.round(ratio * 100 * 1.5)); // Scale up a bit
        setEyeContact(contactPct);

        // 3. Lip Sync (Mouth Openness vs Audio Level)
        const mouth = landmarks.getMouth();
        const upperLipBottom = mouth[14]; // bottom of top lip
        const lowerLipTop = mouth[18]; // top of bottom lip
        const mouthOpenness = lowerLipTop.y - upperLipBottom.y;
        
        const currentAudio = getAudioLevel();
        setAudioLevel(Math.round(currentAudio));

        // Heuristic: If loud audio but mouth is closed, or mouth moving widely with no audio
        if (currentAudio > 30 && mouthOpenness < 2) {
          setLipSyncStatus('Mismatch (Audio, no mouth movement)');
        } else if (currentAudio < 5 && mouthOpenness > 15) {
          setLipSyncStatus('Mismatch (Mouth movement, no audio)');
        } else {
          setLipSyncStatus('Normal');
        }
      } else {
        setEyeContact(0);
        setExpression('None Detected');
      }
    }, 200);
  };

  return (
    <div className="live-interview-page container">
      <header className="live-header">
        <h1>Live VERA Analysis</h1>
        <p>Real-time processing of facial expressions, eye-contact, and lip-sync.</p>
      </header>

      <div className="live-content-grid">
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
                  <button className="btn btn-primary mt-2" onClick={startVideo}>
                    START CAMERA
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="telemetry-section">
          <div className="glass-panel telemetry-card">
            <h3><Activity size={18}/> Status</h3>
            <div className="telemetry-value text-safe">{status}</div>
          </div>

          <div className="glass-panel telemetry-card">
            <h3>Facial Expression</h3>
            <div className="telemetry-value mono">{expression}</div>
          </div>

          <div className="glass-panel telemetry-card">
            <h3>Eye Contact</h3>
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
                <AlertTriangle size={14}/> Candidate looking away
              </div>
            )}
          </div>

          <div className="glass-panel telemetry-card">
            <h3>A/V Lip-Sync Integrity</h3>
            <div className="sync-meters mt-2">
              <div className="meter-label">Audio Level: {audioLevel}</div>
              <div className="progress-bar mb-2">
                <div className="progress-fill" style={{width: `${Math.min(100, audioLevel * 1.5)}%`, background: 'var(--secondary)'}}></div>
              </div>
              
              <div className={`telemetry-value ${lipSyncStatus === 'Normal' ? 'text-safe' : 'text-danger'}`}>
                {lipSyncStatus === 'Normal' ? <ShieldCheck size={16}/> : <AlertTriangle size={16}/>} 
                <span className="ml-1">{lipSyncStatus}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LiveInterview;

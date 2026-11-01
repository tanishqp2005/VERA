import { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, FastForward, Rewind, AlertTriangle, ChevronRight, ChevronLeft, Video, FileText } from 'lucide-react';
import TranscriptPanel from '../components/TranscriptPanel';
import './Investigation.css';

// Convert "00:MM:SS" string to total seconds
function timestampToSeconds(ts) {
  if (!ts) return 0;
  const parts = ts.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return 0;
}

// Convert seconds to "00:MM:SS"
function secondsToTimestamp(secs) {
  const s = Math.floor(secs);
  const m = Math.floor(s / 60);
  const remS = s % 60;
  const h = Math.floor(m / 60);
  const remM = m % 60;
  return `${String(h).padStart(2, '0')}:${String(remM).padStart(2, '0')}:${String(remS).padStart(2, '0')}`;
}

function Investigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state;

  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoDurationSec, setVideoDurationSec] = useState(180);

  // Compute anomalies safely
  const anomalies = useMemo(() => {
    const timelineEvents = data?.timeline || [];
    return timelineEvents.filter(ev => ev.severity === 'danger' || ev.severity === 'warning');
  }, [data?.timeline]);

  const [activeAnomalyIndex, setActiveAnomalyIndex] = useState(() => {
    if (data?.activeTimestamp && anomalies.length > 0) {
      const idx = anomalies.findIndex(a => a.timestamp === data.activeTimestamp);
      return idx !== -1 ? idx : 0;
    }
    return 0;
  });

  const [currentTimeSec, setCurrentTimeSec] = useState(() => {
    if (data?.activeTimestamp) {
      return timestampToSeconds(data.activeTimestamp);
    }
    if (anomalies.length > 0) {
      return timestampToSeconds(anomalies[0].timestamp);
    }
    return 0;
  });

  const [activeTimestamp, setActiveTimestamp] = useState(data?.activeTimestamp || null);

  // Navigate back if no candidate data
  useEffect(() => {
    if (!data || !data.candidate) {
      navigate('/analyze');
    }
  }, [data, navigate]);

  if (!data || !data.candidate) return null;

  const activeAnomaly = anomalies[activeAnomalyIndex] || null;
  const videoSource = data.videoUrl || null;

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTimeSec(videoRef.current.currentTime);
      if (videoRef.current.duration) {
        setVideoDurationSec(videoRef.current.duration);
      }
    }
  };

  const seekToSeconds = (secs) => {
    const clamped = Math.max(0, Math.min(videoDurationSec, secs));
    setCurrentTimeSec(clamped);
    if (videoRef.current) {
      videoRef.current.currentTime = clamped;
    }
  };

  const handleTimestampClick = (ts) => {
    setActiveTimestamp(ts);
    const secs = timestampToSeconds(ts);
    seekToSeconds(secs);

    const idx = anomalies.findIndex(a => a.timestamp === ts);
    if (idx !== -1) setActiveAnomalyIndex(idx);
  };

  const handleNextAnomaly = () => {
    if (activeAnomalyIndex < anomalies.length - 1) {
      const nextIdx = activeAnomalyIndex + 1;
      setActiveAnomalyIndex(nextIdx);
      const nextTs = anomalies[nextIdx].timestamp;
      setActiveTimestamp(nextTs);
      seekToSeconds(timestampToSeconds(nextTs));
    }
  };

  const handlePrevAnomaly = () => {
    if (activeAnomalyIndex > 0) {
      const prevIdx = activeAnomalyIndex - 1;
      setActiveAnomalyIndex(prevIdx);
      const prevTs = anomalies[prevIdx].timestamp;
      setActiveTimestamp(prevTs);
      seekToSeconds(timestampToSeconds(prevTs));
    }
  };

  const progressPercent = videoDurationSec > 0 ? (currentTimeSec / videoDurationSec) * 100 : 0;

  return (
    <div className="investigation-page container">
      <div className="back-nav">
        <button className="btn btn-outline" onClick={() => navigate('/results', { state: data })}>
          <ArrowLeft size={16} /> Back to Results
        </button>
      </div>

      <header className="investigation-header">
        <div className="header-subtitle">FORENSIC INVESTIGATION CONSOLE</div>
        <h1>Evidence Review: {data.candidate.name} <span className="text-muted text-sm mono">({data.candidate.id})</span></h1>
      </header>

      <div className="investigation-layout">
        {/* Main Video / Timeline Player */}
        <div className="main-console">
          <div className="video-player-mock glass-panel">
            <div className="video-screen">
              {videoSource ? (
                <video
                  ref={videoRef}
                  src={videoSource}
                  className="investigation-actual-video"
                  onTimeUpdate={handleVideoTimeUpdate}
                  onLoadedMetadata={(e) => setVideoDurationSec(e.target.duration || 180)}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }}
                />
              ) : (
                <div className="mock-video-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <Video size={48} className="text-secondary mb-2" style={{ opacity: 0.7 }} />
                  <p className="text-muted text-sm">Synthetic Evidence Timeline Playback</p>
                  <p className="mono text-xs text-muted">Use timeline markers to jump between detected anomaly events</p>
                </div>
              )}
              
              <div className="video-overlay">
                <div className="overlay-timestamp mono">{secondsToTimestamp(currentTimeSec)}</div>
                <div className="overlay-status text-safe">
                  {isPlaying ? '▶ PLAYING' : '❚❚ PAUSED'}
                </div>
              </div>
            </div>
            
            <div className="video-controls">
              <button className="btn-icon" onClick={() => seekToSeconds(currentTimeSec - 5)} title="Rewind 5s">
                <Rewind size={20} />
              </button>
              <button className="btn-icon play-btn" onClick={togglePlay} aria-label={isPlaying ? "Pause" : "Play"}>
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>
              <button className="btn-icon" onClick={() => seekToSeconds(currentTimeSec + 5)} title="Fast forward 5s">
                <FastForward size={20} />
              </button>
              
              <div className="timeline-scrubber" onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const ratio = Math.max(0, Math.min(1, clickX / rect.width));
                seekToSeconds(ratio * videoDurationSec);
              }}>
                <div className="scrubber-track">
                  <div className="scrubber-fill" style={{ width: `${progressPercent}%` }}></div>
                  
                  {/* Mark anomalies on scrubber */}
                  {anomalies.map((a, i) => {
                    const eventSec = timestampToSeconds(a.timestamp);
                    const pct = Math.min(100, (eventSec / (videoDurationSec || 180)) * 100);
                    return (
                      <div 
                        key={i} 
                        className={`scrubber-marker ${a.severity === 'danger' ? 'marker-danger' : 'marker-warning'}`}
                        style={{ left: `${pct}%` }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTimestampClick(a.timestamp);
                        }}
                        title={`${a.type} at ${a.timestamp}`}
                      ></div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          
          <div className="glass-panel active-anomaly-panel">
            {activeAnomaly ? (
              <>
                <div className="anomaly-header">
                  <h3>Active Anomaly Focus</h3>
                  <div className="anomaly-nav">
                    <button className="btn btn-outline btn-sm" onClick={handlePrevAnomaly} disabled={activeAnomalyIndex === 0}>
                      <ChevronLeft size={16} /> Prev
                    </button>
                    <span className="anomaly-counter">{activeAnomalyIndex + 1} of {anomalies.length}</span>
                    <button className="btn btn-outline btn-sm" onClick={handleNextAnomaly} disabled={activeAnomalyIndex === anomalies.length - 1}>
                      Next <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
                
                <div className={`anomaly-card severity-${activeAnomaly.severity}`}>
                  <div className="anomaly-icon">
                    <AlertTriangle size={24} />
                  </div>
                  <div className="anomaly-details">
                    <div className="anomaly-time mono">{activeAnomaly.timestamp}</div>
                    <h4>{activeAnomaly.type}</h4>
                    <p>{activeAnomaly.description}</p>
                    {activeAnomaly.riskContribution > 0 && (
                      <div className="anomaly-confidence text-danger font-medium mt-1">
                        Risk impact: +{activeAnomaly.riskContribution}
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="no-anomalies text-muted text-center py-4">
                No major anomalies flagged for this interview.
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Transcript Area */}
        <div className="sidebar-console">
          <div className="glass-panel transcript-wrapper">
            <h3 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={18} /> Synchronized Transcript
            </h3>
            <div className="transcript-container">
              <TranscriptPanel 
                transcript={data.transcript} 
                activeTimestamp={activeTimestamp} 
                onTimestampClick={handleTimestampClick}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Investigation;

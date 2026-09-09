import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, FastForward, Rewind, AlertTriangle, ChevronRight, ChevronLeft } from 'lucide-react';
import TranscriptPanel from '../components/TranscriptPanel';
import './Investigation.css';

function Investigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state;

  const [activeAnomalyIndex, setActiveAnomalyIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState("00:00:00");
  const [activeTimestamp, setActiveTimestamp] = useState(data?.activeTimestamp || null);

  useEffect(() => {
    if (!data || !data.candidate) {
      navigate('/analyze');
    }
  }, [data, navigate]);

  if (!data) return null;

  const anomalies = data.timeline.filter(ev => ev.severity === 'danger' || ev.severity === 'warning');
  
  // Set initial anomaly based on passed activeTimestamp
  useEffect(() => {
    if (activeTimestamp && anomalies.length > 0) {
      const idx = anomalies.findIndex(a => a.timestamp === activeTimestamp);
      if (idx !== -1) {
        setActiveAnomalyIndex(idx);
        setCurrentTime(activeTimestamp);
      }
    } else if (anomalies.length > 0) {
      setCurrentTime(anomalies[0].timestamp);
    }
  }, [activeTimestamp]);

  const activeAnomaly = anomalies[activeAnomalyIndex];

  const handleNextAnomaly = () => {
    if (activeAnomalyIndex < anomalies.length - 1) {
      const nextIdx = activeAnomalyIndex + 1;
      setActiveAnomalyIndex(nextIdx);
      setCurrentTime(anomalies[nextIdx].timestamp);
      setActiveTimestamp(anomalies[nextIdx].timestamp);
    }
  };

  const handlePrevAnomaly = () => {
    if (activeAnomalyIndex > 0) {
      const prevIdx = activeAnomalyIndex - 1;
      setActiveAnomalyIndex(prevIdx);
      setCurrentTime(anomalies[prevIdx].timestamp);
      setActiveTimestamp(anomalies[prevIdx].timestamp);
    }
  };

  const handleTimestampClick = (ts) => {
    setCurrentTime(ts);
    setActiveTimestamp(ts);
    // Find closest anomaly
    const idx = anomalies.findIndex(a => a.timestamp === ts);
    if (idx !== -1) setActiveAnomalyIndex(idx);
  };

  return (
    <div className="investigation-page container">
      <div className="back-nav">
        <button className="btn btn-outline" onClick={() => navigate('/results', { state: data })}>
          <ArrowLeft size={16} /> Back to Results
        </button>
      </div>

      <header className="investigation-header">
        <div className="header-subtitle">INVESTIGATION CONSOLE</div>
        <h1>Evidence Review: {data.candidate.name}</h1>
      </header>

      <div className="investigation-layout">
        
        {/* Main Video Area */}
        <div className="main-console">
          <div className="video-player-mock glass-panel">
            <div className="video-screen">
              <div className="mock-video-content">
                <div className="mock-face"></div>
                <div className="video-overlay">
                  <div className="overlay-timestamp">{currentTime}</div>
                  <div className="overlay-status text-safe">● REC</div>
                </div>
              </div>
            </div>
            
            <div className="video-controls">
              <button className="btn-icon" onClick={() => {}}><Rewind size={20} /></button>
              <button className="btn-icon play-btn" onClick={() => setIsPlaying(!isPlaying)}>
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>
              <button className="btn-icon" onClick={() => {}}><FastForward size={20} /></button>
              
              <div className="timeline-scrubber">
                <div className="scrubber-track">
                  <div className="scrubber-fill" style={{ width: '45%' }}></div>
                  
                  {/* Mark anomalies on scrubber */}
                  {anomalies.map((a, i) => {
                    // Fake percentage calculation based on timestamp
                    const min = parseInt(a.timestamp.substring(3, 5));
                    const pct = Math.min(100, (min / 30) * 100);
                    return (
                      <div 
                        key={i} 
                        className={`scrubber-marker ${a.severity === 'danger' ? 'marker-danger' : 'marker-warning'}`}
                        style={{ left: `${pct}%` }}
                        onClick={() => handleTimestampClick(a.timestamp)}
                        title={a.type}
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
                    <div className="anomaly-time">{activeAnomaly.timestamp}</div>
                    <h4>{activeAnomaly.type}</h4>
                    <p>{activeAnomaly.description}</p>
                    <div className="anomaly-confidence">Confidence: {80 + Math.floor(Math.random() * 15)}%</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="no-anomalies text-muted text-center py-4">
                No major anomalies to investigate.
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Transcript Area */}
        <div className="sidebar-console">
          <div className="glass-panel transcript-wrapper">
            <h3 className="panel-title">Synchronized Transcript</h3>
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

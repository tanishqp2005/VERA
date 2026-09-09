import { useState } from 'react';
import { Search, Clock } from 'lucide-react';
import './TranscriptPanel.css';

function TranscriptPanel({ transcript, onTimestampClick, activeTimestamp }) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!transcript || transcript.length === 0) {
    return <div className="transcript-empty">No transcript available for this interview.</div>;
  }

  const filteredTranscript = transcript.filter(t => 
    t.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="transcript-panel">
      <div className="transcript-header">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search transcript..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="transcript-content">
        {filteredTranscript.map((entry, idx) => (
          <div 
            key={entry.id || idx} 
            className={`transcript-entry ${entry.speaker === 'INTERVIEWER' ? 'interviewer' : 'candidate'} ${activeTimestamp === entry.timestamp ? 'active-entry' : ''}`}
          >
            <div className="entry-meta">
              <span className="speaker">{entry.speaker}</span>
              <button 
                className="timestamp-btn" 
                onClick={() => onTimestampClick && onTimestampClick(entry.timestamp)}
                title="Jump to video time"
              >
                <Clock size={12} /> {entry.timestamp}
              </button>
            </div>
            <div className="entry-text">
              {entry.text}
            </div>
          </div>
        ))}
        {filteredTranscript.length === 0 && (
          <div className="text-center py-4 text-muted">No matches found for "{searchTerm}"</div>
        )}
      </div>
    </div>
  );
}

export default TranscriptPanel;

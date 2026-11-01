import { useState } from 'react';
import { Bot, Copy, RefreshCw, Check } from 'lucide-react';
import './FollowUpQuestions.css';

function FollowUpQuestions({ candidate = {}, reasons = [] }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(-1);

  const generateQuestions = () => {
    setIsGenerating(true);
    
    // Generate context-aware follow-up probes
    setTimeout(() => {
      const generated = [];
      const primarySkill = (candidate.skills && candidate.skills[0]) ? candidate.skills[0] : 'core technologies';
      const secondarySkill = (candidate.skills && candidate.skills[1]) ? candidate.skills[1] : 'framework architecture';

      const hasTechnicalMismatch = reasons.some(r => r.title.toLowerCase().includes("technical"));
      const hasScripting = reasons.some(r => r.title.toLowerCase().includes("script") || r.title.toLowerCase().includes("assistance"));
      const hasAVAnomaly = reasons.some(r => r.title.toLowerCase().includes("lip-sync") || r.title.toLowerCase().includes("audio-visual"));

      if (hasTechnicalMismatch) {
        generated.push(`Can you walk me through how you implemented ${primarySkill} in a real-world project, explaining edge cases and trade-offs you encountered?`);
        generated.push(`If a system using ${secondarySkill} fails under high concurrency or memory pressure, what diagnostic steps would you take first?`);
      }
      
      if (hasScripting) {
        generated.push(`Let's do an impromptu whiteboard scenario: design a minimal system architecture using ${primarySkill} for an unpredictable workload.`);
        generated.push(`Can you explain why you chose this specific approach over alternate industry designs, in your own words?`);
      }

      if (hasAVAnomaly) {
        generated.push(`Could you briefly recap your last answer regarding your project experience and summarize the main bottlenecks?`);
      }
      
      if (generated.length === 0) {
        generated.push(`Can you describe a challenging debugging scenario involving ${primarySkill} and what tools you used to resolve it?`);
        generated.push(`How do you approach architectural decisions when balancing performance vs maintainability in ${candidate.role || 'your development'}?`);
        generated.push(`What is a recent technical lesson you learned that changed how you design software?`);
      }
      
      setQuestions(generated);
      setIsGenerating(false);
    }, 600);
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(-1), 2000);
  };

  return (
    <div className="follow-up-questions">
      <div className="questions-header">
        <Bot size={20} className="ai-icon" />
        <h3>AI Follow-Up Recommendations</h3>
      </div>
      
      <p className="questions-desc">
        Generate targeted technical probe questions to verify candidate depth in areas of observed inconsistency.
      </p>
      
      {questions.length === 0 ? (
        <button 
          className="btn btn-secondary w-full" 
          onClick={generateQuestions} 
          disabled={isGenerating}
        >
          {isGenerating ? <><RefreshCw size={16} className="spin" /> GENERATING...</> : "GENERATE FOLLOW-UP QUESTIONS"}
        </button>
      ) : (
        <div className="questions-list">
          {questions.map((q, i) => (
            <div key={i} className="question-item">
              <div className="q-number">Q{i + 1}</div>
              <div className="q-text">{q}</div>
              <button 
                className="btn-icon" 
                onClick={() => copyToClipboard(q, i)}
                title="Copy to clipboard"
                aria-label="Copy to clipboard"
              >
                {copiedIndex === i ? <Check size={16} color="var(--risk-low)" /> : <Copy size={16} />}
              </button>
            </div>
          ))}
          <button className="btn btn-outline btn-sm mt-3 w-full" onClick={generateQuestions}>
            <RefreshCw size={14} /> REGENERATE PROBES
          </button>
        </div>
      )}
    </div>
  );
}

export default FollowUpQuestions;

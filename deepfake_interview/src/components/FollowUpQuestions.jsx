import { useState } from 'react';
import { Bot, Copy, RefreshCw, Check } from 'lucide-react';
import './FollowUpQuestions.css';

function FollowUpQuestions({ candidate, reasons }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(-1);

  const generateQuestions = () => {
    setIsGenerating(true);
    
    // Simulate API delay
    setTimeout(() => {
      let generated = [];
      const hasTechnicalMismatch = reasons.find(r => r.title.toLowerCase().includes("technical"));
      const hasScripting = reasons.find(r => r.title.toLowerCase().includes("script"));
      
      if (hasTechnicalMismatch) {
        generated.push(`Can you explain the difference between ${candidate.skills[0] || 'your core skill'} concepts in your own words, without using definitions?`);
        generated.push(`In your ${candidate.projects || 'recent project'}, what was the hardest technical challenge and exactly how did you solve it?`);
      }
      
      if (hasScripting) {
        generated.push(`Could we walk through a live coding or whiteboard exercise regarding your experience with ${candidate.skills[1] || 'this technology'}?`);
      }
      
      if (generated.length === 0) {
        generated = [
          `Can you describe a situation where you had to quickly learn a new technology?`,
          `What is the most complex problem you've solved using ${candidate.skills[0] || 'your primary skill'}?`,
          `How do you stay updated with the latest trends in ${candidate.role}?`
        ];
      }
      
      setQuestions(generated);
      setIsGenerating(false);
    }, 1500);
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
      
      <p className="questions-desc">Generate targeted questions to verify inconsistencies detected during the interview.</p>
      
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
              <div className="q-number">Q{i+1}</div>
              <div className="q-text">{q}</div>
              <button 
                className="btn-icon" 
                onClick={() => copyToClipboard(q, i)}
                title="Copy to clipboard"
              >
                {copiedIndex === i ? <Check size={16} color="var(--risk-low)" /> : <Copy size={16} />}
              </button>
            </div>
          ))}
          <button className="btn btn-outline btn-sm mt-3 w-full" onClick={generateQuestions}>
            <RefreshCw size={14} /> REGENERATE
          </button>
        </div>
      )}
    </div>
  );
}

export default FollowUpQuestions;

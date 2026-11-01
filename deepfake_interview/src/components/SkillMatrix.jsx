import { CheckCircle, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';
import './SkillMatrix.css';

function SkillMatrix({ candidate = {}, transcript = [] }) {
  const skills = Array.isArray(candidate.skills) ? candidate.skills : [];

  // Extract all text spoken by candidate
  const candidateText = Array.isArray(transcript)
    ? transcript
        .filter(t => t.speaker === 'CANDIDATE')
        .map(t => t.text || '')
        .join(' ')
        .toLowerCase()
    : '';

  const matrixData = skills.map((skill) => {
    const cleanSkill = skill.trim();
    const skillLower = cleanSkill.toLowerCase();
    
    // Check if the skill name or its parts are present in candidate answers
    const directMention = skillLower.length > 0 && candidateText.includes(skillLower);
    
    // Check keywords related to common skills if direct name isn't verbatim
    let status = "NOT DEMONSTRATED";
    let observed = "None";
    let confidence = 35;

    if (directMention) {
      // Find how much candidate spoke around this skill
      const sentences = candidateText.split(/[.?!]/).filter(s => s.includes(skillLower));
      const wordCount = sentences.join(' ').split(/\s+/).filter(Boolean).length;

      if (wordCount >= 20) {
        status = "VERIFIED";
        observed = "Strong";
        confidence = Math.min(98, 80 + Math.min(18, wordCount));
      } else {
        status = "NEEDS REVIEW";
        observed = "Moderate";
        confidence = 65;
      }
    } else {
      // If candidate text is substantial (> 100 words) but never mentioned this skill
      if (candidateText.length > 100) {
        status = "NOT DEMONSTRATED";
        observed = "None";
        confidence = 75;
      } else {
        status = "NOT DEMONSTRATED";
        observed = "Insufficient Data";
        confidence = 45;
      }
    }

    return {
      skill: cleanSkill,
      claimed: candidate.experience || 'Not specified',
      observed,
      confidence,
      status
    };
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'VERIFIED': return <CheckCircle size={16} color="var(--risk-low)" />;
      case 'NEEDS REVIEW': return <AlertTriangle size={16} color="var(--risk-medium)" />;
      case 'NOT DEMONSTRATED': return <HelpCircle size={16} color="var(--text-muted)" />;
      default: return <XCircle size={16} color="var(--risk-high)" />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'VERIFIED': return 'text-safe';
      case 'NEEDS REVIEW': return 'text-warn';
      case 'NOT DEMONSTRATED': return 'text-muted';
      default: return 'text-danger';
    }
  };

  return (
    <div className="skill-matrix">
      <div className="table-responsive">
        <table className="matrix-table">
          <thead>
            <tr>
              <th>SKILL</th>
              <th>CLAIMED LEVEL</th>
              <th>OBSERVED EVIDENCE</th>
              <th>CONFIDENCE</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {matrixData.map((row, index) => (
              <tr key={index}>
                <td className="font-medium">{row.skill}</td>
                <td>{row.claimed}</td>
                <td>{row.observed}</td>
                <td>{row.confidence}%</td>
                <td className={`status-cell ${getStatusClass(row.status)}`}>
                  {getStatusIcon(row.status)}
                  <span>{row.status}</span>
                </td>
              </tr>
            ))}
            {matrixData.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-4 text-muted">
                  No specific skills listed for verification.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SkillMatrix;

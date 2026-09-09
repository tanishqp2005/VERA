import { CheckCircle, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';
import './SkillMatrix.css';

function SkillMatrix({ candidate, transcript }) {
  // In a real system, an ML NLP service would compute these dynamically.
  // We simulate it using deterministic logic based on candidate ID and experience level.
  const generateMockMatrix = () => {
    const skills = candidate.skills || [];
    const isWeak = candidate.id === "CAND-2819" || candidate.id === "CAND-5911"; // Skill mismatch cases
    
    return skills.map((skill, i) => {
      let status = "VERIFIED";
      let observed = "Strong";
      let confidence = 85 + (i * 2);
      
      if (isWeak) {
        if (i === 0) {
          status = "NEEDS REVIEW";
          observed = "Weak";
          confidence = 47;
        } else if (i === 1) {
          status = "NEEDS REVIEW";
          observed = "Moderate";
          confidence = 41;
        } else if (i > 1) {
          status = "NOT DEMONSTRATED";
          observed = "None";
          confidence = 31;
        }
      }
      
      return { skill, claimed: candidate.experience, observed, confidence, status };
    });
  };

  const matrixData = generateMockMatrix();

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
                <td colSpan="5" className="text-center py-4 text-muted">No specific skills listed for verification.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SkillMatrix;

import { Database, Eye, ShieldAlert, CheckCircle } from 'lucide-react';
import './About.css';

function About() {
  return (
    <div className="about-page container">
      <div className="page-header">
        <h1>How It Works</h1>
        <p>Understanding the VERA Interview Integrity Architecture</p>
      </div>

      <div className="architecture-steps">
        <div className="step-card glass-panel">
          <div className="step-number">01</div>
          <div className="step-icon"><Database size={32} /></div>
          <h3>PROFILE</h3>
          <p>Candidate claims and resume information are ingested into the system to establish a baseline of expected knowledge and experience.</p>
        </div>

        <div className="step-connector"></div>

        <div className="step-card glass-panel">
          <div className="step-number">02</div>
          <div className="step-icon"><Eye size={32} /></div>
          <h3>INTERVIEW</h3>
          <p>Questions and answers are collected, along with behavioral observation signals (e.g., eye contact, response patterns).</p>
        </div>

        <div className="step-connector"></div>

        <div className="step-card glass-panel">
          <div className="step-number">03</div>
          <div className="step-icon"><ShieldAlert size={32} /></div>
          <h3>AI + RULE ENGINE</h3>
          <p>Claims are compared with responses and observation signals. The engine checks for claim-response mismatches and technical depth inconsistencies.</p>
        </div>

        <div className="step-connector"></div>

        <div className="step-card glass-panel">
          <div className="step-number">04</div>
          <div className="step-icon"><CheckCircle size={32} /></div>
          <h3>RISK + EXPLANATION</h3>
          <p>Generate a transparent 0–100 integrity risk score with clear evidence and explanations of any flagged anomalies.</p>
        </div>
      </div>

      <div className="human-review-section glass-panel">
        <h2>Human Review Required</h2>
        <p className="highlight-text">
          The system does not make hiring decisions. It surfaces inconsistencies for interviewer verification.
        </p>
        <p>
          VERA is designed as an interviewer-assistance tool. It highlights potential risks like scripted answers or external prompting, but the final evaluation must always be conducted by a human evaluator using targeted follow-up questions.
        </p>
      </div>
    </div>
  );
}

export default About;

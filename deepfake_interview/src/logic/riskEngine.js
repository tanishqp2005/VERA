export function calculateRisk(candidate, interview, observations) {
  let score = 0;
  let reasons = [];
  let evidence = [];
  let subScores = {
    profileConsistency: 100,
    technicalDepth: 100,
    answerConsistency: 100,
    assistanceSignal: 100,
    observationSignal: 100
  };

  const addEvidence = (timeOffset, message) => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - timeOffset);
    evidence.push({
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      message
    });
  };

  addEvidence(15, `Candidate profile submitted claiming ${candidate.experience} experience`);
  addEvidence(10, `Interview started`);

  // Rule 1: Technical Depth vs Claims
  if (candidate.experience === "Advanced" || candidate.experience === "Expert") {
    if (observations.technicalConfidence === "Weak") {
      score += 25;
      subScores.technicalDepth -= 60;
      subScores.profileConsistency -= 40;
      reasons.push({
        title: "Technical depth inconsistency",
        description: `The claimed ${candidate.experience} expertise level is not fully supported by the interview answers.`
      });
      addEvidence(8, `Question answered with weak technical depth despite claiming ${candidate.experience} expertise`);
    } else if (observations.technicalConfidence === "Moderate") {
      score += 10;
      subScores.technicalDepth -= 20;
    }
  } else if (candidate.experience === "Beginner") {
    // Edge case: Beginner gives strong answers
    if (observations.technicalConfidence === "Strong") {
      subScores.technicalDepth = 95; // High depth
      addEvidence(8, `Strong technical answers provided (exceeds claimed beginner level, positive signal)`);
    }
  }

  // Rule 2: Scripting / Assistance
  if (observations.prompting === "Possible") {
    score += 10;
    subScores.assistanceSignal -= 40;
    reasons.push({
      title: "Possible external assistance",
      description: "Interview observations indicate a possible prompting pattern."
    });
    addEvidence(5, "Possible prompting signal detected");
  } else if (observations.prompting === "Strong") {
    score += 25;
    subScores.assistanceSignal -= 80;
    reasons.push({
      title: "Strong external assistance signal",
      description: "Significant indicators of external prompting or scripted responses detected."
    });
    addEvidence(5, "Strong prompting signal detected during responses");
  }

  if (observations.responsePattern === "Highly scripted") {
    score += 10;
    subScores.answerConsistency -= 30;
    if (!reasons.find(r => r.title.includes("assistance"))) {
       reasons.push({
         title: "Highly scripted responses",
         description: "Candidate answers appear highly rehearsed or read from a script."
       });
    }
  }

  // Rule 3: Observation Signals
  if (observations.lipSync === "Possible mismatch") {
    score += 15;
    subScores.observationSignal -= 30;
    reasons.push({
      title: "Audio-visual anomaly",
      description: "Possible lip-sync mismatch detected in the video feed."
    });
    addEvidence(4, "Possible lip-sync mismatch observed");
  } else if (observations.lipSync === "Strong mismatch") {
    score += 25;
    subScores.observationSignal -= 70;
    reasons.push({
      title: "Strong Audio-visual anomaly",
      description: "Significant lip-sync mismatch detected."
    });
    addEvidence(4, "Strong lip-sync mismatch observed");
  }

  if (observations.eyeContact === "Irregular") {
    score += 5;
    subScores.observationSignal -= 15;
  }

  // Rule 4: Answer Consistency
  if (observations.consistency === "Slightly inconsistent") {
    score += 10;
    subScores.answerConsistency -= 20;
  } else if (observations.consistency === "Highly inconsistent") {
    score += 20;
    subScores.answerConsistency -= 50;
    reasons.push({
      title: "Claim-response mismatch",
      description: "Candidate claims do not align with the provided answers."
    });
    addEvidence(3, "Highly inconsistent answers compared to claimed skills");
  }

  // Cap score
  score = Math.min(100, score);
  addEvidence(0, "Integrity risk calculated");

  // Determine Level
  let level = "LOW RISK";
  if (score >= 60) level = "HIGH RISK";
  else if (score >= 30) level = "MEDIUM RISK";

  // Default reasons if none generated but score is not 0
  if (reasons.length === 0 && score > 0) {
    if (score < 30) {
       reasons.push({
         title: "Minor inconsistencies",
         description: "Some minor inconsistencies in technical depth or delivery, typical in normal interviews."
       });
    } else {
       reasons.push({
         title: "General Inconsistencies",
         description: "Multiple minor signals accumulated during the interview."
       });
    }
  }

  return {
    score,
    level,
    reasons,
    evidence: evidence.reverse(), // latest first
    subScores
  };
}

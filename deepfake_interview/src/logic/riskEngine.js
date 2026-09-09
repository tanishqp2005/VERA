/**
 * Central Risk Engine
 * Consumes modular analysis signals to generate a final 0-100 risk score, 
 * risk level, explainable reasons, and a unified evidence timeline.
 */
export function calculateRisk(analysisData) {
  const {
    candidate,
    transcript,
    visualSignals,
    audioVideoSignals,
    assistanceSignals,
    sessionEvents,
    evidenceQuality
  } = analysisData;

  let score = 0;
  let reasons = [];
  let timeline = [];
  let subScores = {
    profileConsistency: 100,
    technicalDepth: 100,
    answerConsistency: 100,
    assistanceSignal: 100,
    observationSignal: 100
  };

  const addTimelineEvent = (timestamp, type, severity, description, riskContribution = 0) => {
    timeline.push({
      timestamp,
      type,
      severity, // 'info', 'warning', 'danger', 'success'
      description,
      riskContribution
    });
  };

  // Add initial timeline events
  addTimelineEvent("00:00:00", "PROFILE LOADED", "info", `Candidate profile loaded claiming ${candidate.experience} experience`);

  // --- Rule 1: Technical Depth & Profile Consistency ---
  // In a real system, technicalAnalysis.js would output this. Here we infer from the transcript answers vs claimed level.
  // We'll simulate by checking the candidate's answers in the transcript for brevity (in reality, NLP).
  let technicalDepthWeak = false;
  let technicalDepthStrong = false;
  
  if (transcript && transcript.length > 0) {
    // Very basic keyword heuristic for the simulation
    const combinedAnswers = transcript.filter(t => t.speaker === 'CANDIDATE').map(t => t.text.toLowerCase()).join(" ");
    if (combinedAnswers.includes("train to go different places") || combinedAnswers.includes("too big for the computer") || combinedAnswers.includes("goes backwards") || combinedAnswers.includes("both forests")) {
      technicalDepthWeak = true;
    }
    if (combinedAnswers.includes("dictionary") || combinedAnswers.includes("fillna") || combinedAnswers.includes("iqr method")) {
      technicalDepthStrong = true;
    }
  }

  if (candidate.experience === "Advanced" || candidate.experience === "Expert") {
    if (technicalDepthWeak) {
      score += 25;
      subScores.technicalDepth -= 60;
      subScores.profileConsistency -= 40;
      reasons.push({
        title: "Technical depth inconsistency",
        description: `The claimed ${candidate.experience} expertise level is not fully supported by the interview answers.`
      });
      addTimelineEvent("00:05:00", "TECHNICAL MISMATCH", "danger", "Question answered with weak technical depth despite claiming expertise", 15);
    } else if (!technicalDepthStrong) {
      score += 10;
      subScores.technicalDepth -= 20;
    }
  } else if (candidate.experience === "Beginner" && technicalDepthStrong) {
    subScores.technicalDepth = 95; 
    addTimelineEvent("00:03:00", "STRONG ANSWER", "success", "Strong technical answers provided (exceeds claimed beginner level)");
  }

  // --- Rule 2: Scripting & External Assistance ---
  if (assistanceSignals) {
    if (assistanceSignals.overall === "MODERATE") {
      score += 15;
      subScores.assistanceSignal -= 40;
      reasons.push({
        title: "Possible external assistance",
        description: "Interview observations indicate a possible prompting pattern."
      });
      addTimelineEvent("00:08:00", "ASSISTANCE SIGNAL", "warning", "Possible prompting signal detected", 15);
    } else if (assistanceSignals.overall === "STRONG") {
      score += 25;
      subScores.assistanceSignal -= 80;
      reasons.push({
        title: "Strong external assistance signal",
        description: "Significant indicators of external prompting or scripted responses detected."
      });
      addTimelineEvent("00:11:00", "ASSISTANCE SIGNAL", "danger", "Strong prompting signal detected during responses", 25);
    }

    if (assistanceSignals.scriptedPattern) {
      score += 10;
      subScores.answerConsistency -= 30;
      if (!reasons.find(r => r.title.includes("assistance"))) {
         reasons.push({
           title: "Highly scripted responses",
           description: "Candidate answers appear highly rehearsed or read from a script."
         });
      }
    }
  }

  // --- Rule 3: Session Monitor Events (Focus lost) ---
  if (sessionEvents && sessionEvents.length > 0) {
    sessionEvents.forEach(event => {
      score += 10;
      subScores.observationSignal -= 10;
      addTimelineEvent(event.timestamp, event.type, "warning", event.description, 10);
    });
    reasons.push({
      title: "Session Integrity Alerts",
      description: `Detected ${sessionEvents.length} instance(s) of window focus loss or interruptions.`
    });
  }

  // --- Rule 4: Visual & AudioVideo Signals ---
  if (visualSignals) {
    if (visualSignals.status === "MODERATE SIGNAL") {
      score += 5;
      subScores.observationSignal -= 15;
      addTimelineEvent("00:04:00", "VISUAL SIGNAL", "warning", visualSignals.message, 5);
    }
  }

  if (audioVideoSignals && audioVideoSignals.status === "POTENTIAL ANOMALY") {
    score += 15;
    subScores.observationSignal -= 30;
    reasons.push({
      title: "Audio-visual anomaly",
      description: "Potential lip-sync mismatch or synchronization anomaly detected."
    });
    audioVideoSignals.anomalies.forEach(anomaly => {
      addTimelineEvent(anomaly.start, "A/V ANOMALY", "danger", anomaly.description, 12);
    });
  }

  // Cap score
  score = Math.min(100, score);
  addTimelineEvent("00:30:00", "ANALYSIS COMPLETE", "info", "Integrity risk calculated");

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

  // Sort timeline chronologically by timestamp string
  timeline.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  return {
    score,
    level,
    reasons,
    timeline,
    subScores,
    evidenceQuality: evidenceQuality || { overall: 100, message: "Standard" }
  };
}

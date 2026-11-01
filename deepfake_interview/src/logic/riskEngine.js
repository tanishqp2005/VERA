/**
 * Central VERA Risk Engine
 * Consumes modular interview signals to generate an explainable 0-100 integrity risk score,
 * risk level, specific reasons, subscores, and a unified evidence timeline.
 */

export function calculateRisk(analysisData = {}) {
  const {
    candidate = {},
    transcript = [],
    visualSignals = null,
    audioVideoSignals = null,
    assistanceSignals = null,
    sessionEvents = [],
    evidenceQuality = null
  } = analysisData;

  let score = 0;
  const reasons = [];
  const timeline = [];
  const subScores = {
    profileConsistency: 100,
    technicalDepth: 100,
    answerConsistency: 100,
    assistanceSignal: 100,
    observationSignal: 100
  };

  const addTimelineEvent = (timestamp, type, severity, description, riskContribution = 0) => {
    timeline.push({
      timestamp: timestamp || "00:00:00",
      type,
      severity, // 'info', 'warning', 'danger', 'success'
      description,
      riskContribution
    });
  };

  // 1. Initial Timeline Baseline
  const expClaim = candidate.experience || 'Not specified';
  addTimelineEvent(
    "00:00:00",
    "PROFILE INITIALIZED",
    "info",
    `Candidate profile loaded for ${candidate.name || 'Candidate'} claiming ${expClaim} level.`
  );

  // 2. Rule: Technical Depth & Profile Consistency (NLP & Keyword Analysis)
  const candidateAnswers = Array.isArray(transcript)
    ? transcript.filter(t => t.speaker === 'CANDIDATE')
    : [];

  const candidateText = candidateAnswers.map(t => t.text || '').join(' ').toLowerCase();
  const totalWords = candidateText.split(/\s+/).filter(Boolean).length;
  const avgWordsPerAnswer = candidateAnswers.length > 0 ? totalWords / candidateAnswers.length : 0;

  // Check declared skills against candidate responses
  const declaredSkills = Array.isArray(candidate.skills) ? candidate.skills : [];
  let skillsMentionedCount = 0;
  
  declaredSkills.forEach(skill => {
    if (skill && candidateText.includes(skill.toLowerCase())) {
      skillsMentionedCount++;
    }
  });

  const isSenior = candidate.experience === "Advanced" || candidate.experience === "Expert";
  const isBeginner = candidate.experience === "Beginner";

  if (candidateAnswers.length > 0) {
    if (isSenior) {
      // Expect substantive answers and demonstrated domain coverage
      const shallowCoverage = declaredSkills.length > 0 && (skillsMentionedCount / declaredSkills.length < 0.3);
      const overlyBrief = avgWordsPerAnswer < 15;

      if (overlyBrief || shallowCoverage) {
        score += 25;
        subScores.technicalDepth = Math.max(20, subScores.technicalDepth - 55);
        subScores.profileConsistency = Math.max(30, subScores.profileConsistency - 45);
        reasons.push({
          title: "Technical Depth Inconsistency",
          description: `Claimed ${candidate.experience} level in ${candidate.role || 'role'}, but answers lacked expected technical depth and domain vocabulary.`
        });
        const firstTimestamp = candidateAnswers[0]?.timestamp || "00:03:00";
        addTimelineEvent(firstTimestamp, "TECHNICAL MISMATCH", "danger", "Superficial technical depth observed relative to claimed seniority", 20);
      } else if (avgWordsPerAnswer >= 30) {
        subScores.technicalDepth = 95;
        addTimelineEvent("00:04:00", "TECHNICAL DEPTH VERIFIED", "success", "Substantive technical responses aligned with experience level");
      }
    } else if (isBeginner) {
      if (avgWordsPerAnswer >= 25 && skillsMentionedCount > 0) {
        subScores.technicalDepth = 98;
        addTimelineEvent("00:03:00", "STRONG ANSWER", "success", "Candidate answers clearly demonstrated core foundational knowledge");
      }
    }
  } else {
    // No transcript available
    subScores.profileConsistency -= 20;
    subScores.technicalDepth -= 20;
  }

  // 3. Rule: Scripting & External Assistance Signals
  if (assistanceSignals) {
    if (assistanceSignals.overall === "STRONG") {
      score += 25;
      subScores.assistanceSignal = Math.max(10, subScores.assistanceSignal - 70);
      reasons.push({
        title: "Strong External Assistance Signal",
        description: "Response latency patterns and delivery indicate candidate may be reading from a script or receiving external prompts."
      });
      addTimelineEvent("00:08:30", "ASSISTANCE SIGNAL", "danger", "Strong external prompting indicator detected during responses", 25);
    } else if (assistanceSignals.overall === "MODERATE") {
      score += 15;
      subScores.assistanceSignal = Math.max(40, subScores.assistanceSignal - 40);
      reasons.push({
        title: "Possible External Assistance",
        description: "Delivery cadence and pause characteristics suggest potential external prompting."
      });
      addTimelineEvent("00:07:15", "ASSISTANCE SIGNAL", "warning", "Unnatural response delivery pattern detected", 15);
    }

    if (assistanceSignals.scriptedPattern) {
      score += 10;
      subScores.answerConsistency = Math.max(30, subScores.answerConsistency - 35);
      if (!reasons.find(r => r.title.includes("Scripted") || r.title.includes("Assistance"))) {
        reasons.push({
          title: "Scripted Response Delivery",
          description: "Answers exhibit uniform textbook sentence structure and robotic delivery."
        });
      }
    }

    if (assistanceSignals.longPauses && assistanceSignals.longPauses >= 3) {
      score += 8;
      subScores.answerConsistency = Math.max(40, subScores.answerConsistency - 20);
      addTimelineEvent("00:09:00", "RESPONSE DELAY", "warning", `Multiple anomalous pauses (${assistanceSignals.longPauses}) detected prior to rapid answers`, 8);
    }
  }

  // 4. Rule: Session Monitor Events (Window focus loss, tab switching)
  if (Array.isArray(sessionEvents) && sessionEvents.length > 0) {
    let focusLostContribution = 0;
    sessionEvents.forEach((event, idx) => {
      const impact = event.type === "WINDOW FOCUS LOST" ? 12 : 8;
      focusLostContribution += impact;
      subScores.observationSignal = Math.max(10, subScores.observationSignal - 15);
      addTimelineEvent(
        event.timestamp || `00:0${idx + 2}:00`,
        event.type || "SESSION ALERT",
        "warning",
        event.description || "Interview window lost focus. Candidate switched applications or browser tabs.",
        impact
      );
    });

    score += Math.min(30, focusLostContribution);
    reasons.push({
      title: "Session Integrity Alerts",
      description: `Detected ${sessionEvents.length} instance(s) of window focus loss or browser tab switching during the interview.`
    });
  }

  // 5. Rule: Visual Signals (Camera focus & Eye Contact)
  if (visualSignals) {
    if (visualSignals.status === "MODERATE SIGNAL" || (visualSignals.awayFromCamera && visualSignals.awayFromCamera > 30)) {
      score += 10;
      subScores.observationSignal = Math.max(25, subScores.observationSignal - 25);
      reasons.push({
        title: "Gaze / Focus Abnormality",
        description: "Frequent periods of candidate looking away from the screen during question response phases."
      });
      addTimelineEvent("00:05:45", "VISUAL SIGNAL", "warning", visualSignals.message || "Frequent off-screen gaze detected", 10);
    }
  }

  // 6. Rule: Audio/Video Synchronization & Lip-Sync Integrity (Deepfake Heuristic)
  if (audioVideoSignals) {
    const isAnomalous = audioVideoSignals.status === "POTENTIAL ANOMALY" || 
                        (audioVideoSignals.consistency && audioVideoSignals.consistency < 70) ||
                        (Array.isArray(audioVideoSignals.anomalies) && audioVideoSignals.anomalies.length > 0);

    if (isAnomalous) {
      score += 20;
      subScores.observationSignal = Math.max(15, subScores.observationSignal - 40);
      reasons.push({
        title: "Audio-Visual Lip-Sync Mismatch",
        description: "Potential synchronization discrepancy observed between audio speech levels and mouth movement."
      });

      if (Array.isArray(audioVideoSignals.anomalies) && audioVideoSignals.anomalies.length > 0) {
        audioVideoSignals.anomalies.forEach((anomaly, aIdx) => {
          addTimelineEvent(
            anomaly.start || `00:1${aIdx}:00`,
            "A/V LIP-SYNC MISMATCH",
            "danger",
            anomaly.description || "Speech audio detected while mouth movement was dormant, or vice versa.",
            15
          );
        });
      } else {
        addTimelineEvent("00:12:00", "A/V LIP-SYNC MISMATCH", "danger", "Audio-video synchronization anomaly detected", 15);
      }
    }
  }

  // 7. Calculate Final Evidence Quality
  const calculatedEvidenceQuality = evidenceQuality || {
    video: visualSignals?.status !== 'UNAVAILABLE' ? 92 : 30,
    audio: 90,
    faceVisibility: visualSignals?.cameraFacing || 90,
    overall: visualSignals?.status !== 'UNAVAILABLE' ? 90 : 40,
    message: visualSignals?.status !== 'UNAVAILABLE' ? "Sufficient evidence collected for analysis." : "Limited visual evidence recorded."
  };

  // Cap score
  score = Math.min(100, Math.max(0, score));

  // Determine Level
  let level = "LOW RISK";
  if (score >= 60) level = "HIGH RISK";
  else if (score >= 30) level = "MEDIUM RISK";

  // Default clarification if clean
  if (reasons.length === 0) {
    if (score === 0) {
      addTimelineEvent("00:15:00", "SESSION COMPLETED", "success", "Interview concluded with zero anomalous signals detected.");
    }
  } else {
    addTimelineEvent("00:20:00", "ANALYSIS COMPLETE", "info", `VERA risk index calculated at ${score}/100.`);
  }

  // Sort timeline chronologically
  timeline.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  return {
    score,
    level,
    reasons,
    timeline,
    subScores,
    evidenceQuality: calculatedEvidenceQuality
  };
}

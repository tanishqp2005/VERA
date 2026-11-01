/**
 * Interview Storage & Management Service
 * Manages persistent interviews in browser localStorage.
 */

const STORAGE_KEY = 'vera_interviews_store';

/**
 * Get all stored interviews
 * @returns {Array} List of interview records
 */
export function getInterviews() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read interviews from storage:', err);
    return [];
  }
}

/**
 * Get a specific interview by candidate ID or interview ID
 * @param {string} id 
 * @returns {Object|null}
 */
export function getInterviewById(id) {
  const interviews = getInterviews();
  return interviews.find(i => i.id === id || i.candidate?.id === id) || null;
}

/**
 * Save or update an interview
 * @param {Object} interviewData 
 * @returns {Object} saved interview
 */
export function saveInterview(interviewData) {
  const interviews = getInterviews();
  const id = interviewData.id || interviewData.candidate?.id || `INT-${Date.now()}`;
  
  const record = {
    ...interviewData,
    id,
    updatedAt: new Date().toISOString()
  };

  const existingIndex = interviews.findIndex(i => i.id === id || i.candidate?.id === id);
  if (existingIndex >= 0) {
    interviews[existingIndex] = { ...interviews[existingIndex], ...record };
  } else {
    interviews.unshift(record);
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(interviews));
  } catch (err) {
    console.error('Failed to save interview to storage:', err);
  }

  return record;
}

/**
 * Delete an interview by ID
 * @param {string} id 
 */
export function deleteInterview(id) {
  const interviews = getInterviews();
  const filtered = interviews.filter(i => i.id !== id && i.candidate?.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('Failed to delete interview:', err);
  }
  return filtered;
}

/**
 * Compute aggregate statistics across all real interviews
 * @returns {Object} Dashboard metrics
 */
export function getDashboardStats() {
  const interviews = getInterviews();
  const total = interviews.length;
  const completed = interviews.filter(i => i.status === 'COMPLETED' || i.riskScore !== undefined).length;
  const flagged = interviews.filter(i => (i.riskScore || i.score || 0) >= 60).length;
  
  const completedWithScore = interviews.filter(i => typeof (i.riskScore || i.score) === 'number');
  const avgRisk = completedWithScore.length > 0
    ? Math.round(completedWithScore.reduce((acc, curr) => acc + (curr.riskScore || curr.score || 0), 0) / completedWithScore.length)
    : 0;

  return {
    total,
    active: total - completed,
    completed,
    flagged,
    avgRisk
  };
}


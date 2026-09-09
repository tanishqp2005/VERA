export const testCases = [
  {
    id: "normal",
    label: "Normal Interview",
    description: "Consistent answers with no significant anomalies.",
    candidate: {
      id: "CAND-1042",
      name: "Ananya Mehta",
      role: "Python Developer Intern",
      experience: "Beginner",
      skills: ["Python", "Pandas", "SQL"],
      summary: "Aspiring developer with foundational knowledge in data analysis and Python.",
      projects: "Student Library Management System",
      certifications: "Python for Beginners",
      interviewDate: "2023-10-15"
    },
    transcript: [
      { timestamp: "00:01:10", speaker: "INTERVIEWER", text: "What is a dictionary in Python?", id: "q1" },
      { timestamp: "00:01:15", speaker: "CANDIDATE", text: "It's a collection of key-value pairs that allows fast data retrieval.", id: "a1" },
      { timestamp: "00:03:22", speaker: "INTERVIEWER", text: "How do you handle missing data in Pandas?", id: "q2" },
      { timestamp: "00:03:28", speaker: "CANDIDATE", text: "You can use methods like fillna() to replace missing values or dropna() to remove those rows.", id: "a2" },
      { timestamp: "00:05:40", speaker: "INTERVIEWER", text: "What is a primary key in SQL?", id: "q3" },
      { timestamp: "00:05:45", speaker: "CANDIDATE", text: "It's a unique identifier for each record in a database table.", id: "a3" }
    ],
    visualSignals: {
      cameraFacing: 95,
      awayFromCamera: 5,
      status: "NORMAL",
      message: "Consistent eye contact maintained."
    },
    audioVideoSignals: {
      consistency: 98,
      status: "NORMAL",
      anomalies: []
    },
    assistanceSignals: {
      scriptedPattern: false,
      longPauses: 0,
      overall: "LOW"
    },
    sessionEvents: [],
    evidenceQuality: {
      video: 95,
      audio: 92,
      faceVisibility: 98,
      overall: 95,
      message: "High quality evidence."
    }
  },
  {
    id: "skill_mismatch",
    label: "Profile-Response Mismatch",
    description: "Claims advanced knowledge but fails basic concepts.",
    candidate: {
      id: "CAND-2819",
      name: "Rahul Shah",
      role: "Machine Learning Intern",
      experience: "Advanced",
      skills: ["Machine Learning", "Deep Learning", "TensorFlow", "Advanced Mathematics"],
      summary: "Expert ML researcher with extensive experience in neural networks.",
      projects: "Autonomous Vehicle Vision System",
      certifications: "Advanced Deep Learning Specialization",
      interviewDate: "2023-10-16"
    },
    transcript: [
      { timestamp: "00:02:14", speaker: "INTERVIEWER", text: "What is a train/test split?", id: "q1" },
      { timestamp: "00:02:20", speaker: "CANDIDATE", text: "It's when you split the train to go different places. Like on a track.", id: "a1" },
      { timestamp: "00:06:10", speaker: "INTERVIEWER", text: "Can you explain overfitting?", id: "q2" },
      { timestamp: "00:06:15", speaker: "CANDIDATE", text: "Overfitting means the model is too big for the computer.", id: "a2" },
      { timestamp: "00:10:05", speaker: "INTERVIEWER", text: "How do you evaluate a classification model?", id: "q3" },
      { timestamp: "00:10:12", speaker: "CANDIDATE", text: "I just look at it and see if it works. Sometimes I print the output.", id: "a3" }
    ],
    visualSignals: {
      cameraFacing: 90,
      awayFromCamera: 10,
      status: "NORMAL",
      message: "Normal eye contact."
    },
    audioVideoSignals: {
      consistency: 95,
      status: "NORMAL",
      anomalies: []
    },
    assistanceSignals: {
      scriptedPattern: false,
      longPauses: 1,
      overall: "LOW"
    },
    sessionEvents: [],
    evidenceQuality: {
      video: 90,
      audio: 88,
      faceVisibility: 95,
      overall: 91,
      message: "Clear audio and video."
    }
  },
  {
    id: "prompting",
    label: "External Assistance",
    description: "Scripted answers with window focus loss.",
    candidate: {
      id: "CAND-3912",
      name: "Kabir Patel",
      role: "Frontend Developer",
      experience: "Intermediate",
      skills: ["React", "JavaScript", "CSS"],
      summary: "Creative frontend developer building responsive web applications.",
      projects: "E-commerce Dashboard",
      certifications: "React Developer Certification",
      interviewDate: "2023-10-17"
    },
    transcript: [
      { timestamp: "00:04:10", speaker: "INTERVIEWER", text: "Explain the virtual DOM.", id: "q1" },
      { timestamp: "00:04:18", speaker: "CANDIDATE", text: "The Virtual DOM is a programming concept where an ideal, or virtual, representation of a UI is kept in memory and synced with the real DOM.", id: "a1" },
      { timestamp: "00:08:22", speaker: "INTERVIEWER", text: "What are React hooks?", id: "q2" },
      { timestamp: "00:08:29", speaker: "CANDIDATE", text: "Hooks are functions that let you hook into React state and lifecycle features from function components.", id: "a2" }
    ],
    visualSignals: {
      cameraFacing: 65,
      awayFromCamera: 35,
      status: "MODERATE SIGNAL",
      message: "Frequent camera-away periods detected. This is an observational signal requiring interviewer verification."
    },
    audioVideoSignals: {
      consistency: 96,
      status: "NORMAL",
      anomalies: []
    },
    assistanceSignals: {
      scriptedPattern: true,
      longPauses: 3,
      overall: "MODERATE"
    },
    sessionEvents: [
      { timestamp: "00:04:12", type: "WINDOW FOCUS LOST", duration: 4.2, description: "Interview window lost focus. Potential external assistance." },
      { timestamp: "00:08:24", type: "WINDOW FOCUS LOST", duration: 3.8, description: "Interview window lost focus. Potential external assistance." }
    ],
    evidenceQuality: {
      video: 92,
      audio: 95,
      faceVisibility: 88,
      overall: 91,
      message: "Good evidence quality."
    }
  },
  {
    id: "av_anomaly",
    label: "Deepfake-style A/V Anomaly",
    description: "Potential audio-video synchronization issues.",
    candidate: {
      id: "CAND-4109",
      name: "Sophia Lee",
      role: "Data Analyst",
      experience: "Intermediate",
      skills: ["SQL", "Tableau", "Data Visualization"],
      summary: "Data analyst with 3 years of experience in data modeling.",
      projects: "Sales Forecasting Dashboard",
      certifications: "Google Data Analytics",
      interviewDate: "2023-10-18"
    },
    transcript: [
      { timestamp: "00:14:20", speaker: "INTERVIEWER", text: "How do you handle outliers in a dataset?", id: "q1" },
      { timestamp: "00:14:25", speaker: "CANDIDATE", text: "I typically use the IQR method to detect them, and then depending on the context, I might cap them or remove them entirely.", id: "a1" },
      { timestamp: "00:18:10", speaker: "INTERVIEWER", text: "Explain a complex SQL join you wrote recently.", id: "q2" },
      { timestamp: "00:18:15", speaker: "CANDIDATE", text: "I used a full outer join combined with a cross join to generate a sparse matrix of user activities over time.", id: "a2" }
    ],
    visualSignals: {
      cameraFacing: 90,
      awayFromCamera: 10,
      status: "NORMAL",
      message: "Normal eye contact."
    },
    audioVideoSignals: {
      consistency: 58,
      status: "POTENTIAL ANOMALY",
      anomalies: [
        { start: "00:14:32", end: "00:14:39", description: "Potential audio-video synchronization anomaly." },
        { start: "00:18:16", end: "00:18:22", description: "Potential audio-video synchronization anomaly." }
      ]
    },
    assistanceSignals: {
      scriptedPattern: false,
      longPauses: 0,
      overall: "LOW"
    },
    sessionEvents: [],
    evidenceQuality: {
      video: 85,
      audio: 88,
      faceVisibility: 90,
      overall: 87,
      message: "Slight artifacts in video encoding."
    }
  },
  {
    id: "multiple_inconsistencies",
    label: "Multiple Simultaneous Anomalies",
    description: "High risk profile with multiple red flags (Demo Case).",
    candidate: {
      id: "CAND-5911",
      name: "Riya Desai",
      role: "Expert ML Engineer",
      experience: "Expert",
      skills: ["Machine Learning", "Python", "Cloud Architecture"],
      summary: "Senior ML engineer with 5 years experience building scalable AI solutions.",
      projects: "Enterprise AI Platform",
      certifications: "AWS ML Specialty",
      interviewDate: "2023-10-19"
    },
    transcript: [
      { timestamp: "00:05:10", speaker: "INTERVIEWER", text: "How do you deploy an ML model at scale?", id: "q1" },
      { timestamp: "00:05:22", speaker: "CANDIDATE", text: "You put it on a server and run it. Sometimes you use the cloud.", id: "a1" },
      { timestamp: "00:11:40", speaker: "INTERVIEWER", text: "What is the difference between random forest and gradient boosting?", id: "q2" },
      { timestamp: "00:11:51", speaker: "CANDIDATE", text: "They are both forests. One is random and one boosts.", id: "a2" },
      { timestamp: "00:16:15", speaker: "INTERVIEWER", text: "Explain the backpropagation algorithm.", id: "q3" },
      { timestamp: "00:16:26", speaker: "CANDIDATE", text: "It goes backwards to propagate the errors.", id: "a3" }
    ],
    visualSignals: {
      cameraFacing: 55,
      awayFromCamera: 45,
      status: "MODERATE SIGNAL",
      message: "Frequent camera-away periods detected. This is an observational signal requiring interviewer verification."
    },
    audioVideoSignals: {
      consistency: 62,
      status: "POTENTIAL ANOMALY",
      anomalies: [
        { start: "00:16:20", end: "00:16:30", description: "Potential audio-video synchronization anomaly." }
      ]
    },
    assistanceSignals: {
      scriptedPattern: true,
      longPauses: 5,
      overall: "STRONG"
    },
    sessionEvents: [
      { timestamp: "00:05:12", type: "WINDOW FOCUS LOST", duration: 8.4, description: "Interview window lost focus. Potential external assistance." },
      { timestamp: "00:11:42", type: "WINDOW FOCUS LOST", duration: 6.2, description: "Interview window lost focus. Potential external assistance." },
      { timestamp: "00:16:17", type: "WINDOW FOCUS LOST", duration: 7.1, description: "Interview window lost focus. Potential external assistance." }
    ],
    evidenceQuality: {
      video: 90,
      audio: 92,
      faceVisibility: 85,
      overall: 89,
      message: "Evidence is clear enough for analysis."
    }
  },
  {
    id: "poor_quality",
    label: "Insufficient Evidence (Poor Quality)",
    description: "Low confidence analysis due to bad camera/lighting.",
    candidate: {
      id: "CAND-6022",
      name: "Arjun Kumar",
      role: "Backend Engineer",
      experience: "Intermediate",
      skills: ["Java", "Spring Boot", "Microservices"],
      summary: "Backend developer focusing on robust microservices.",
      projects: "Payment Gateway Integration",
      certifications: "Oracle Certified Professional",
      interviewDate: "2023-10-20"
    },
    transcript: [
      { timestamp: "00:02:10", speaker: "INTERVIEWER", text: "How does Spring Boot auto-configuration work?", id: "q1" },
      { timestamp: "00:02:15", speaker: "CANDIDATE", text: "It attempts to automatically configure your Spring application based on the jar dependencies that you have added.", id: "a1" }
    ],
    visualSignals: {
      cameraFacing: 0,
      awayFromCamera: 0,
      status: "UNAVAILABLE",
      message: "Visual analysis unavailable because face visibility is insufficient."
    },
    audioVideoSignals: {
      consistency: 0,
      status: "UNAVAILABLE",
      anomalies: []
    },
    assistanceSignals: {
      scriptedPattern: false,
      longPauses: 0,
      overall: "LOW"
    },
    sessionEvents: [],
    evidenceQuality: {
      video: 30,
      audio: 85,
      faceVisibility: 10,
      overall: 41,
      message: "Visual analysis confidence reduced due to limited face visibility."
    }
  }
];

export const testCases = [
  {
    id: "normal",
    label: "Normal Candidate",
    description: "Low risk profile with consistent answers.",
    candidate: {
      name: "Ananya Mehta",
      role: "Python Developer Intern",
      experience: "Beginner",
      skills: ["Python", "Pandas", "SQL"],
      summary: "Aspiring developer with foundational knowledge in data analysis and Python.",
      projects: "Student Library Management System",
      certifications: "Python for Beginners"
    },
    interview: [
      { question: "What is a dictionary in Python?", answer: "It's a collection of key-value pairs that allows fast data retrieval." },
      { question: "How do you handle missing data in Pandas?", answer: "You can use methods like fillna() to replace missing values or dropna() to remove those rows." },
      { question: "What is a primary key in SQL?", answer: "It's a unique identifier for each record in a database table." }
    ],
    observations: {
      prompting: "None",
      consistency: "Consistent",
      responsePattern: "Natural",
      technicalConfidence: "Strong",
      lipSync: "Normal",
      eyeContact: "Normal"
    }
  },
  {
    id: "skill_mismatch",
    label: "Skill Mismatch",
    description: "Claims advanced knowledge but fails basic questions.",
    candidate: {
      name: "Rahul Shah",
      role: "Machine Learning Intern",
      experience: "Advanced",
      skills: ["Machine Learning", "Deep Learning", "TensorFlow", "Advanced Mathematics"],
      summary: "Expert ML researcher with extensive experience in neural networks.",
      projects: "Autonomous Vehicle Vision System",
      certifications: "Advanced Deep Learning Specialization"
    },
    interview: [
      { question: "What is a train/test split?", answer: "It's when you split the train to go different places." },
      { question: "Can you explain overfitting?", answer: "Overfitting means the model is too big for the computer." },
      { question: "How do you evaluate a classification model?", answer: "I just look at it and see if it works." }
    ],
    observations: {
      prompting: "None",
      consistency: "Highly inconsistent",
      responsePattern: "Natural",
      technicalConfidence: "Weak",
      lipSync: "Normal",
      eyeContact: "Normal"
    }
  },
  {
    id: "prompting",
    label: "Prompting Suspicion",
    description: "Answers are scripted, possible external assistance.",
    candidate: {
      name: "Kabir Patel",
      role: "Frontend Developer",
      experience: "Intermediate",
      skills: ["React", "JavaScript", "CSS"],
      summary: "Creative frontend developer building responsive web applications.",
      projects: "E-commerce Dashboard",
      certifications: "React Developer Certification"
    },
    interview: [
      { question: "Explain the virtual DOM.", answer: "The Virtual DOM is a programming concept where an ideal, or virtual, representation of a UI is kept in memory and synced with the real DOM." },
      { question: "What are React hooks?", answer: "Hooks are functions that let you hook into React state and lifecycle features from function components." },
      { question: "How does useEffect work?", answer: "The useEffect Hook allows you to perform side effects in your components. Some examples of side effects are: fetching data, directly updating the DOM, and timers." }
    ],
    observations: {
      prompting: "Possible",
      consistency: "Consistent",
      responsePattern: "Highly scripted",
      technicalConfidence: "Moderate",
      lipSync: "Normal",
      eyeContact: "Irregular"
    }
  },
  {
    id: "multiple_inconsistencies",
    label: "Multiple Inconsistencies",
    description: "High risk profile with multiple red flags (Demo Case).",
    candidate: {
      name: "Riya Desai",
      role: "Expert ML Engineer",
      experience: "Expert",
      skills: ["Machine Learning", "Python", "Cloud Architecture"],
      summary: "Senior ML engineer with 5 years experience building scalable AI solutions.",
      projects: "Enterprise AI Platform",
      certifications: "AWS ML Specialty"
    },
    interview: [
      { question: "How do you deploy an ML model at scale?", answer: "You put it on a server and run it." },
      { question: "What is the difference between random forest and gradient boosting?", answer: "They are both forests. One is random and one boosts." },
      { question: "Explain the backpropagation algorithm.", answer: "It goes backwards to propagate the errors." }
    ],
    observations: {
      prompting: "Strong",
      consistency: "Highly inconsistent",
      responsePattern: "Highly scripted",
      technicalConfidence: "Weak",
      lipSync: "Possible mismatch",
      eyeContact: "Irregular"
    }
  },
  {
    id: "edge_case",
    label: "Edge Case",
    description: "Underclaimed skills but strong interview (Harmless).",
    candidate: {
      name: "Arjun Kumar",
      role: "Junior Developer",
      experience: "Beginner",
      skills: ["Python", "HTML"],
      summary: "Just starting my coding journey. Learning basic programming concepts.",
      projects: "To-Do List App",
      certifications: "None"
    },
    interview: [
      { question: "What is a decorator in Python?", answer: "A decorator is a design pattern in Python that allows a user to add new functionality to an existing object without modifying its structure, usually implemented as a callable that takes another callable." },
      { question: "How do generators work?", answer: "Generators are iterators, a kind of iterable you can only iterate over once. They do not store all the values in memory, they generate the values on the fly using the yield keyword." },
      { question: "Explain time complexity of sorting.", answer: "Timsort, which Python uses natively, has a worst-case time complexity of O(n log n) and a best-case of O(n)." }
    ],
    observations: {
      prompting: "None",
      consistency: "Slightly inconsistent", /* because answer is much better than profile */
      responsePattern: "Natural",
      technicalConfidence: "Strong",
      lipSync: "Normal",
      eyeContact: "Normal"
    }
  }
];

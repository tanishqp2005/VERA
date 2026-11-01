# VERA - Virtual Interview Risk Analyzer

VERA is an AI-assisted interview integrity and authenticity verification platform designed to assist interviewers in identifying potential deception, deepfakes, external assistance (prompters, scripted answers, tab switching), and profile-response mismatches during remote virtual interviews.

## 🚀 Key Features

- **Real-Time Live Monitor**: In-browser computer vision with `@vladmandic/face-api` (expression classification, eye-contact stability) and Web Audio API frequency analysis for lip-sync integrity.
- **Session Focus Tracking**: Real-time detection of browser tab switching or window blur during virtual interviews.
- **Dynamic Risk Engine**: 0–100 composite risk score with explainable subscores (Profile Consistency, Technical Depth, Assistance Signals, Session Integrity).
- **Forensic Investigation Console**: Synchronized video playback with interactive anomaly scrubber and searchable transcript.
- **Skill Verification Matrix**: Dynamic analysis of claimed vs observed technical competence.
- **AI Follow-Up Probes**: Targeted questions to verify candidate depth in flagged areas.
- **Local Persistence**: Browser-local session storage for candidate baselines and interview results.

## 🛠 Tech Stack

- **Frontend**: React 19, React Router DOM 7
- **Tooling & Bundler**: Vite 8, Rolldown / Oxc
- **Computer Vision**: `@vladmandic/face-api`
- **Audio Processing**: Web Audio API
- **Icons & Styling**: Lucide React, Glassmorphism CSS design system
- **Linter**: Oxlint

## 📦 Getting Started

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

### Linting

```bash
npm run lint
```

## ⚖️ Ethics & Human-in-the-Loop Policy

VERA is strictly an interviewer-assistance tool. It surfaces anomalies and inconsistencies for human verification and does not make automated hiring or rejection decisions.

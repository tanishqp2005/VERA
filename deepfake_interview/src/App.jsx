import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import CreateInterview from './pages/CreateInterview';
import LiveInterview from './pages/LiveInterview';
import Analyze from './pages/Analyze';
import ReviewTestCase from './pages/ReviewTestCase';
import Results from './pages/Results';
import Investigation from './pages/Investigation';
import TestCases from './pages/TestCases';
import About from './pages/About';
import AlertManager from './components/AlertManager';
import './index.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <AlertManager />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create" element={<CreateInterview />} />
            <Route path="/live" element={<LiveInterview />} />
            <Route path="/review" element={<ReviewTestCase />} />
            <Route path="/analyze" element={<Analyze />} />
            <Route path="/results" element={<Results />} />
            <Route path="/investigation" element={<Investigation />} />
            <Route path="/test-cases" element={<TestCases />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

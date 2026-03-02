import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

/**
 * AppRoutes handles the navigation logic between the Login 
 * and the Editor Dashboard.
 */
function AppRoutes() {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    // Workflow: Grant access to editor dashboard [cite: 211]
    navigate('/dashboard');
  };

  return (
    <Routes>
      <Route path="/" element={<Login onLoginSuccess={handleLoginSuccess} />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}
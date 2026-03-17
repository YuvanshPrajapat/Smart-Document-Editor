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
    // Navigate to the editor workspace
    navigate('/dashboard');
  };

  const handleLogout = () => {
    // In the future, clear MongoDB session/JWT here
    console.log("Session cleared. Redirecting to login...");
    navigate('/');
  };

  return (
    <Routes>
      <Route path="/" element={<Login onLoginSuccess={handleLoginSuccess} />} />
      <Route 
        path="/dashboard" 
        element={<Dashboard onLogout={handleLogout} />} 
      />
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
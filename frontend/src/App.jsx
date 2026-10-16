import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; 
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard'; // Asol Dashboard import korlam

// Protected Route Component[cite: 1]
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <Router>
            <div className="min-h-screen font-sans">
                {/* Proper page routing[cite: 1] */}
                <Routes>
                    <Route path="/" element={<Navigate to="/login" />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } />
                </Routes>
                
                <Toaster position="top-right" />
            </div>
        </Router>
    );
}

export default App;
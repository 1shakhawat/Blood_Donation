import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; 
import Login from './pages/Login';
import Signup from './pages/Signup';


const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
};


const Dashboard = () => (
    <div className="p-10">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button className="btn btn-error mt-4" onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            window.location.href = '/login';
        }}>Logout</button>
    </div>
);

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-base-100">
                <Routes>
                    <Route path="/" element={<Navigate to="/login" />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    
                    {/* Protected Dashboard Route[cite: 1] */}
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } />
                </Routes>
                
                {/* Global Toaster Component */}
                <Toaster position="top-right" />
            </div>
        </Router>
    );
}

export default App;
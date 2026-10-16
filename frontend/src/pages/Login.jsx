import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('https://blood-donation-backend-b4go.onrender.com/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            
            if (res.ok) {
                // Save JWT token in localStorage[cite: 1]
                localStorage.setItem('token', data.token);
                localStorage.setItem('userRole', data.user.role);
                toast.success('Login successful!');
                navigate('/dashboard');
            } else {
                toast.error(data.message || 'Login failed');
            }
        } catch (err) {
            toast.error('Server error');
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-base-200">
            <div className="card w-96 bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title justify-center text-2xl font-bold">Login</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-control">
                            <label className="label"><span className="label-text">Email</span></label>
                            <input type="email" placeholder="email@example.com" className="input input-bordered" required 
                                onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="form-control">
                            <label className="label"><span className="label-text">Password</span></label>
                            <input type="password" placeholder="Password" className="input input-bordered" required 
                                onChange={(e) => setPassword(e.target.value)} />
                            <label className="label"><a href="#" className="label-text-alt link link-hover">Forgot password?</a></label>
                        </div>
                        <div className="form-control mt-6">
                            <button className="btn btn-primary">Login</button>
                        </div>
                    </form>
                    <p className="text-center mt-4">New here? <Link to="/signup" className="text-primary">Sign Up</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
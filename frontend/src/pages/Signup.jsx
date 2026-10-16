import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast'; // react-hot-toast diye success/error feedback

const Signup = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            
            if (res.ok) {
                toast.success('Signup successful! Please login.');
                navigate('/login');
            } else {
                toast.error(data.error || 'Signup failed');
            }
        } catch (err) {
            toast.error('Something went wrong!');
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-base-200">
            <div className="card w-96 bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title justify-center text-2xl font-bold">Sign Up</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-control">
                            <label className="label"><span className="label-text">Name</span></label>
                            <input type="text" placeholder="Your Name" className="input input-bordered" required 
                                onChange={(e) => setFormData({...formData, name: e.target.value})} />
                        </div>
                        <div className="form-control">
                            <label className="label"><span className="label-text">Email</span></label>
                            <input type="email" placeholder="email@example.com" className="input input-bordered" required 
                                onChange={(e) => setFormData({...formData, email: e.target.value})} />
                        </div>
                        <div className="form-control">
                            <label className="label"><span className="label-text">Password</span></label>
                            <input type="password" placeholder="Password" className="input input-bordered" required 
                                onChange={(e) => setFormData({...formData, password: e.target.value})} />
                        </div>
                        <div className="form-control mt-2">
                            <label className="label cursor-pointer">
                                <span className="label-text">Register as Admin?</span>
                                <input type="checkbox" className="checkbox" 
                                    onChange={(e) => setFormData({...formData, role: e.target.checked ? 'admin' : 'user'})} />
                            </label>
                        </div>
                        <div className="form-control mt-6">
                            <button className="btn btn-primary">Sign Up</button>
                        </div>
                    </form>
                    <p className="text-center mt-4">Already have an account? <Link to="/login" className="text-primary">Login</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
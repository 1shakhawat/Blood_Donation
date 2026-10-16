import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast'; 

const Dashboard = () => {
    const [requests, setRequests] = useState([]);
    const [search, setSearch] = useState('');
    const [group, setGroup] = useState('');
    const [page, setPage] = useState(1);
    
    
    const [formData, setFormData] = useState({ patient_name: '', blood_group: 'A+', location: '' });

    const navigate = useNavigate();
    const userRole = localStorage.getItem('userRole');

    useEffect(() => {
        fetchRequests();
    }, [search, group, page]);

    
    const fetchRequests = async () => {
        try {
            const res = await fetch(`https://blood-donation-backend-b4go.onrender.com/api/requests?search=${search}&group=${group}&page=${page}&limit=5`);
            const data = await res.json();
            setRequests(data);
        } catch (err) {
            toast.error("Failed to fetch data");
        }
    };


    const handleUpdate = async (id, status) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`https://blood-donation-backend-b4go.onrender.com/api/requests/${id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                toast.success("Status updated successfully!");
                fetchRequests();
            }
        } catch (err) {
            toast.error("Failed to update status");
        }
    };

    // Request Delete kora (Admin)[cite: 2]
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this request?")) return; // Confirmation modal
        
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`https://blood-donation-backend-b4go.onrender.com/api/requests/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success("Request deleted successfully!");
                fetchRequests();
            }
        } catch (err) {
            toast.error("Failed to delete");
        }
    };

    // Frontend theke notun data Create korar function[cite: 2]
    const handleCreate = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('https://blood-donation-backend-b4go.onrender.com/api/requests', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                toast.success("Blood Request created successfully!"); // success message[cite: 1]
                setFormData({ patient_name: '', blood_group: 'A+', location: '' }); // Form clear kora
                fetchRequests(); // Notun data dekhanor jonno list refresh kora
            } else {
                toast.error("Validation failed. Check inputs.");
            }
        } catch (err) {
            toast.error("Server error");
        }
    };

    // Logout handling[cite: 1]
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        toast.success("Logged out successfully");
        navigate('/login');
    };

    return (
        <div className="p-10 bg-base-200 min-h-screen">
            {/* Header section */}
            <div className="flex justify-between items-center mb-8 bg-base-100 p-5 rounded-xl shadow-md">
                <h1 className="text-3xl font-bold text-primary">Blood Donation Dashboard</h1>
                <div>
                    <span className="mr-4 font-bold text-gray-500">Role: {userRole}</span>
                    <button className="btn btn-error" onClick={handleLogout}>Logout</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Side: Create Form[cite: 2] */}
                <div className="bg-base-100 p-5 rounded-xl shadow-md col-span-1 h-fit">
                    <h2 className="text-xl font-bold mb-4">Request Blood</h2>
                    <form onSubmit={handleCreate}>
                        <div className="form-control mb-2">
                            <label className="label"><span className="label-text">Patient Name</span></label>
                            <input type="text" className="input input-bordered" required 
                                value={formData.patient_name} 
                                onChange={(e) => setFormData({...formData, patient_name: e.target.value})} />
                        </div>
                        <div className="form-control mb-2">
                            <label className="label"><span className="label-text">Blood Group</span></label>
                            <select className="select select-bordered" 
                                value={formData.blood_group} 
                                onChange={(e) => setFormData({...formData, blood_group: e.target.value})}>
                                <option>A+</option><option>A-</option>
                                <option>B+</option><option>B-</option>
                                <option>O+</option><option>O-</option>
                                <option>AB+</option><option>AB-</option>
                            </select>
                        </div>
                        <div className="form-control mb-4">
                            <label className="label"><span className="label-text">Location</span></label>
                            <input type="text" className="input input-bordered" required 
                                value={formData.location} 
                                onChange={(e) => setFormData({...formData, location: e.target.value})} />
                        </div>
                        <button className="btn btn-primary w-full">Submit Request</button>
                    </form>
                </div>

                {/* Right Side: Data Listing & Management[cite: 1] */}
                <div className="bg-base-100 p-5 rounded-xl shadow-md col-span-2">
                    {/* Search & Filter section[cite: 2] */}
                    <div className="flex flex-wrap gap-4 mb-4">
                        <input type="text" placeholder="Search by patient name..." className="input input-bordered w-full md:w-1/3" 
                            value={search} onChange={(e) => setSearch(e.target.value)} />
                        
                        <select className="select select-bordered" value={group} onChange={(e) => setGroup(e.target.value)}>
                            <option value="">All Blood Groups</option>
                            <option value="A+">A+</option><option value="B+">B+</option><option value="O+">O+</option>
                        </select>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="table w-full">
                             <thead>
                                 <tr>
                                     <th>ID</th>
                                     <th>Patient</th>
                                     <th>Group</th>
                                     <th>Location</th>
                                     <th>Status</th>
                                     {/* Admin er jonno notun header */}
                                     {userRole === 'admin' && <th>Actions</th>}
                                 </tr>
                             </thead>
                             <tbody>
                                 {requests.length > 0 ? (
                                     requests.map(req => (
                                         <tr key={req.id}>
                                             <td>{req.id}</td>
                                             <td>{req.patient_name}</td>
                                             <td><span className="badge badge-error text-white">{req.blood_group}</span></td>
                                             <td>{req.location}</td>
                                             <td>
                                                 <span className={`badge ${req.status === 'pending' ? 'badge-warning' : 'badge-success'}`}>
                                                     {req.status}
                                                 </span>
                                             </td>
                                             {/* Admin er jonno Action Button gulo (Approve, Reject, Delete) */}
                                             {userRole === 'admin' && (
                                                 <td>
                                                     <button onClick={() => handleUpdate(req.id, 'approved')} className="btn btn-xs btn-success mr-2 text-white">Approve</button>
                                                     <button onClick={() => handleUpdate(req.id, 'rejected')} className="btn btn-xs btn-warning mr-2 text-white">Reject</button>
                                                     <button onClick={() => handleDelete(req.id)} className="btn btn-xs btn-error text-white">Delete</button>
                                                 </td>
                                             )}
                                        </tr>
                                     ))
                                 ) : (
                                     <tr>
                                        
                                         <td colSpan={userRole === 'admin' ? "6" : "5"} className="text-center font-bold text-gray-500 py-4">
                                             No data found.
                                         </td>
                                     </tr>
                                 )}
                             </tbody>
                         </table>
                    </div>

                    
                    <div className="flex justify-between items-center mt-4">
                        <button className="btn btn-sm btn-outline" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
                        <span className="font-bold">Page {page}</span>
                        <button className="btn btn-sm btn-outline" disabled={requests.length < 5} onClick={() => setPage(page + 1)}>Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
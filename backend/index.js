// backend/index.js
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const db = require('./db');

const app = express();
app.use(express.json());
app.use(cors());

// Middleware for Route protection (Verify Token)[cite: 2]
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey123', (err, decoded) => {
        if (err) return res.status(403).json({ message: "Token expired or invalid" }); // token expiry handling[cite: 2]
        req.user = decoded;
        next();
    });
};

// Middleware for Admin-only routes[cite: 2]
const verifyAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: "Admin access required" });
    next();
};

// 1. SIGNUP ROUTE[cite: 2]
app.post('/api/auth/signup', async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10); // passwords hashed with bcrypt[cite: 2]
        db.run(`INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`, 
            [name, email, hashedPassword, role || 'user'], 
            function(err) {
                if (err) return res.status(400).json({ error: "Email already exists" });
                res.status(201).json({ message: "User created successfully" });
            }
        );
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. LOGIN ROUTE[cite: 2]
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
        if (err || !user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        // JWT-based login[cite: 2]
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'supersecretkey123', { expiresIn: '1h' });
        res.json({ message: "Login successful", token, user: { name: user.name, role: user.role } });
    });
});

const PORT = process.env.PORT || 5000;

// --- NIcher code gulo index.js e add korun (app.listen er upore) ---

// 3. CREATE: Notun Blood Request toiri kora (Protected Route)[cite: 2]
app.post('/api/requests', verifyToken, (req, res) => {
    const { patient_name, blood_group, location } = req.body;
    // Backend form validation[cite: 2]
    if (!patient_name || !blood_group || !location) {
        return res.status(400).json({ message: "All fields are required" });
    }

    db.run(`INSERT INTO requests (patient_name, blood_group, location) VALUES (?, ?, ?)`,
        [patient_name, blood_group, location],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: "Request created successfully", id: this.lastID });
        }
    );
});

// 4. READ (Extended Listing): Search, Filter, Sort o Pagination soho Data dekha[cite: 2]
app.get('/api/requests', (req, res) => {
    const { search, group, status, sort, page = 1, limit = 5 } = req.query; // Pagination with configurable page size[cite: 2]
    const offset = (page - 1) * limit;
    
    let query = `SELECT * FROM requests WHERE 1=1`;
    let queryParams = [];

    // Search by name[cite: 2]
    if (search) {
        query += ` AND patient_name LIKE ?`;
        queryParams.push(`%${search}%`);
    }
    // Filter by category/status[cite: 2]
    if (group) {
        query += ` AND blood_group = ?`;
        queryParams.push(group);
    }
    if (status) {
        query += ` AND status = ?`;
        queryParams.push(status);
    }

    // Sorting (newest first etc.)[cite: 2]
    if (sort === 'newest') query += ` ORDER BY created_at DESC`;
    else if (sort === 'oldest') query += ` ORDER BY created_at ASC`;
    else query += ` ORDER BY id DESC`;

    query += ` LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);

    db.all(query, queryParams, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 5. UPDATE: Status ba data update kora (Admin-only ba nijosso request hole)[cite: 2]
app.put('/api/requests/:id', verifyToken, verifyAdmin, (req, res) => {
    const { status } = req.body;
    db.run(`UPDATE requests SET status = ? WHERE id = ?`, [status, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Request updated successfully" });
    });
});

// 6. DELETE: Data delete kora (Admin-only route)[cite: 2]
app.delete('/api/requests/:id', verifyToken, verifyAdmin, (req, res) => {
    db.run(`DELETE FROM requests WHERE id = ?`, [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Request deleted successfully" });
    });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./blood_donation.db', (err) => {
    if (err) console.error(err.message);
    else console.log("Database Connected.");
});


db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        role TEXT DEFAULT 'user' 
    )`); 

    db.run(`CREATE TABLE IF NOT EXISTS requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_name TEXT,
        blood_group TEXT,
        location TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

module.exports = db;
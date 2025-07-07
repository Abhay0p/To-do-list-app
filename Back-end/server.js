// 
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // replace with your MySQL username
    password: '', // replace with your MySQL password
    database: 'todo_app'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// API Routes
// Get all tasks
app.get('/api/tasks', (req, res) => {
    db.query('SELECT * FROM tasks ORDER BY created_at DESC', (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Add a new task
app.post('/api/tasks', (req, res) => {
    const { title, description } = req.body;
    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    db.query(
        'INSERT INTO tasks (title, description) VALUES (?, ?)',
        [title, description],
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ id: results.insertId, title, description, completed: false });
        }
    );
});

// Update a task
app.put('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    const { title, description, completed } = req.body;

    db.query(
        'UPDATE tasks SET title = ?, description = ?, completed = ? WHERE id = ?',
        [title, description, completed, id],
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ error: 'Task not found' });
            }
            res.json({ id, title, description, completed });
        }
    );
});

// Delete a task
app.delete('/api/tasks/:id', (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM tasks WHERE id = ?', [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json({ message: 'Task deleted successfully' });
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

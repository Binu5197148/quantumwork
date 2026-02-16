const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { getDatabase, initDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '../')));
app.use('/admin', express.static(path.join(__dirname, '../admin')));

// Initialize database
initDatabase();

// ===== CANDIDATES API =====

// Create candidate
app.post('/api/candidates', (req, res) => {
  const { name, email, primary_skill, experience } = req.body;
  
  if (!name || !email || !primary_skill) {
    return res.status(400).json({ error: 'Name, email and primary_skill are required' });
  }

  const db = getDatabase();
  const sql = `INSERT INTO candidates (name, email, primary_skill, experience) VALUES (?, ?, ?, ?)`;
  
  db.run(sql, [name, email, primary_skill, experience || '0-1'], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ error: 'Email already registered' });
      }
      return res.status(500).json({ error: err.message });
    }
    
    res.status(201).json({
      id: this.lastID,
      name,
      email,
      primary_skill,
      experience: experience || '0-1',
      message: 'Candidate registered successfully'
    });
  });
});

// Get all candidates
app.get('/api/candidates', (req, res) => {
  const { search, skill, limit = 100 } = req.query;
  const db = getDatabase();
  
  let sql = `SELECT * FROM candidates WHERE 1=1`;
  const params = [];
  
  if (search) {
    sql += ` AND (name LIKE ? OR email LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`);
  }
  
  if (skill) {
    sql += ` AND primary_skill = ?`;
    params.push(skill);
  }
  
  sql += ` ORDER BY created_at DESC LIMIT ?`;
  params.push(parseInt(limit));
  
  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ candidates: rows, count: rows.length });
  });
});

// Get candidate by ID
app.get('/api/candidates/:id', (req, res) => {
  const db = getDatabase();
  const sql = `SELECT * FROM candidates WHERE id = ?`;
  
  db.get(sql, [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    res.json(row);
  });
});

// Update candidate
app.put('/api/candidates/:id', (req, res) => {
  const { name, email, primary_skill, experience } = req.body;
  const db = getDatabase();
  
  const sql = `UPDATE candidates SET name = ?, email = ?, primary_skill = ?, experience = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
  
  db.run(sql, [name, email, primary_skill, experience, req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    res.json({ message: 'Candidate updated successfully' });
  });
});

// Delete candidate
app.delete('/api/candidates/:id', (req, res) => {
  const db = getDatabase();
  const sql = `DELETE FROM candidates WHERE id = ?`;
  
  db.run(sql, [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    res.json({ message: 'Candidate deleted successfully' });
  });
});

// Get skills stats
app.get('/api/stats/skills', (req, res) => {
  const db = getDatabase();
  const sql = `SELECT primary_skill, COUNT(*) as count FROM candidates GROUP BY primary_skill ORDER BY count DESC`;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Export candidates to CSV
app.get('/api/candidates/export/csv', (req, res) => {
  const db = getDatabase();
  const sql = `SELECT * FROM candidates ORDER BY created_at DESC`;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    const headers = ['ID', 'Name', 'Email', 'Primary Skill', 'Experience', 'Created At'];
    const csvRows = [headers.join(',')];
    
    rows.forEach(row => {
      csvRows.push([
        row.id,
        `"${row.name}"`,
        row.email,
        `"${row.primary_skill}"`,
        row.experience,
        row.created_at
      ].join(','));
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=candidates.csv');
    res.send(csvRows.join('\n'));
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Quantum Work API running on http://localhost:${PORT}`);
  console.log(`📊 Admin panel: http://localhost:${PORT}/admin/`);
});

module.exports = app;

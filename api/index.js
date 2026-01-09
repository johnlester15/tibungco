const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// --- DATABASE CONNECTION (Cloud Ready) ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Required for Supabase
});

// --- 1. GENERAL & STATS ROUTES ---
// Do not serve HTML at root from API routes — let the frontend handle `/`.
// Provide a lightweight health endpoint for monitoring.
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/stats', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM residents');
    res.json({ totalResidents: parseInt(result.rows[0].count) });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch stats" });
  }
});

// --- 2. RESIDENT & AUTH ROUTES ---
app.post('/api/register', async (req, res) => {
  const { fullName, email, phone, password } = req.body;
  if (!fullName || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const exists = await pool.query('SELECT id FROM residents WHERE email = $1', [email]);
    if (exists.rows.length > 0) {
      return res.status(409).json({ error: 'This account is already registered.' });
    }
    const query = `INSERT INTO residents (full_name, email, phone, password) VALUES ($1,$2,$3,$4) RETURNING id, full_name, email`;
    const result = await pool.query(query, [fullName, email, phone || null, password]);
    res.status(201).json({ message: 'Registered successfully', user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const userResult = await pool.query("SELECT * FROM residents WHERE email = $1", [email]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "Account not found." });
    }
    const user = userResult.rows[0];
    if (user.password.trim() !== password.trim()) {
      return res.status(401).json({ error: "Invalid credentials." });
    }
    res.status(200).json({
      message: "Login successful",
      user: { id: user.id, fullName: user.full_name, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ error: "Server error during login." });
  }
});

// --- 3. ANNOUNCEMENT ROUTES ---
app.get('/api/announcements', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM announcements ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Could not fetch announcements" });
  }
});

app.post('/api/announcements', async (req, res) => {
  const { title, details, type, scheduled_date, author_name } = req.body;
  try {
    const query = `INSERT INTO announcements (title, details, type, scheduled_date, author_name) VALUES ($1, $2, $3, $4, $5) RETURNING *`;
    const result = await pool.query(query, [title, details, type, scheduled_date, author_name]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Could not save announcement" });
  }
});

app.delete('/api/announcements/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM announcements WHERE id = $1', [id]);
    res.status(200).json({ message: "Announcement deleted" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

// --- 4. DOCUMENT REQUEST ROUTES ---
app.post('/api/requests', async (req, res) => {
  const { resident_name, resident_email, document_type, purpose } = req.body;
  try {
    const query = `INSERT INTO document_requests (resident_name, resident_email, document_type, purpose, status) VALUES ($1, $2, $3, $4, 'Pending') RETURNING *`;
    const result = await pool.query(query, [resident_name, resident_email, document_type, purpose]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to submit document request" });
  }
});

app.get('/api/requests/admin/all', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM document_requests ORDER BY created_at DESC');
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch all requests" });
    }
});

app.patch('/api/requests/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
      await pool.query('UPDATE document_requests SET status = $1 WHERE id = $2', [status, id]);
      res.json({ message: "Status updated successfully" });
    } catch (err) {
      res.status(500).json({ error: "Failed to update status" });
    }
});

app.get('/api/requests/:email', async (req, res) => {
  const { email } = req.params;
  try {
    const result = await pool.query('SELECT * FROM document_requests WHERE resident_email = $1 ORDER BY created_at DESC', [email]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user requests" });
  }
});

// EXPORT FOR VERCEL
module.exports = app;
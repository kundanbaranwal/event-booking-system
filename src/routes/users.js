const express = require('express');
const pool = require('../db');

const router = express.Router();

// GET /users/:id/bookings - Retrieve all bookings made by a specific user
router.get('/:id/bookings', async (req, res) => {
  try {
    const userId = req.params.id;

    // Optional: Check if user exists
    const [users] = await pool.query('SELECT id FROM Users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const [bookings] = await pool.query(
      `SELECT b.id, b.event_id, e.title, e.date, b.booking_date, b.unique_code, b.tickets_booked
       FROM Bookings b
       JOIN Events e ON b.event_id = e.id
       WHERE b.user_id = ?
       ORDER BY b.booking_date DESC`,
      [userId]
    );

    res.json(bookings);
  } catch (err) {
    console.error('Error fetching user bookings:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper POST /users to create users for testing
router.post('/', async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const [result] = await pool.execute(
      'INSERT INTO Users (name, email) VALUES (?, ?)',
      [name, email]
    );
    res.status(201).json({ message: 'User created', userId: result.insertId });
  } catch (err) {
    console.error('Error creating user:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

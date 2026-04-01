const express = require("express");
const crypto = require("crypto");
const pool = require("../db");

const router = express.Router();

// POST /bookings - Book a ticket
router.post("/", async (req, res) => {
  let connection;
  try {
    let { user_id, event_id, tickets_to_book } = req.body;

    // Manual Input Validation
    if (!user_id || typeof user_id !== "number" || user_id <= 0) {
      return res
        .status(400)
        .json({ error: "User ID is required and must be a positive integer" });
    }
    if (!event_id || typeof event_id !== "number" || event_id <= 0) {
      return res
        .status(400)
        .json({ error: "Event ID is required and must be a positive integer" });
    }
    if (tickets_to_book === undefined) {
      tickets_to_book = 1;
    } else if (typeof tickets_to_book !== "number" || tickets_to_book <= 0) {
      return res
        .status(400)
        .json({ error: "Tickets to book must be a positive integer" });
    }

    connection = await pool.getConnection();

    // Start transaction
    await connection.beginTransaction();

    // Check if event exists and remaining tickets using FOR UPDATE to prevent race conditions
    const [events] = await connection.execute(
      `SELECT id, total_capacity, remaining_tickets FROM Events WHERE id = ? FOR UPDATE`,
      [event_id],
    );

    if (events.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Event not found" });
    }

    const event = events[0];

    if (event.remaining_tickets < tickets_to_book) {
      await connection.rollback();
      return res.status(400).json({ error: "Not enough tickets available" });
    }

    // Deduct remaining tickets
    await connection.execute(
      `UPDATE Events SET remaining_tickets = remaining_tickets - ? WHERE id = ?`,
      [tickets_to_book, event_id],
    );

    // Create booking code
    const unique_code = crypto.randomUUID();

    // Insert booking
    const [result] = await connection.execute(
      `INSERT INTO Bookings (user_id, event_id, unique_code, tickets_booked) VALUES (?, ?, ?, ?)`,
      [user_id, event_id, unique_code, tickets_to_book],
    );

    // Commit transaction
    await connection.commit();

    res.status(201).json({
      message: "Booking successful",
      booking_id: result.insertId,
      unique_code: unique_code,
      tickets_booked: tickets_to_book,
    });
  } catch (err) {
    if (connection) await connection.rollback();

    console.error("Error processing booking:", err);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;

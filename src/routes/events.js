const express = require("express");
const pool = require("../db");

const router = express.Router();

// GET /events - List all upcoming events
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM Events WHERE date > NOW() ORDER BY date ASC",
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /events - Create a new event
router.post("/", async (req, res) => {
  try {
    const { title, description, date, total_capacity } = req.body;

    // Manual Input Validation
    if (!title || typeof title !== "string") {
      return res.status(400).json({ error: "Title is required" });
    }
    if (!date || isNaN(new Date(date).getTime())) {
      return res.status(400).json({ error: "Invalid datetime format" });
    }
    if (
      !total_capacity ||
      typeof total_capacity !== "number" ||
      total_capacity <= 0
    ) {
      return res.status(400).json({ error: "Capacity must be greater than 0" });
    }

    const [result] = await pool.execute(
      `INSERT INTO Events (title, description, date, total_capacity, remaining_tickets) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        title,
        description || null,
        new Date(date),
        total_capacity,
        total_capacity,
      ],
    );

    res.status(201).json({
      message: "Event created successfully",
      eventId: result.insertId,
    });
  } catch (err) {
    console.error("Error creating event:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /events/:id/attendance - Takes the unique code, give how many tickets booked
router.post("/:id/attendance", async (req, res) => {
  try {
    const eventId = req.params.id;
    const { unique_code } = req.body;

    if (!unique_code || typeof unique_code !== "string") {
      return res.status(400).json({ error: "Unique code is required" });
    }

    // Verify booking
    const [bookings] = await pool.execute(
      `SELECT b.id, b.tickets_booked, b.event_id 
       FROM Bookings b 
       WHERE b.unique_code = ? AND b.event_id = ?`,
      [unique_code, eventId],
    );

    if (bookings.length === 0) {
      return res
        .status(404)
        .json({
          error: "Booking not found for this event with the provided code",
        });
    }

    const booking = bookings[0];

    // Check if already attended
    const [attendanceRows] = await pool.execute(
      "SELECT * FROM Event_Attendance WHERE booking_id = ?",
      [booking.id],
    );

    if (attendanceRows.length > 0) {
      return res
        .status(400)
        .json({ error: "Attendance already marked for this booking code" });
    }

    // Mark attendance
    await pool.execute("INSERT INTO Event_Attendance (booking_id) VALUES (?)", [
      booking.id,
    ]);

    res.status(200).json({
      message: "Attendance marked successfully",
      tickets_booked: booking.tickets_booked,
      booking_id: booking.id,
    });
  } catch (err) {
    console.error("Error marking attendance:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;

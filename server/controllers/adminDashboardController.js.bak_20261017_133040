const pool = require("../config/db");

async function getStats(req, res) {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*)::INTEGER AS total_bookings,

        COUNT(*) FILTER (
          WHERE status = 'pending'
        )::INTEGER AS pending_bookings,

        COUNT(*) FILTER (
          WHERE status = 'confirmed'
        )::INTEGER AS confirmed_bookings,

        COUNT(*) FILTER (
          WHERE status = 'completed'
        )::INTEGER AS completed_bookings,

        COUNT(*) FILTER (
          WHERE status = 'rescheduled'
        )::INTEGER AS rescheduled_bookings,

        COUNT(*) FILTER (
          WHERE status = 'cancelled'
        )::INTEGER AS cancelled_bookings

      FROM bookings
    `);

    const artistResult = await pool.query(`
      SELECT COUNT(*)::INTEGER AS total_artists
      FROM artists
      WHERE active = TRUE
    `);

    return res.json({
      success: true,

      stats: {
        totalBookings:
          result.rows[0].total_bookings,

        pendingBookings:
          result.rows[0].pending_bookings,

        confirmedBookings:
          result.rows[0].confirmed_bookings,

        completedBookings:
          result.rows[0].completed_bookings,

        rescheduledBookings:
          result.rows[0].rescheduled_bookings,

        cancelledBookings:
          result.rows[0].cancelled_bookings,

        totalArtists:
          artistResult.rows[0].total_artists
      }
    });
  } catch (error) {
    console.error(
      "Admin dashboard stats error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve dashboard statistics."
    });
  }
}

async function getRecentBookings(req, res) {
  try {
    const result = await pool.query(`
      SELECT
        b.id,
        b.booking_reference,
        b.artist_preference,
        b.tattoo_style,
        b.description,
        b.placement,
        b.tattoo_size,
        b.preferred_date,
        b.preferred_time,
        b.notes,
        b.status,
        b.admin_notes,
        b.created_at,
        b.updated_at,

        c.full_name,
        c.email,
        c.phone,

        a.name AS artist_name

      FROM bookings b

      INNER JOIN customers c
        ON c.id = b.customer_id

      LEFT JOIN artists a
        ON a.id = b.artist_id

      ORDER BY b.created_at DESC

      LIMIT 10
    `);

    return res.json({
      success: true,

      bookings: result.rows.map((booking) => ({
        id: booking.id,

        reference:
          booking.booking_reference,

        customer: {
          fullName:
            booking.full_name,

          email:
            booking.email,

          phone:
            booking.phone
        },

        artist:
          booking.artist_name,

        artistPreference:
          booking.artist_preference,

        style:
          booking.tattoo_style,

        description:
          booking.description,

        placement:
          booking.placement,

        size:
          booking.tattoo_size,

        preferredDate:
          booking.preferred_date,

        preferredTime:
          booking.preferred_time,

        notes:
          booking.notes,

        status:
          booking.status,

        adminNotes:
          booking.admin_notes,

        createdAt:
          booking.created_at,

        updatedAt:
          booking.updated_at
      }))
    });
  } catch (error) {
    console.error(
      "Admin recent bookings error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve recent bookings."
    });
  }
}

async function getBooking(req, res) {
  const bookingId = Number(req.params.id);

  if (
    !Number.isInteger(bookingId) ||
    bookingId <= 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid booking ID."
    });
  }

  try {
    const bookingResult = await pool.query(
      `
      SELECT
        b.id,
        b.booking_reference,
        b.artist_preference,
        b.tattoo_style,
        b.description,
        b.placement,
        b.tattoo_size,
        b.preferred_date,
        b.preferred_time,
        b.notes,
        b.status,
        b.admin_notes,
        b.created_at,
        b.updated_at,

        c.id AS customer_id,
        c.full_name,
        c.email,
        c.phone,

        a.id AS artist_id,
        a.name AS artist_name

      FROM bookings b

      INNER JOIN customers c
        ON c.id = b.customer_id

      LEFT JOIN artists a
        ON a.id = b.artist_id

      WHERE b.id = $1

      LIMIT 1
      `,
      [bookingId]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found."
      });
    }

    const booking =
      bookingResult.rows[0];

    const imagesResult = await pool.query(
      `
      SELECT
        id,
        original_name,
        stored_name,
        file_path,
        mime_type,
        file_size,
        created_at

      FROM booking_images

      WHERE booking_id = $1

      ORDER BY created_at ASC
      `,
      [bookingId]
    );

    return res.json({
      success: true,

      booking: {
        id: booking.id,

        reference:
          booking.booking_reference,

        customer: {
          id:
            booking.customer_id,

          fullName:
            booking.full_name,

          email:
            booking.email,

          phone:
            booking.phone
        },

        artist: {
          id:
            booking.artist_id,

          name:
            booking.artist_name
        },

        artistPreference:
          booking.artist_preference,

        style:
          booking.tattoo_style,

        description:
          booking.description,

        placement:
          booking.placement,

        size:
          booking.tattoo_size,

        preferredDate:
          booking.preferred_date,

        preferredTime:
          booking.preferred_time,

        notes:
          booking.notes,

        status:
          booking.status,

        adminNotes:
          booking.admin_notes,

        createdAt:
          booking.created_at,

        updatedAt:
          booking.updated_at,

        images:
          imagesResult.rows.map(
            (image) => ({
              id:
                image.id,

              originalName:
                image.original_name,

              storedName:
                image.stored_name,

              path:
                image.file_path,

              mimeType:
                image.mime_type,

              fileSize:
                image.file_size,

              createdAt:
                image.created_at
            })
          )
      }
    });
  } catch (error) {
    console.error(
      "Admin booking details error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve booking details."
    });
  }
}

async function updateBookingStatus(req, res) {
  const bookingId = Number(req.params.id);

  const {
    status,
    adminNotes
  } = req.body;

  const allowedStatuses = [
    "pending",
    "confirmed",
    "rescheduled",
    "completed",
    "cancelled"
  ];

  if (
    !Number.isInteger(bookingId) ||
    bookingId <= 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid booking ID."
    });
  }

  if (
    !status ||
    !allowedStatuses.includes(status)
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid booking status."
    });
  }

  try {
    const result = await pool.query(
      `
      UPDATE bookings

      SET
        status = $1,
        admin_notes = $2,
        updated_at = CURRENT_TIMESTAMP

      WHERE id = $3

      RETURNING
        id,
        booking_reference,
        status,
        admin_notes,
        updated_at
      `,
      [
        status,
        adminNotes?.trim() || null,
        bookingId
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found."
      });
    }

    const booking =
      result.rows[0];

    return res.json({
      success: true,
      message:
        "Booking updated successfully.",

      booking: {
        id:
          booking.id,

        reference:
          booking.booking_reference,

        status:
          booking.status,

        adminNotes:
          booking.admin_notes,

        updatedAt:
          booking.updated_at
      }
    });
  } catch (error) {
    console.error(
      "Admin booking update error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update booking."
    });
  }
}

module.exports = {
  getStats,
  getRecentBookings,
  getBooking,
  updateBookingStatus
};
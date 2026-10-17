const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const pool = require("../config/db");

function generateBookingReference() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto
    .randomBytes(3)
    .toString("hex")
    .toUpperCase();

  return `ST-${timestamp}-${random}`;
}

async function createBooking(req, res) {
  const {
    fullName,
    email,
    phone,
    artist,
    style,
    description,
    placement,
    size,
    preferredDate,
    preferredTime,
    notes
  } = req.body;

  if (
    !fullName ||
    !email ||
    !phone ||
    !artist ||
    !style ||
    !description ||
    !placement ||
    !size ||
    !preferredDate ||
    !preferredTime
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Please provide all required booking information."
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    /*
    |--------------------------------------------------------------------------
    | Find or create customer
    |--------------------------------------------------------------------------
    */

    let customerResult = await client.query(
      `
      SELECT id
      FROM customers
      WHERE email = $1
      LIMIT 1
      `,
      [email.trim().toLowerCase()]
    );

    let customerId;

    if (customerResult.rows.length > 0) {
      customerId = customerResult.rows[0].id;

      await client.query(
        `
        UPDATE customers
        SET
          full_name = $1,
          phone = $2,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        `,
        [
          fullName.trim(),
          phone.trim(),
          customerId
        ]
      );
    } else {
      const newCustomer = await client.query(
        `
        INSERT INTO customers
        (
          full_name,
          email,
          phone
        )
        VALUES
        (
          $1,
          $2,
          $3
        )
        RETURNING id
        `,
        [
          fullName.trim(),
          email.trim().toLowerCase(),
          phone.trim()
        ]
      );

      customerId = newCustomer.rows[0].id;
    }

    /*
    |--------------------------------------------------------------------------
    | Resolve artist
    |--------------------------------------------------------------------------
    */

    let artistId = null;

    if (
      artist &&
      artist.toLowerCase() !== "any artist"
    ) {
      const artistResult = await client.query(
        `
        SELECT id
        FROM artists
        WHERE name = $1
          AND active = TRUE
        LIMIT 1
        `,
        [artist.trim()]
      );

      if (artistResult.rows.length > 0) {
        artistId = artistResult.rows[0].id;
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Generate booking reference
    |--------------------------------------------------------------------------
    */

    let bookingReference;
    let referenceExists = true;

    while (referenceExists) {
      bookingReference =
        generateBookingReference();

      const referenceResult =
        await client.query(
          `
          SELECT id
          FROM bookings
          WHERE booking_reference = $1
          LIMIT 1
          `,
          [bookingReference]
        );

      referenceExists =
        referenceResult.rows.length > 0;
    }

    /*
    |--------------------------------------------------------------------------
    | Create booking
    |--------------------------------------------------------------------------
    */

    const bookingResult = await client.query(
      `
      INSERT INTO bookings
      (
        booking_reference,
        customer_id,
        artist_id,
        artist_preference,
        tattoo_style,
        description,
        placement,
        tattoo_size,
        preferred_date,
        preferred_time,
        notes
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11
      )
      RETURNING
        id,
        booking_reference,
        status,
        created_at
      `,
      [
        bookingReference,
        customerId,
        artistId,
        artist.trim(),
        style.trim(),
        description.trim(),
        placement.trim(),
        size.trim(),
        preferredDate,
        preferredTime,
        notes?.trim() || null
      ]
    );

    const booking =
      bookingResult.rows[0];

    /*
    |--------------------------------------------------------------------------
    | Save uploaded images
    |--------------------------------------------------------------------------
    */

    if (
      req.files &&
      req.files.length > 0
    ) {
      for (const file of req.files) {
        await client.query(
          `
          INSERT INTO booking_images
          (
            booking_id,
            original_name,
            stored_name,
            file_path,
            mime_type,
            file_size
          )
          VALUES
          (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6
          )
          `,
          [
            booking.id,
            file.originalname,
            file.filename,
            `/uploads/bookings/${file.filename}`,
            file.mimetype,
            file.size
          ]
        );
      }
    }

    await client.query("COMMIT");

    return res.status(201).json({
      success: true,
      message:
        "Booking request submitted successfully.",
      booking: {
        id: booking.id,
        reference:
          booking.booking_reference,
        status: booking.status,
        createdAt:
          booking.created_at
      }
    });
  } catch (error) {
    await client.query("ROLLBACK");

    /*
    |--------------------------------------------------------------------------
    | Remove uploaded files if database transaction fails
    |--------------------------------------------------------------------------
    */

    if (
      req.files &&
      req.files.length > 0
    ) {
      for (const file of req.files) {
        const filePath = path.join(
          __dirname,
          "..",
          "uploads",
          "bookings",
          file.filename
        );

        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (cleanupError) {
          console.error(
            "File cleanup failed:",
            cleanupError
          );
        }
      }
    }

    console.error(
      "Create booking error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to submit booking request."
    });
  } finally {
    client.release();
  }
}

module.exports = {
  createBooking
};
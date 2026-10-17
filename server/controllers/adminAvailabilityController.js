const pool = require("../config/db");

async function getAvailability(req, res) {
  try {
    const { artistId, date } = req.query;

    const conditions = [];
    const values = [];

    if (artistId) {
      values.push(Number(artistId));

      conditions.push(
        `av.artist_id = $${values.length}`
      );
    }

    if (date) {
      values.push(date);

      conditions.push(
        `av.available_date = $${values.length}`
      );
    }

    const whereClause =
      conditions.length
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

    const result = await pool.query(
      `
      SELECT
        av.id,
        av.artist_id,
        av.available_date,
        av.start_time,
        av.end_time,
        av.is_available,
        av.created_at,
        a.name AS artist_name
      FROM availability av
      LEFT JOIN artists a
        ON a.id = av.artist_id
      ${whereClause}
      ORDER BY
        av.available_date ASC,
        av.start_time ASC,
        av.id ASC
      `,
      values
    );

    return res.json({
      success: true,
      availability: result.rows.map(
        (item) => ({
          id: item.id,
          artistId: item.artist_id,
          artistName:
            item.artist_name ||
            "All Artists",
          date: item.available_date,
          startTime: item.start_time,
          endTime: item.end_time,
          isAvailable:
            item.is_available,
          createdAt:
            item.created_at
        })
      )
    });
  } catch (error) {
    console.error(
      "Get availability error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve availability."
    });
  }
}

async function createAvailability(req, res) {
  try {
    const {
      artistId,
      date,
      startTime,
      endTime,
      isAvailable = true
    } = req.body;

    if (
      !date ||
      !startTime ||
      !endTime
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Date, start time and end time are required."
      });
    }

    if (startTime >= endTime) {
      return res.status(400).json({
        success: false,
        message:
          "End time must be later than start time."
      });
    }

    if (artistId) {
      const artistResult =
        await pool.query(
          `
          SELECT id
          FROM artists
          WHERE id = $1
          AND active = TRUE
          `,
          [Number(artistId)]
        );

      if (artistResult.rowCount === 0) {
        return res.status(400).json({
          success: false,
          message:
            "Selected artist does not exist or is inactive."
        });
      }
    }

    const result = await pool.query(
      `
      INSERT INTO availability (
        artist_id,
        available_date,
        start_time,
        end_time,
        is_available
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        id,
        artist_id,
        available_date,
        start_time,
        end_time,
        is_available,
        created_at
      `,
      [
        artistId
          ? Number(artistId)
          : null,
        date,
        startTime,
        endTime,
        Boolean(isAvailable)
      ]
    );

    return res.status(201).json({
      success: true,
      message:
        "Availability created successfully.",
      availability:
        result.rows[0]
    });
  } catch (error) {
    console.error(
      "Create availability error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to create availability."
    });
  }
}

async function updateAvailability(req, res) {
  try {
    const { id } = req.params;

    const {
      artistId,
      date,
      startTime,
      endTime,
      isAvailable
    } = req.body;

    if (
      !date ||
      !startTime ||
      !endTime
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Date, start time and end time are required."
      });
    }

    if (startTime >= endTime) {
      return res.status(400).json({
        success: false,
        message:
          "End time must be later than start time."
      });
    }

    const result = await pool.query(
      `
      UPDATE availability
      SET
        artist_id = $1,
        available_date = $2,
        start_time = $3,
        end_time = $4,
        is_available = $5
      WHERE id = $6
      RETURNING
        id,
        artist_id,
        available_date,
        start_time,
        end_time,
        is_available,
        created_at
      `,
      [
        artistId
          ? Number(artistId)
          : null,
        date,
        startTime,
        endTime,
        Boolean(isAvailable),
        Number(id)
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Availability entry not found."
      });
    }

    return res.json({
      success: true,
      message:
        "Availability updated successfully.",
      availability:
        result.rows[0]
    });
  } catch (error) {
    console.error(
      "Update availability error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update availability."
    });
  }
}

async function deleteAvailability(req, res) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM availability
      WHERE id = $1
      RETURNING id
      `,
      [Number(id)]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Availability entry not found."
      });
    }

    return res.json({
      success: true,
      message:
        "Availability deleted successfully."
    });
  } catch (error) {
    console.error(
      "Delete availability error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to delete availability."
    });
  }
}

module.exports = {
  getAvailability,
  createAvailability,
  updateAvailability,
  deleteAvailability
};

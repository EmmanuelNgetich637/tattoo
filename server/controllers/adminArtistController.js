const pool = require("../config/db");

async function getArtists(req, res) {
  try {
    const result = await pool.query(`
      SELECT
        a.id,
        a.name,
        a.bio,
        a.active,
        a.created_at,
        a.updated_at,
        COALESCE(
          ARRAY_AGG(
            s.style_name
            ORDER BY s.style_name
          ) FILTER (WHERE s.style_name IS NOT NULL),
          '{}'
        ) AS styles
      FROM artists a
      LEFT JOIN artist_styles s
        ON s.artist_id = a.id
      GROUP BY
        a.id,
        a.name,
        a.bio,
        a.active,
        a.created_at,
        a.updated_at
      ORDER BY
        a.active DESC,
        a.name ASC
    `);

    return res.json({
      success: true,
      artists: result.rows
    });
  } catch (error) {
    console.error("Get artists error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve artists."
    });
  }
}

async function createArtist(req, res) {
  const client = await pool.connect();

  try {
    const {
      name,
      bio,
      styles = []
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Artist name is required."
      });
    }

    await client.query("BEGIN");

    const artistResult = await client.query(
      `
      INSERT INTO artists (
        name,
        bio
      )
      VALUES ($1, $2)
      RETURNING
        id,
        name,
        bio,
        active,
        created_at,
        updated_at
      `,
      [
        name.trim(),
        bio ? bio.trim() : null
      ]
    );

    const artist = artistResult.rows[0];

    if (Array.isArray(styles)) {
      for (const style of styles) {
        if (style && style.trim()) {
          await client.query(
            `
            INSERT INTO artist_styles (
              artist_id,
              style_name
            )
            VALUES ($1, $2)
            ON CONFLICT (
              artist_id,
              style_name
            )
            DO NOTHING
            `,
            [
              artist.id,
              style.trim()
            ]
          );
        }
      }
    }

    await client.query("COMMIT");

    return res.status(201).json({
      success: true,
      message: "Artist created successfully.",
      artist: {
        ...artist,
        styles: Array.isArray(styles)
          ? styles.filter(
              (style) =>
                style &&
                style.trim()
            )
          : []
      }
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error(
      "Create artist error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to create artist."
    });
  } finally {
    client.release();
  }
}

async function updateArtist(req, res) {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    const {
      name,
      bio,
      styles,
      active
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Artist name is required."
      });
    }

    await client.query("BEGIN");

    const artistResult = await client.query(
      `
      UPDATE artists
      SET
        name = $1,
        bio = $2,
        active = $3,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING
        id,
        name,
        bio,
        active,
        created_at,
        updated_at
      `,
      [
        name.trim(),
        bio ? bio.trim() : null,
        active !== undefined
          ? Boolean(active)
          : true,
        Number(id)
      ]
    );

    if (artistResult.rowCount === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        message: "Artist not found."
      });
    }

    if (Array.isArray(styles)) {
      await client.query(
        `
        DELETE FROM artist_styles
        WHERE artist_id = $1
        `,
        [Number(id)]
      );

      for (const style of styles) {
        if (style && style.trim()) {
          await client.query(
            `
            INSERT INTO artist_styles (
              artist_id,
              style_name
            )
            VALUES ($1, $2)
            ON CONFLICT (
              artist_id,
              style_name
            )
            DO NOTHING
            `,
            [
              Number(id),
              style.trim()
            ]
          );
        }
      }
    }

    await client.query("COMMIT");

    const stylesResult = await pool.query(
      `
      SELECT style_name
      FROM artist_styles
      WHERE artist_id = $1
      ORDER BY style_name
      `,
      [Number(id)]
    );

    return res.json({
      success: true,
      message: "Artist updated successfully.",
      artist: {
        ...artistResult.rows[0],
        styles:
          stylesResult.rows.map(
            (row) => row.style_name
          )
      }
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error(
      "Update artist error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to update artist."
    });
  } finally {
    client.release();
  }
}

async function deleteArtist(req, res) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      UPDATE artists
      SET
        active = FALSE,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id
      `,
      [Number(id)]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Artist not found."
      });
    }

    return res.json({
      success: true,
      message: "Artist deactivated successfully."
    });
  } catch (error) {
    console.error(
      "Delete artist error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to deactivate artist."
    });
  }
}

module.exports = {
  getArtists,
  createArtist,
  updateArtist,
  deleteArtist
};

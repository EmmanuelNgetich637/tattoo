const bcrypt = require("bcryptjs");

const pool = require("../config/db");

async function createAdmin() {
  const fullName = "SilvaTattoos Admin";
  const username = "admin";
  const email = "admin@silvatattoos.com";
  const password = "ChangeMe123!";

  try {
    const existing = await pool.query(
      `
      SELECT id
      FROM admin_users
      WHERE username = $1
      LIMIT 1
      `,
      [username]
    );

    if (existing.rows.length > 0) {
      console.log(
        `Admin "${username}" already exists.`
      );

      return;
    }

    const passwordHash =
      await bcrypt.hash(password, 12);

    const result = await pool.query(
      `
      INSERT INTO admin_users
      (
        full_name,
        username,
        email,
        password_hash,
        role
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4,
        $5
      )
      RETURNING
        id,
        full_name,
        username,
        email,
        role
      `,
      [
        fullName,
        username,
        email,
        passwordHash,
        "admin"
      ]
    );

    console.log(
      "Admin account created successfully:"
    );

    console.table(result.rows[0]);
  } catch (error) {
    console.error(
      "Failed to create admin:",
      error
    );
  } finally {
    await pool.end();
  }
}

createAdmin();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const pool = require("../config/db");

async function login(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Username and password are required."
    });
  }

  try {
    const result = await pool.query(
      `
      SELECT
        id,
        full_name,
        username,
        email,
        password_hash,
        role,
        active
      FROM admin_users
      WHERE username = $1
      LIMIT 1
      `,
      [username.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password."
      });
    }

    const admin = result.rows[0];

    if (!admin.active) {
      return res.status(403).json({
        success: false,
        message: "This admin account is inactive."
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      admin.password_hash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password."
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured.");

      return res.status(500).json({
        success: false,
        message: "Authentication service is not configured."
      });
    }

    const token = jwt.sign(
      {
        id: admin.id,
        username: admin.username,
        role: admin.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "8h"
      }
    );

    await pool.query(
      `
      UPDATE admin_users
      SET
        last_login = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      `,
      [admin.id]
    );

    return res.json({
      success: true,
      message: "Login successful.",
      token,
      admin: {
        id: admin.id,
        fullName: admin.full_name,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error("Admin login error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to process login."
    });
  }
}

async function me(req, res) {
  try {
    const result = await pool.query(
      `
      SELECT
        id,
        full_name,
        username,
        email,
        role,
        active,
        last_login
      FROM admin_users
      WHERE id = $1
      LIMIT 1
      `,
      [req.admin.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Admin account not found."
      });
    }

    const admin = result.rows[0];

    if (!admin.active) {
      return res.status(403).json({
        success: false,
        message: "This admin account is inactive."
      });
    }

    return res.json({
      success: true,
      admin: {
        id: admin.id,
        fullName: admin.full_name,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        lastLogin: admin.last_login
      }
    });
  } catch (error) {
    console.error("Admin profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve admin profile."
    });
  }
}

module.exports = {
  login,
  me
};
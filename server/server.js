const express = require("express");
const cors = require("cors");
const path = require("path");

require("dotenv").config();

const adminAuthRoutes = require(
  "./routes/adminAuthRoutes"
);

const adminDashboardRoutes = require(
  "./routes/adminDashboardRoutes"
);

const adminArtistRoutes = require(
  "./routes/adminArtistRoutes"
);

const adminAvailabilityRoutes = require(
  "./routes/adminAvailabilityRoutes"
);

const pool = require("./config/db");

const bookingRoutes = require(
  "./routes/bookingRoutes"
);

const app = express();

const PORT = process.env.PORT || 5000;


/*
|--------------------------------------------------------------------------
| Middleware
|--------------------------------------------------------------------------
*/

app.use(
  cors({
    origin: true,
    credentials: true
  })
);

app.use(
  express.json({
    limit: "2mb"
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "2mb"
  })
);


/*
|--------------------------------------------------------------------------
| Static uploads
|--------------------------------------------------------------------------
*/

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);


/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Public Booking Routes
|--------------------------------------------------------------------------
*/

app.use(
  "/api/bookings",
  bookingRoutes
);


/*
|--------------------------------------------------------------------------
| Admin Authentication
|--------------------------------------------------------------------------
*/

app.use(
  "/api/admin/auth",
  adminAuthRoutes
);


/*
|--------------------------------------------------------------------------
| Admin Dashboard
|--------------------------------------------------------------------------
*/

app.use(
  "/api/admin/dashboard",
  adminDashboardRoutes
);


/*
|--------------------------------------------------------------------------
| Admin Artists
|--------------------------------------------------------------------------
*/

app.use(
  "/api/admin/artists",
  adminArtistRoutes
);


/*
|--------------------------------------------------------------------------
| Admin Availability
|--------------------------------------------------------------------------
*/

app.use(
  "/api/admin/availability",
  adminAvailabilityRoutes
);


/*
|--------------------------------------------------------------------------
| Root route
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to SilvaTattoos API"
  });
});


/*
|--------------------------------------------------------------------------
| Health check
|--------------------------------------------------------------------------
*/

app.get(
  "/api/health",
  async (req, res) => {
    try {
      const result =
        await pool.query(
          "SELECT NOW() AS current_time"
        );

      res.json({
        success: true,
        message:
          "SilvaTattoos API is running",
        database: true,
        databaseTime:
          result.rows[0].current_time
      });
    } catch (error) {
      console.error(
        "Database health check failed:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "API is running but database connection failed",
        database: false
      });
    }
  }
);


/*
|--------------------------------------------------------------------------
| 404
|--------------------------------------------------------------------------
*/

app.use(
  (req, res) => {
    res.status(404).json({
      success: false,
      message: "Route not found"
    });
  }
);


/*
|--------------------------------------------------------------------------
| Error handler
|--------------------------------------------------------------------------
*/

app.use(
  (error, req, res, next) => {
    console.error(error);

    res.status(
      error.status || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Internal server error"
    });
  }
);


/*
|--------------------------------------------------------------------------
| Start server
|--------------------------------------------------------------------------
*/

app.listen(
  PORT,
  () => {
    console.log(
      `SilvaTattoos API running on port ${PORT}`
    );
  }
);
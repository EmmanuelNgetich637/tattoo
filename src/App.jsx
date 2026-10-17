import {
  BrowserRouter,
  Routes,
  Route,
  Link,
} from "react-router-dom";

import { useState } from "react";

import {
  ArrowUpRight,
} from "lucide-react";

import Booking from "./pages/Booking";
import TattooDetails from "./pages/TattooDetails";
import ArtistDetails from "./pages/ArtistDetails";
import NotFound from "./pages/NotFound";

import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./components/AdminLayout";
import AdminBookingDetails from "./pages/AdminBookingDetails";
import AdminAvailability from "./pages/AdminAvailability";
import AdminBookings from "./pages/AdminBookings";
import AdminArtists from "./pages/AdminArtists";

import ScrollToTop from "./components/ScrollToTop";
import Navbar from "./components/Navbar";

import TattooCard from "./components/TattooCard";
import TattooFilter from "./components/TattooFilter";
import ArtistCard from "./components/ArtistCard";

import {
  tattoos,
  tattooCategories,
} from "./data/tattooData";

import {
  artists,
} from "./data/artistData";


function Home() {
  const [
    activeCategory,
    setActiveCategory,
  ] = useState("All");


  const filteredTattoos =
    activeCategory === "All"
      ? tattoos
      : tattoos.filter(
          (tattoo) =>
            tattoo.category ===
            activeCategory
        );


  const handleWorkClick = (event) => {
    event.preventDefault();

    const element =
      document.getElementById("work");

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };


  return (
    <main className="site">

      <Navbar />


      {/* =========================
          HERO
      ========================= */}

      <section className="hero">

        <div className="hero-content">

          <p className="eyebrow">
            Tattoo Studio
          </p>


          <h1>
            YOUR STORY.
            <br />

            <span>
              PERMANENTLY.
            </span>
          </h1>


          <p className="hero-description">
            Custom tattoos created with
            intention, precision, and a
            respect for the art of putting
            something meaningful on your skin.
          </p>


          <div className="hero-actions">

            <Link
              to="/booking"
              className="primary-button"
            >
              Book a session

              <ArrowUpRight
                size={20}
              />
            </Link>


            <a
              href="#work"
              className="secondary-button"
              onClick={handleWorkClick}
            >
              Explore our work
            </a>

          </div>

        </div>

      </section>


      {/* =========================
          INTRO
      ========================= */}

      <section className="intro">

        <p className="section-label">
          The studio
        </p>


        <h2>
          Tattoos that mean

          <span>
            {" "}something.
          </span>
        </h2>


        <p>
          Every piece starts with an idea.
          We work with you to turn that idea
          into something personal, lasting,
          and uniquely yours.
        </p>

      </section>


      {/* =========================
          PORTFOLIO
      ========================= */}

      <section
        id="work"
        className="work-section"
      >

        <div className="section-heading choose-heading">
          <div className="choose-heading-copy">
            <p className="section-label">THE SILVATATTOOS COLLECTION</p>
            <h2>
              Choose your
              <br />
              <span>next tattoo.</span>
            </h2>
            <p className="choose-description">
              Find a design that speaks to you. Explore different
              styles, discover your inspiration, and make it your own.
            </p>
          </div>

          <div className="choose-index">
            <span className="choose-index-number">
              {String(filteredTattoos.length).padStart(2, "0")}
            </span>
            <span className="choose-index-label">
              DESIGNS<br />AVAILABLE
            </span>
          </div>
        </div>

        <div className="collection-toolbar">
          <span className="collection-toolbar-label">✳ FIND YOUR STYLE</span>
          <span className="collection-count">
            {filteredTattoos.length} designs
          </span>
        </div>


        <TattooFilter
          categories={tattooCategories}
          activeCategory={activeCategory}
          onCategoryChange={
            setActiveCategory
          }
        />


        <div className="tattoo-gallery">

          {filteredTattoos.map(
            (
              tattoo,
              index
            ) => (

              <TattooCard
                key={tattoo.id}
                tattoo={tattoo}
                large={
                  index === 0
                }
              />

            )
          )}

        </div>

      </section>


      {/* =========================
          ARTISTS
      ========================= */}

      <section
        id="artists"
        className="artists-section"
      >

        <div className="section-heading-row">

          <div>

            <p className="section-label">
              The artists
            </p>


            <h2>
              People behind

              <span>
                {" "}the ink.
              </span>
            </h2>

          </div>


          <p className="section-heading-description">
            Independent artists, individual
            styles, one commitment to creating
            work that feels personal and
            permanent.
          </p>

        </div>


        <div className="artists-grid">

          {artists.map(
            (artist) => (

              <ArtistCard
                key={artist.id}
                artist={artist}
              />

            )
          )}

        </div>

      </section>


      {/* =========================
          ABOUT
      ========================= */}

      <section
        id="about"
        className="about-section"
      >

        <div>

          <p className="section-label">
            Our approach
          </p>


          <h2>
            Good tattoos
            <br />

            take

            <span>
              {" "}time.
            </span>
          </h2>

        </div>


        <div className="about-copy">

          <p>
            We believe the best tattoos
            aren't rushed. From the first
            consultation to the final line,
            every detail matters.
          </p>


          <p>
            Tell us what you're imagining,
            bring your references, and we'll
            work together to create something
            that belongs on you.
          </p>

        </div>

      </section>


      {/* =========================
          BOOKING CTA
      ========================= */}

      <section className="booking-section">

        <p className="section-label">
          Ready?
        </p>


        <h2>
          LET'S MAKE
          <br />

          SOMETHING

          <span>
            {" "}PERMANENT.
          </span>
        </h2>


        <Link
          to="/booking"
          className="primary-button large"
        >
          Start your booking

          <ArrowUpRight
            size={22}
          />
        </Link>

      </section>


      {/* =========================
          FOOTER
      ========================= */}

      <footer className="footer">

        <div className="footer-logo">
          SilvaTattoos
        </div>


        <div>
          <p>
            Custom tattoo studio
          </p>
        </div>


        <p className="copyright">
          © 2026 SilvaTattoos.
          All rights reserved.
        </p>

      </footer>

    </main>
  );
}


function App() {
  return (
    <BrowserRouter>

      <ScrollToTop />

      <Routes>

        {/* =========================
            PUBLIC HOME
        ========================= */}

        <Route
          path="/"
          element={<Home />}
        />


        {/* =========================
            TATTOO DETAILS
        ========================= */}

        <Route
          path="/work/:id"
          element={
            <>
              <Navbar />
              <TattooDetails />
            </>
          }
        />


        {/* =========================
            ARTIST DETAILS
        ========================= */}

        <Route
          path="/artists/:id"
          element={
            <>
              <Navbar />
              <ArtistDetails />
            </>
          }
        />


        {/* =========================
            BOOKING
        ========================= */}

        <Route
          path="/booking"
          element={<Booking />}
        />


        {/* =========================
            ADMIN LOGIN
        ========================= */}

        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />


        {/* =========================
            ADMIN DASHBOARD
        ========================= */}

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </AdminRoute>
          }
        />


        {/* =========================
            ADMIN BOOKINGS
        ========================= */}

        <Route
          path="/admin/bookings"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminBookings />
              </AdminLayout>
            </AdminRoute>
          }
        />


        {/* =========================
            ADMIN BOOKING DETAILS
        ========================= */}

        <Route
          path="/admin/bookings/:id"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminBookingDetails />
              </AdminLayout>
            </AdminRoute>
          }
        />


        {/* =========================
            ADMIN ARTISTS
        ========================= */}

        <Route
          path="/admin/artists"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminArtists />
              </AdminLayout>
            </AdminRoute>
          }
        />


        {/* =========================
            ADMIN AVAILABILITY
        ========================= */}

        <Route
          path="/admin/availability"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminAvailability />
              </AdminLayout>
            </AdminRoute>
          }
        />


        {/* =========================
            404
        ========================= */}

        <Route
          path="*"
          element={
            <>
              <Navbar />
              <NotFound />
            </>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}


export default App;
import {
  useEffect,
  useState
} from "react";

import {
  Link,
  useLocation
} from "react-router-dom";

import {
  Menu,
  X,
  ArrowUpRight
} from "lucide-react";

function Navbar() {
  const [
    menuOpen,
    setMenuOpen
  ] = useState(false);

  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add(
        "menu-open"
      );
    } else {
      document.body.classList.remove(
        "menu-open"
      );
    }

    return () => {
      document.body.classList.remove(
        "menu-open"
      );
    };
  }, [menuOpen]);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleSectionClick = (
    event,
    section
  ) => {
    event.preventDefault();

    closeMenu();

    if (location.pathname !== "/") {
      window.location.href = `/#${section}`;
      return;
    }

    const element =
      document.getElementById(section);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  };

  return (
    <header
      className={
        menuOpen
          ? "navbar menu-active"
          : "navbar"
      }
    >
      <Link
        to="/"
        className="logo"
        onClick={closeMenu}
      >
        SilvaTattoos
      </Link>

      <nav
        className={
          menuOpen
            ? "nav-links open"
            : "nav-links"
        }
      >
        <div className="mobile-nav-label">
          <span>Navigation</span>
        </div>

        <a
          href="/#work"
          onClick={(event) =>
            handleSectionClick(
              event,
              "work"
            )
          }
        >
          <span>01</span>
          Work
        </a>

        <a
          href="/#artists"
          onClick={(event) =>
            handleSectionClick(
              event,
              "artists"
            )
          }
        >
          <span>02</span>
          Artists
        </a>

        <a
          href="/#about"
          onClick={(event) =>
            handleSectionClick(
              event,
              "about"
            )
          }
        >
          <span>03</span>
          About
        </a>

        <Link
          to="/booking"
          onClick={closeMenu}
        >
          <span>04</span>
          Book
        </Link>

        <div className="mobile-nav-footer">
          <p>
            Your story.
            <br />
            Permanently.
          </p>

          <span>
            SilvaTattoos © 2026
          </span>
        </div>
      </nav>

      <div className="navbar-actions">
        <Link
          to="/booking"
          className="navbar-book"
        >
          Book
          <ArrowUpRight size={16} />
        </Link>

        <button
          type="button"
          className="menu-button"
          onClick={() =>
            setMenuOpen(
              (current) => !current
            )
          }
          aria-label={
            menuOpen
              ? "Close navigation"
              : "Open navigation"
          }
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            <X size={24} />
          ) : (
            <Menu size={24} />
          )}
        </button>
      </div>
    </header>
  );
}

export default Navbar;

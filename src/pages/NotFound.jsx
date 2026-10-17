import {
  ArrowLeft,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";


function NotFound() {

  return (

    <main className="detail-page">

      <section className="not-found-page">

        <p className="section-label">
          404
        </p>


        <h1>
          PAGE NOT
          <br />
          <span>
            FOUND.
          </span>
        </h1>


        <p>
          The page you're looking for
          doesn't exist or may have
          been moved.
        </p>


        <Link
          to="/"
          className="primary-button"
        >

          <ArrowLeft size={18} />

          Back to home

        </Link>

      </section>


      <footer className="detail-footer">

        <div className="footer-logo">
          SilvaTattoos
        </div>


        <p>
          © 2026 SilvaTattoos.
          All rights reserved.
        </p>

      </footer>

    </main>

  );
}


export default NotFound;
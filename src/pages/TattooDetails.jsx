import {
  ArrowLeft,
  ArrowUpRight,
} from "lucide-react";

import {
  Link,
  useParams,
} from "react-router-dom";

import { tattoos } from "../data/tattooData";


function TattooDetails() {

  const { id } = useParams();


  const tattoo = tattoos.find(
    (item) => item.id === Number(id)
  );


  /*
   * Invalid tattoo
   */

  if (!tattoo) {

    return (

      <main className="detail-page">

        <div className="detail-not-found">

          <p className="section-label">
            404
          </p>


          <h1>
            TATTOO NOT
            <br />
            <span>
              FOUND.
            </span>
          </h1>


          <Link
            to="/#work"
            className="primary-button"
          >

            <ArrowLeft size={18} />

            Back to work

          </Link>

        </div>

      </main>

    );
  }


  return (

    <main className="detail-page">


      {/* =========================
          BACK
      ========================= */}

      <div className="detail-back">

        <Link to="/#work">

          <ArrowLeft size={18} />

          Back to work

        </Link>

      </div>


      {/* =========================
          MAIN CONTENT
      ========================= */}

      <section className="detail-content">


        {/* IMAGE */}

        <div className="detail-image">

          {tattoo.image ? (

            <img
              src={tattoo.image}
              alt={`${tattoo.title} tattoo`}
              className="detail-tattoo-image"
            />

          ) : (

            <div className="detail-image-placeholder">

              <span>
                {String(
                  tattoo.id
                ).padStart(2, "0")}
              </span>

            </div>

          )}

        </div>


        {/* INFORMATION */}

        <div className="detail-info">

          <p className="section-label">
            {tattoo.category}
          </p>


          <h1>
            {tattoo.title}
          </h1>


          <p className="detail-description">
            {tattoo.description}
          </p>


          <div className="detail-meta">


            <div>

              <span>
                Style
              </span>

              <strong>
                {tattoo.style}
              </strong>

            </div>


            <div>

              <span>
                Artist
              </span>

              <strong>
                {tattoo.artist}
              </strong>

            </div>


          </div>


          <Link
            to="/booking"
            className="primary-button detail-button"
          >

            Book a similar piece

            <ArrowUpRight
              size={20}
            />

          </Link>

        </div>

      </section>


      {/* =========================
          FOOTER
      ========================= */}

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


export default TattooDetails;
import {
  ArrowLeft,
  ArrowUpRight,
} from "lucide-react";

import {
  Link,
  useParams,
} from "react-router-dom";

import { artists } from "../data/artistData";
import { tattoos } from "../data/tattooData";


function ArtistDetails() {

  const { id } = useParams();


  const artist = artists.find(
    (item) => item.id === Number(id)
  );


  if (!artist) {

    return (

      <main className="detail-page">

        <div className="detail-not-found">

          <p className="section-label">
            404
          </p>


          <h1>
            ARTIST NOT
            <br />
            <span>
              FOUND.
            </span>
          </h1>


          <Link
            to="/#artists"
            className="primary-button"
          >
            <ArrowLeft size={18} />
            Back to artists
          </Link>

        </div>

      </main>

    );
  }


  /*
   * Artists are not restricted to particular styles.
   *
   * Their portfolio is determined by the artist
   * assigned to each tattoo.
   */

  const artistTattoos = tattoos.filter(
    (tattoo) =>
      tattoo.artist === artist.name
  );


  return (

    <main className="detail-page">


      {/* =========================
          BACK
      ========================= */}

      <div className="detail-back">

        <Link to="/#artists">

          <ArrowLeft size={18} />

          Back to artists

        </Link>

      </div>


      {/* =========================
          ARTIST PROFILE
      ========================= */}

      <section className="artist-detail-hero">

        <div className="artist-detail-image">

          {artist.image ? (

            <img
              src={artist.image}
              alt={`${artist.name} tattoo artist`}
              className="artist-detail-photo"
            />

          ) : (

            <div className="artist-detail-placeholder">

              <span>
                {String(
                  artist.id
                ).padStart(2, "0")}
              </span>

            </div>

          )}

        </div>


        <div className="artist-detail-info">

          <p className="section-label">
            Tattoo Artist
          </p>


          <h1>
            {artist.name}
          </h1>


          {artist.bio && (

            <p className="artist-detail-bio">
              {artist.bio}
            </p>

          )}


          {artist.styles &&
            artist.styles.length > 0 && (

              <div className="artist-detail-styles">

                <span>
                  Styles
                </span>


                <div>

                  {artist.styles.map(
                    (style) => (

                      <strong
                        key={style}
                      >
                        {style}
                      </strong>

                    )
                  )}

                </div>

              </div>

            )}


          <Link
            to="/booking"
            className="primary-button detail-button"
          >

            Book with {artist.name}

            <ArrowUpRight size={20} />

          </Link>

        </div>

      </section>


      {/* =========================
          ARTIST PORTFOLIO
      ========================= */}

      <section className="artist-work-section">

        <div className="section-heading">

          <div>

            <p className="section-label">
              Selected work
            </p>


            <h2>
              Work by{" "}

              <span>
                {artist.name}.
              </span>
            </h2>

          </div>

        </div>


        {artistTattoos.length > 0 ? (

          <div className="tattoo-gallery">

            {artistTattoos.map(
              (tattoo, index) => (

                <article
                  key={tattoo.id}
                  className={
                    index === 0
                      ? "tattoo-card tattoo-card-large"
                      : "tattoo-card"
                  }
                >

                  <Link
                    to={`/work/${tattoo.id}`}
                    className="tattoo-card-link"
                  >

                    <div className="tattoo-image">

                      {tattoo.image ? (

                        <img
                          src={tattoo.image}
                          alt={`${tattoo.title} tattoo`}
                          className="artist-work-image"
                        />

                      ) : (

                        <div className="tattoo-image-placeholder">

                          <span>
                            {String(
                              tattoo.id
                            ).padStart(2, "0")}
                          </span>


                          <div className="tattoo-view-icon">

                            <ArrowUpRight
                              size={20}
                            />

                          </div>

                        </div>

                      )}

                    </div>


                    <div className="tattoo-card-info">

                      <div>

                        <h3>
                          {tattoo.title}
                        </h3>


                        <p>
                          {tattoo.style}
                        </p>

                      </div>


                      <span className="tattoo-style">
                        View piece
                      </span>

                    </div>

                  </Link>

                </article>

              )
            )}

          </div>

        ) : (

          <div className="artist-no-work">

            <p>
              This artist's portfolio is
              currently being updated.
            </p>

          </div>

        )}

      </section>


      {/* =========================
          BOOKING CTA
      ========================= */}

      <section className="booking-section">

        <p className="section-label">
          Ready?
        </p>


        <h2>

          WORK WITH

          <br />

          <span>
            {artist.name}.
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


export default ArtistDetails;
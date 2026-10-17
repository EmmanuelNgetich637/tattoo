import {
  ArrowUpRight,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";


function ArtistCard({ artist }) {
  return (
    <article className="artist-card">

      <Link
        to={`/artists/${artist.id}`}
        className="artist-card-link"
      >

        <div className="artist-card-image">

          {artist.image ? (

            <img
              src={artist.image}
              alt={`${artist.name} tattoo artist`}
              className="artist-card-photo"
            />

          ) : (

            <div className="artist-card-placeholder">

              <span>
                {String(
                  artist.id
                ).padStart(2, "0")}
              </span>

              <div className="artist-card-arrow">
                <ArrowUpRight size={20} />
              </div>

            </div>

          )}

        </div>


        <div className="artist-card-info">

          <div>

            <h3>
              {artist.name}
            </h3>

            <p>
              Tattoo Artist
            </p>

          </div>

          <ArrowUpRight size={20} />

        </div>

      </Link>

    </article>
  );
}


export default ArtistCard;
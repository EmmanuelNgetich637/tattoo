import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";


function TattooCard({
  tattoo,
  large = false
}) {

  return (

    <article
      className={
        large
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
              className="tattoo-card-image"
            />

          ) : (

            <div className="tattoo-image-placeholder">

              <span>
                {String(tattoo.id).padStart(2, "0")}
              </span>

            </div>

          )}


          <div className="tattoo-view-icon">

            <ArrowUpRight
              size={20}
            />

          </div>

        </div>


        <div className="tattoo-card-info">

          <div>

            <h3>
              {tattoo.title}
            </h3>

            <p>
              {tattoo.artist}
            </p>

          </div>


          <span className="tattoo-style">
            {tattoo.style}
          </span>

        </div>

      </Link>

    </article>

  );

}


export default TattooCard;
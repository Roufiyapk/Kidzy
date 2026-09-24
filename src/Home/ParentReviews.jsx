import { useEffect, useRef, useState } from "react";
import {
  FaStar,
  FaChevronLeft,
  FaChevronRight,
  FaUser,
} from "react-icons/fa";

import api from "../api/api";

function ParentReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const scrollRef = useRef(null);

  // FETCH EXISTING REVIEWS

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);

        const response = await api.get("/reviews");

        const existingReviews = Array.isArray(response.data)
          ? response.data
          : [];

        // Latest reviews first
        const sortedReviews = [...existingReviews].sort(
          (a, b) =>
            new Date(b.createdAt || 0) -
            new Date(a.createdAt || 0)
        );

        setReviews(sortedReviews);
      } catch (error) {
        console.error("Failed to load reviews:", error);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  // ==========================================
  // SCROLL
  // ==========================================

  const handleScroll = (direction) => {
    if (!scrollRef.current) return;

    const { scrollLeft, clientWidth } = scrollRef.current;

    const scrollAmount = clientWidth * 0.75;

    scrollRef.current.scrollTo({
      left:
        direction === "left"
          ? scrollLeft - scrollAmount
          : scrollLeft + scrollAmount,
      behavior: "smooth",
    });
  };

  // LOADING

  if (loading) {
    return (
      <section className="bg-[#FFF7D6] px-6 md:px-14 py-16 border-b border-[#E8DFC0]">
        <div className="max-w-7xl mx-auto relative">
          <p className="text-center py-20 font-medium text-stone-500">
            Loading reviews...
          </p>
        </div>
      </section>
    );
  }

  // NO REVIEWS

  if (reviews.length === 0) {
    return null;
  }

  return (
    <section className="bg-[#FFF7D6] px-6 md:px-14 py-16 border-b border-[#E8DFC0]">
      <div className="max-w-7xl mx-auto relative">

        {/* 
            HEADER
       */}

        <div className="flex items-baseline justify-between mb-10 pl-2">

          <div className="flex flex-col gap-1">

            <p className="uppercase tracking-[0.2em] text-[10px] font-bold text-stone-500">
              Real Experiences
            </p>

            <h2 className="text-2xl md:text-3xl font-serif font-black italic tracking-wide text-stone-900">
              What Parents Say
            </h2>

            <div className="h-[2px] w-12 bg-amber-500 rounded-full mt-1" />

          </div>

          {/* 
              NAVIGATION CONTROLS
         */}

          {reviews.length > 1 && (
            <div className="flex gap-2">

              {/* LEFT */}

              <button
                type="button"
                onClick={() => handleScroll("left")}
                className="
                  w-9
                  h-9
                  rounded-full
                  bg-white
                  border
                  border-[#E5DDD4]
                  flex
                  items-center
                  justify-center
                  cursor-pointer
                  text-stone-700
                  hover:bg-stone-900
                  hover:text-white
                  hover:border-stone-900
                  transition-all
                  shadow-xs
                "
                aria-label="Previous reviews"
              >
                <FaChevronLeft className="text-xs" />
              </button>

              {/* RIGHT */}

              <button
                type="button"
                onClick={() => handleScroll("right")}
                className="
                  w-9
                  h-9
                  rounded-full
                  bg-white
                  border
                  border-[#E5DDD4]
                  flex
                  items-center
                  justify-center
                  cursor-pointer
                  text-stone-700
                  hover:bg-stone-900
                  hover:text-white
                  hover:border-stone-900
                  transition-all
                  shadow-xs
                "
                aria-label="Next reviews"
              >
                <FaChevronRight className="text-xs" />
              </button>

            </div>
          )}

        </div>

        {/* 
            REVIEWS SCROLL TRACK
         */}

        <div
          ref={scrollRef}
          className="
            flex
            gap-6
            overflow-x-auto
            pb-6
            px-2
            scroll-smooth
            snap-x
            snap-mandatory
          "
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >

          {reviews.map((review) => (

            <div
              key={review.id}
              className="
                group
                relative
                w-[280px]
                sm:w-[300px]
                md:w-[340px]
                min-w-[280px]
                sm:min-w-[300px]
                md:min-w-[340px]
                max-w-[340px]
                flex-shrink-0
                snap-start
                bg-white
                rounded-2xl
                border
                border-[#E5DDD4]
                overflow-hidden
                shadow-xs
                hover:shadow-md
                transition-all
                duration-300
              "
            >

              {/* 
                  REVIEW CONTENT
              */}

              <div className="p-5">

                {/* USER */}

                <div className="flex items-center gap-3">

                  <div
                    className="
                      w-10
                      h-10
                      rounded-full
                      bg-[#FFF7D6]
                      border
                      border-[#E5DDD4]
                      flex
                      items-center
                      justify-center
                      text-stone-500
                    "
                  >
                    <FaUser className="text-sm" />
                  </div>

                  <div className="min-w-0">

                    <h3 className="text-sm font-bold text-stone-900 truncate">
                      {review.userName || "Customer"}
                    </h3>

                    {review.createdAt && (
                      <p className="text-[10px] text-stone-400 mt-0.5">
                        {new Date(
                          review.createdAt
                        ).toLocaleDateString()}
                      </p>
                    )}

                  </div>

                </div>

                {/* 
                    RATING
                */}

                <div className="flex gap-1 mt-4">

                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      className={
                        star <= Number(review.rating || 0)
                          ? "text-yellow-400 text-sm"
                          : "text-gray-300 text-sm"
                      }
                    />
                  ))}

                </div>

                {/* 
                    REVIEW TITLE
                 */}

                <h4 className="text-base font-bold text-stone-900 mt-4 line-clamp-2">
                  {review.title || "Great Product"}
                </h4>

                {/* 
                    REVIEW COMMENT
               */}

                <p className="text-sm text-stone-600 leading-relaxed mt-3 line-clamp-6">
                  {review.comment}
                </p>

              </div>

              {/*
                  PRODUCT NAME
               */}

              {review.productName && (
                <div className="border-t border-[#E5DDD4] px-5 py-4 bg-[#FCFAF7]">

                  <p className="text-[10px] uppercase tracking-wider text-stone-400 font-bold mb-1">
                    Product
                  </p>

                  <div className="flex items-center gap-3">
                    {review.productImage && (
                      <img
                        src={review.productImage}
                        alt={review.productName}
                        className="w-12 h-14 object-contain bg-white rounded-lg border border-gray-200 flex-shrink-0"
                      />
                    )}

                    <p className="text-xs font-semibold text-stone-800 line-clamp-2">
                      {review.productName}
                    </p>
                  </div>

                </div>
              )}

              {/* 
                  HOVER INDICATOR
              */}

              <div
                className="
                  absolute
                  top-0
                  left-0
                  w-full
                  h-[3px]
                  bg-transparent
                  group-hover:bg-amber-500
                  transition-colors
                  duration-300
                "
              />

            </div>

          ))}

        </div>

      </div>
    </section>
  );
}

export default ParentReviews;
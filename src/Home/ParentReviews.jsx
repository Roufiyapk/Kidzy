import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
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

  const navigate = useNavigate();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);

        const response = await api.get(
          "/reviews/high-rated"
        );

        const existingReviews =
          Array.isArray(response.data?.data)
            ? response.data.data
            : [];

        const sortedReviews = [...existingReviews].sort(
          (a, b) =>
            new Date(b.createdAt || 0) -
            new Date(a.createdAt || 0)
        );

        setReviews(sortedReviews);
      } catch (error) {
        console.error(
          "Failed to load high rated reviews:",
          error
        );

        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const handleScroll = (direction) => {
    if (!scrollRef.current) return;

    const {
      scrollLeft,
      clientWidth,
    } = scrollRef.current;

    const scrollAmount =
      clientWidth * 0.75;

    scrollRef.current.scrollTo({
      left:
        direction === "left"
          ? scrollLeft - scrollAmount
          : scrollLeft + scrollAmount,
      behavior: "smooth",
    });
  };

  const handleReviewClick = (productId) => {
    if (!productId) {
      return;
    }

    navigate(`/product/${productId}`);
  };

  if (loading) {
    return (
      <section className="bg-gradient-to-br from-[#D8C8B7] via-[#E8DED2] to-[#C7D0C2] px-4 sm:px-6 md:px-14 py-14 md:py-16 border-b border-[#E7DED5]">
        <div className="max-w-7xl mx-auto relative">
          <p className="text-center py-20 font-medium text-[#8B7A69]">
            Loading reviews...
          </p>
        </div>
      </section>
    );
  }

  if (reviews.length === 0) {
    return null;
  }

  return (
    <section className="bg-gradient-to-br from-[#D8C8B7] via-[#E8DED2] to-[#C7D0C2] px-4 sm:px-6 md:px-14 py-14 md:py-16 border-b border-[#E7DED5]">
      <div className="max-w-7xl mx-auto relative">

        <div className="flex items-end justify-between gap-4 mb-8 md:mb-10 pl-1">

          <div className="flex flex-col gap-1">

            <p className="uppercase tracking-[0.22em] text-[10px] font-semibold text-[#9A795D]">
              Real Experiences
            </p>

            <h2 className="text-2xl md:text-4xl font-sans font-semibold tracking-[-0.035em] text-[#3F3026]">
              What Parents Say
            </h2>

            <div className="h-[3px] w-12 bg-[#B69A7B] rounded-full mt-3" />

          </div>

          {reviews.length > 1 && (
            <div className="flex gap-2">

              <button
                type="button"
                onClick={() =>
                  handleScroll("left")
                }
                className="
                  w-10
                  h-10
                  rounded-full
                  bg-white/90
                  border
                  border-[#E5D9CC]
                  flex
                  items-center
                  justify-center
                  cursor-pointer
                  text-[#6B5847]
                  hover:bg-[#49372B]
                  hover:text-white
                  hover:border-[#49372B]
                  transition-all
                  shadow-xs
                "
                aria-label="Previous reviews"
              >
                <FaChevronLeft className="text-xs" />
              </button>

              <button
                type="button"
                onClick={() =>
                  handleScroll("right")
                }
                className="
                  w-10
                  h-10
                  rounded-full
                  bg-white/90
                  border
                  border-[#E5D9CC]
                  flex
                  items-center
                  justify-center
                  cursor-pointer
                  text-[#6B5847]
                  hover:bg-[#49372B]
                  hover:text-white
                  hover:border-[#49372B]
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

        <div
          ref={scrollRef}
          className="
            flex
            gap-4 sm:gap-5 sm:p-6 md:gap-6
            overflow-x-auto
            pb-6
            px-1 sm:px-2
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
              onClick={() =>
                handleReviewClick(
                  review.productId
                )
              }
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" ||
                  event.key === " "
                ) {
                  event.preventDefault();

                  handleReviewClick(
                    review.productId
                  );
                }
              }}
              className="
                group
                relative
                w-[280px]
                sm:w-[310px]
                md:w-[340px]
                min-w-[280px]
                sm:min-w-[310px]
                md:min-w-[340px]
                max-w-[340px]
                flex-shrink-0
                snap-start
                bg-white/95
                rounded-2xl
                border
                border-[#E7DDD2]
                overflow-hidden
                shadow-[0_8px_28px_rgba(73,55,43,0.045)]
                hover:shadow-[0_16px_36px_rgba(73,55,43,0.11)]
                hover:-translate-y-1
                transition-all
                duration-300
                cursor-pointer
              "
            >

              <div className="p-5 sm:p-6">

                <div className="flex items-center gap-3">

                  <div
                    className="
                      w-11
                      h-11
                      rounded-full
                      bg-[#F5F0E9]
                      border
                      border-[#EAE2D8]
                      flex
                      items-center
                      justify-center
                      text-[#8B7A69]
                    "
                  >
                    <FaUser className="text-sm" />
                  </div>

                  <div className="min-w-0">

                    <h3 className="text-sm font-semibold tracking-tight text-[#49372B] truncate">
                      {review.userName ||
                        "Customer"}
                    </h3>

                    {review.createdAt && (
                      <p className="text-[10px] text-[#A99A8B] mt-0.5">
                        {new Date(
                          review.createdAt
                        ).toLocaleDateString()}
                      </p>
                    )}

                  </div>

                </div>

                <div className="flex gap-1 mt-4">

                  {[1, 2, 3, 4, 5].map(
                    (star) => (
                      <FaStar
                        key={star}
                        className={
                          star <=
                          Number(
                            review.rating || 0
                          )
                            ? "text-[#B69A7B] text-sm"
                            : "text-[#D8CFC5] text-sm"
                        }
                      />
                    )
                  )}

                </div>

                <h4 className="text-base font-semibold tracking-tight text-[#49372B] mt-4 line-clamp-2">
                  {review.title ||
                    "Great Product"}
                </h4>

                <p className="text-sm font-normal tracking-[0.005em] text-[#817467] leading-7 mt-3 line-clamp-6">
                  {review.comment}
                </p>

              </div>

              {review.productName && (
                <div className="border-t border-[#EEE5DB] px-5 py-4 bg-[#FAF7F2]">

                  <p className="text-[10px] uppercase tracking-[0.14em] text-[#A99A8B] font-semibold mb-1">
                    Product
                  </p>

                  <div className="flex items-center gap-3">

                    {review.productImage && (
                      <img
                        src={
                          review.productImage
                        }
                        alt={
                          review.productName
                        }
                        className="w-12 h-14 object-contain bg-[#F5F0E9] rounded-lg border border-[#EAE2D8] flex-shrink-0"
                      />
                    )}

                    <p className="text-xs font-medium tracking-tight text-[#49372B] line-clamp-2">
                      {review.productName}
                    </p>

                  </div>

                </div>
              )}

              <div
                className="
                  absolute
                  top-0
                  left-0
                  w-full
                  h-[3px]
                  bg-transparent
                  group-hover:bg-[#B69A7B]
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
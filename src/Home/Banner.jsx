import { useState } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaTruck,
  FaCheckCircle,
  FaLock,
  FaHeart,
} from "react-icons/fa";

const slides = [
  {
    image:
      "https://res.cloudinary.com/eydyeffr/image/upload/v1789842613/image1.jpg",
  },
  {
    image:
      "https://res.cloudinary.com/eydyeffr/image/upload/v1789842647/image2.jpg",
  },
  {
    image:
      "https://res.cloudinary.com/eydyeffr/image/upload/v1789842635/image3.jpg",
  },
];

const Banner = () => {
  const [current, setCurrent] = useState(0);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrent(
      (prev) =>
        (prev - 1 + slides.length) % slides.length
    );
  };

  return (
    <section className="w-full bg-white py-2 sm:py-3">
      <div className="mx-auto w-full max-w-[1500px]">

        {/* BANNER */}

        <div
          className="
            relative
            w-full
            overflow-hidden
            bg-white
            aspect-[1500/580]
          "
        >
          {/* Banner Image */}

          <img
            src={slides[current].image}
            alt="Kids Fashion"
            className="
              absolute
              inset-0
              h-full
              w-full
              object-contain
              transition-all
              duration-500
            "
          />

          {/* LEFT ARROW */}

          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous slide"
            className="
              absolute
              left-2
              top-1/2
              z-10
              flex
              h-8
              w-8
              -translate-y-1/2
              items-center
              justify-center
              rounded-full
              bg-white
              shadow-md
              transition-all
              duration-200
              hover:scale-105
              hover:bg-gray-100
              sm:left-3
              sm:h-9
              sm:w-9
              md:left-4
              md:h-10
              md:w-10
            "
          >
            <FaChevronLeft className="text-[10px] text-gray-700 sm:text-xs md:text-sm" />
          </button>

          {/* RIGHT ARROW */}

          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next slide"
            className="
              absolute
              right-2
              top-1/2
              z-10
              flex
              h-8
              w-8
              -translate-y-1/2
              items-center
              justify-center
              rounded-full
              bg-white
              shadow-md
              transition-all
              duration-200
              hover:scale-105
              hover:bg-gray-100
              sm:right-3
              sm:h-9
              sm:w-9
              md:right-4
              md:h-10
              md:w-10
            "
          >
            <FaChevronRight className="text-[10px] text-gray-700 sm:text-xs md:text-sm" />
          </button>

          {/* DOTS */}

          <div
            className="
              absolute
              bottom-2
              left-1/2
              z-10
              flex
              -translate-x-1/2
              items-center
              gap-1.5
              sm:bottom-3
              sm:gap-2
              md:bottom-4
            "
          >
            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrent(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 sm:h-2 ${
                  current === index
                    ? "w-5 bg-gray-800 sm:w-6"
                    : "w-1.5 bg-gray-400 sm:w-2"
                }`}
              />
            ))}
          </div>
        </div>

        {/* BENEFITS SECTION */}

        <div className="px-2 sm:px-4 md:px-6 lg:px-8">
          <div
            className="
              mt-2
              w-full
              bg-[#fff8d9]
              px-3
              py-3
              shadow-sm
              sm:px-5
              sm:py-3
              md:px-8
            "
          >
            <div
              className="
                grid
                grid-cols-2
                gap-x-3
                gap-y-4
                sm:grid-cols-4
                sm:gap-4
                md:gap-8
                lg:gap-14
              "
            >

              {/* Free Shipping */}

              <div className="flex items-center justify-center gap-2 sm:gap-3">
                <FaTruck
                  className="
                    shrink-0
                    text-lg
                    text-gray-700
                    sm:text-xl
                  "
                />

                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-gray-800 sm:text-xs">
                    Free Shipping
                  </p>

                  <p className="text-[8px] text-gray-600 sm:text-[10px]">
                    on orders over ₹499
                  </p>
                </div>
              </div>

              {/* Quality Checked */}

              <div className="flex items-center justify-center gap-2 sm:gap-3">
                <FaCheckCircle
                  className="
                    shrink-0
                    text-lg
                    text-gray-700
                    sm:text-xl
                  "
                />

                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-gray-800 sm:text-xs">
                    Quality Checked
                  </p>

                  <p className="text-[8px] text-gray-600 sm:text-[10px]">
                    carefully selected
                  </p>
                </div>
              </div>

              {/* Secure Payment */}

              <div className="flex items-center justify-center gap-2 sm:gap-3">
                <FaLock
                  className="
                    shrink-0
                    text-lg
                    text-gray-700
                    sm:text-xl
                  "
                />

                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-gray-800 sm:text-xs">
                    Secure Payment
                  </p>

                  <p className="text-[8px] text-gray-600 sm:text-[10px]">
                    100% protected
                  </p>
                </div>
              </div>

              {/* Loved by Parents */}

              <div className="flex items-center justify-center gap-2 sm:gap-3">
                <FaHeart
                  className="
                    shrink-0
                    text-lg
                    text-gray-700
                    sm:text-xl
                  "
                />

                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-gray-800 sm:text-xs">
                    Loved by Parents
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Banner;
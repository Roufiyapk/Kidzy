import {
  FaTruck,
  FaCheckCircle,
  FaLock,
  FaHeart,
} from "react-icons/fa";

const Banner = () => {
  return (
    <section className="w-full bg-white py-3 sm:py-4">
      <div className="mx-auto w-full max-w-[1500px] px-2 sm:px-4">

        {/* MAIN BANNER */}

        <div
          className="
            relative
            w-full
            overflow-hidden
            bg-[#fff8f0]
            aspect-[1500/580]
            min-h-[250px]
            sm:min-h-[320px]
            lg:min-h-[400px]
          "
        >
          {/* CLOUDINARY BANNER IMAGE */}

          <img
            src="https://res.cloudinary.com/eydyeffr/image/upload/v1791544324/Image_Oct_9_2026_04_38_21_PM.png"
            alt="KIDZY kids fashion and lifestyle collection"
            className="
              absolute
              inset-0
              h-full
              w-full
              object-cover
              object-center
            "
          />

          {/* LEFT SIDE TEXT */}

          <div
            className="
              absolute
              inset-y-0
              left-0
              z-10
              flex
              w-[54%]
              flex-col
              items-center
              justify-center
              px-2
              text-center
              sm:w-[52%]
              sm:px-5
              md:w-[50%]
              md:px-8
              lg:w-[49%]
              lg:px-12
            "
          >
            {/* BRAND NAME */}

            <p
              className="
                mb-2
                text-[9px]
                font-medium
                uppercase
                tracking-[0.35em]
                text-[#68564a]
                sm:mb-3
                sm:text-xs
                sm:tracking-[0.45em]
                md:text-sm
                lg:mb-5
              "
            >
              K I D Z Y
            </p>

            {/* MAIN HEADING */}

            <h1
              className="
                font-serif
                text-[clamp(25px,5vw,76px)]
                font-semibold
                leading-[0.95]
                tracking-[-0.04em]
                text-[#604735]
                sm:leading-[0.98]
              "
            >
              Little
              <br />

              <span className="text-[#c97972]">
                Moments
              </span>
            </h1>

            {/* TAGLINE */}

            <p
              className="
                mt-3
                text-[9px]
                font-medium
                uppercase
                tracking-[0.22em]
                text-[#6d5b4e]
                sm:mt-4
                sm:text-xs
                sm:tracking-[0.3em]
                md:mt-5
                md:text-sm
                lg:mt-6
              "
            >
              BIG HAPPINESS
            </p>

            {/* DIVIDER */}

            <div
              className="
                my-3
                h-px
                w-10
                bg-[#c97972]
                sm:my-4
                sm:w-14
                md:my-5
                md:w-16
              "
            />

            {/* CATEGORIES */}

            <p
              className="
                max-w-full
                text-[7px]
                font-medium
                uppercase
                leading-relaxed
                tracking-[0.12em]
                text-[#65574c]
                sm:text-[9px]
                sm:tracking-[0.18em]
                md:text-[10px]
                lg:text-xs
                lg:tracking-[0.22em]
              "
            >
              FASHION

              <span className="mx-1.5 text-[#c97972] sm:mx-2">
                •
              </span>

              TOYS

              <span className="mx-1.5 text-[#c97972] sm:mx-2">
                •
              </span>

              ACCESSORIES

              <span className="mx-1.5 text-[#c97972] sm:mx-2">
                •
              </span>

              EVERYDAY ESSENTIALS
            </p>
          </div>
        </div>

       {/* BENEFITS SECTION - WARM LUXURY */}

<div className="px-1 sm:px-2 md:px-4">
  <div
    className="
      mt-3
      w-full
      border
      border-[#E5D5C5]
      bg-[#F3E8DC]
      px-3
      py-3
      sm:py-4
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
        lg:gap-12
      "
    >
      {/* FREE SHIPPING */}

      <div className="flex items-center justify-center gap-2 sm:gap-3">
        <FaTruck className="shrink-0 text-base text-[#755844] sm:text-xl" />

        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-[#49372B] sm:text-xs">
            Free Shipping
          </p>

          <p className="text-[8px] text-[#7D6B5D] sm:text-[10px]">
            On orders over ₹499
          </p>
        </div>
      </div>

      {/* QUALITY CHECKED */}

      <div className="flex items-center justify-center gap-2 sm:gap-3">
        <FaCheckCircle className="shrink-0 text-base text-[#755844] sm:text-xl" />

        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-[#49372B] sm:text-xs">
            Quality Checked
          </p>

          <p className="text-[8px] text-[#7D6B5D] sm:text-[10px]">
            Carefully selected
          </p>
        </div>
      </div>

      {/* SECURE PAYMENT */}

      <div className="flex items-center justify-center gap-2 sm:gap-3">
        <FaLock className="shrink-0 text-base text-[#755844] sm:text-xl" />

        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-[#49372B] sm:text-xs">
            Secure Payment
          </p>

          <p className="text-[8px] text-[#7D6B5D] sm:text-[10px]">
            100% protected
          </p>
        </div>
      </div>

      {/* LOVED BY PARENTS */}

      <div className="flex items-center justify-center gap-2 sm:gap-3">
        <FaHeart className="shrink-0 text-base text-[#755844] sm:text-xl" />

        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-[#49372B] sm:text-xs">
            Loved by Parents
          </p>

          <p className="text-[8px] text-[#7D6B5D] sm:text-[10px]">
            Made for little ones
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
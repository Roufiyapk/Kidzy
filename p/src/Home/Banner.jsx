import { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";

import image4 from "../assets/image4.jpeg";
import image2 from "../assets/image2.png";
import image3 from "../assets/image3.jpeg";

function Banner() {

  const navigate = useNavigate();

  const realSlides = [
    { type: "hero", image: image4 },
    { type: "sale", image: image3 },
    { type: "new", image: image2 },
  ];

  const slides = [
    realSlides[realSlides.length - 1],
    ...realSlides,
    realSlides[0],
  ];

  const [current, setCurrent] = useState(1);
  const [transition, setTransition] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setTransition(true);
    setCurrent((prev) => prev + 1);
  };

  const prevSlide = () => {
    setTransition(true);
    setCurrent((prev) => prev - 1);
  };

  useEffect(() => {

    if (current === slides.length - 1) {

      const timeout = setTimeout(() => {
        setTransition(false);
        setCurrent(1);
      }, 500);

      return () => clearTimeout(timeout);
    }

    if (current === 0) {

      const timeout = setTimeout(() => {
        setTransition(false);
        setCurrent(realSlides.length);
      }, 500);

      return () => clearTimeout(timeout);
    }

  }, [current, slides.length, realSlides.length]);

  return (

    <div className="w-screen h-screen overflow-hidden">

      <div className="relative w-full h-full overflow-hidden">


        <div
          className={`flex h-full ${
            transition
              ? "transition-transform duration-500 ease-in-out"
              : ""
          }`}
          style={{
            transform: `translateX(-${current * 100}%)`,
          }}
        >

          {slides.map((item, index) => (

            <div
              key={index}
              className="min-w-full w-screen h-screen relative"
            >

              {/* HERO SLIDE */}

              {item.type === "hero" && (

                <div className="relative w-full h-full bg-[#f7f3ee] overflow-hidden flex items-center justify-center">

                  <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none select-none">

                    <h1 className="text-[120px] sm:text-[180px] md:text-[280px] lg:text-[420px] font-serif font-semibold tracking-[-16px] leading-none text-[#2f2f2f] opacity-10">

                      KIDZY

                    </h1>

                  </div>

                  <p className="absolute top-10 left-1/2 -translate-x-1/2 uppercase tracking-[6px] text-[#c89b2c] text-[11px] md:text-sm font-semibold z-40">

                    BOYS & GIRLS

                  </p>

                  <div className="relative z-30 w-full h-full flex items-end justify-center">

                    <img
                      src={item.image}
                      alt="kids"
                      className="h-[78%] md:h-[92%] object-contain drop-shadow-2xl"
                    />

                  </div>

                  <div className="absolute left-[6%] top-1/2 -translate-y-1/2 z-40">

                    <p className="text-[#c89b2c] tracking-[4px] uppercase text-xs mb-4">

                      New Arrival

                    </p>

                    <h2 className="text-4xl md:text-6xl font-semibold leading-tight text-[#2f2f2f]">

                      Tiny <br /> Fashion

                    </h2>

                  </div>

                  <div className="absolute right-[6%] top-1/2 -translate-y-1/2 text-right z-40">

                    <h3 className="text-3xl md:text-5xl font-light text-[#2f2f2f] leading-tight">

                      Happy <br /> Styles

                    </h3>

                    <p className="mt-5 text-gray-500 text-sm md:text-base max-w-[220px] ml-auto">

                      Comfortable looks designed for playful everyday moments.

                    </p>

                  </div>

                  <button
           onClick={() => navigate("/products/Girls")}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 px-8 py-3 bg-black text-white uppercase tracking-[4px] text-[11px] z-40 hover:bg-[#c89b2c] hover:text-black transition-all duration-300"
                  >

                    SHOP NOW

                  </button>

                </div>
              )}

              {/* SALE SLIDE  */}

              {item.type === "sale" && (

                <div className="relative w-full h-full bg-[#f7f3ee] overflow-hidden flex items-center justify-center">


                  <h1 className="absolute text-[120px] sm:text-[180px] md:text-[260px] lg:text-[360px] font-serif font-semibold tracking-[-10px] text-[#2f2f2f] opacity-10 z-10 select-none">

                    KIDZY

                  </h1>


                  <img
                    src={item.image}
                    alt=""
                    className="relative z-20 h-[90%] md:h-[95%] object-contain"
                  />


                  <p className="absolute top-10 left-1/2 -translate-x-1/2 text-[#c89b2c] tracking-[6px] text-xs md:text-sm font-semibold z-30">

                    NEW COLLECTION

                  </p>


                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-30">

                    <h1 className="text-4xl md:text-6xl font-semibold text-[#2f2f2f] leading-tight">

                      Kids Fashion

                    </h1>

                    <p className="mt-3 text-gray-600 text-sm md:text-base">

                      Made for comfort & everyday style

                    </p>

                    <button
                      onClick={() => navigate("/products/Boys")}
                      className="mt-6 px-6 py-3 bg-black text-white text-sm tracking-[3px] hover:bg-[#c89b2c] hover:text-black transition"
                    >

                      SHOP NOW

                    </button>

                  </div>

                </div>
              )}

              {/*  NEW SLIDE  */}

              {item.type === "new" && (

                <div className="relative w-full h-full bg-[#f7f3ee] overflow-hidden flex items-center">


                  <h1 className="absolute text-[120px] sm:text-[180px] md:text-[260px] lg:text-[360px] font-serif font-semibold tracking-[-12px] text-[#2f2f2f] opacity-10 z-10 select-none left-1/2 -translate-x-1/2">

                    KIDZY

                  </h1>


                  <div className="relative z-30 w-full md:w-1/2 px-8 md:px-16">

                    <p className="tracking-[6px] text-[#7a8450] text-xs md:text-sm mb-4">

                      NEW COLLECTION

                    </p>

                    <h1 className="text-4xl md:text-6xl font-semibold text-[#2f2f2f] leading-tight">

                      Kids <br /> Style

                    </h1>

                    <p className="mt-3 text-2xl md:text-3xl text-[#c89b2c] font-light italic">

                      Made for comfort ♡

                    </p>

                    <p className="mt-6 text-gray-600 text-sm md:text-base max-w-md">

                      Comfortable outfits designed for everyday play and fun.

                    </p>

                    <button
                      onClick={() => navigate("/products/Girls")}
                      className="mt-8 px-6 py-3 bg-[#7a8450] text-white rounded-md text-sm tracking-[2px] hover:bg-[#5f673f] transition"
                    >

                      SHOP NOW →

                    </button>

                  </div>


                  <div className="absolute right-[6%] bottom-0 h-full flex items-end z-20">

                    <img
                      src={item.image}
                      alt=""
                      className="h-[90%] md:h-[95%] object-contain"
                    />

                  </div>

                </div>
              )}

            </div>
          ))}

        </div>




      </div>

    </div>
  );
}

export default Banner;
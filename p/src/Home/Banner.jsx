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
    <div className="w-full aspect-[16/10] md:h-screen max-h-[1080px] overflow-hidden bg-[#f7f3ee]">
      <div className="relative w-full h-full overflow-hidden">
        
        <div
          className={`flex h-full ${
            transition ? "transition-transform duration-500 ease-in-out" : ""
          }`}
          style={{
            transform: `translateX(-${current * 100}%)`,
          }}
        >
          {slides.map((item, index) => (
            <div
              key={index}
              className="min-w-full w-full h-full relative flex-shrink-0"
            >
              
              {/* HERO SLIDE */}
              {item.type === "hero" && (
                <div className="relative w-full h-full bg-[#f7f3ee] overflow-hidden flex items-center justify-center">
                  
                  <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none select-none">
                    <h1 className="text-[25vw] md:text-[280px] lg:text-[420px] font-serif font-semibold tracking-[-4px] md:tracking-[-16px] leading-none text-[#2f2f2f] opacity-10 whitespace-nowrap">
                      KIDZY
                    </h1>
                  </div>

                  {/* Subtitle Top */}
                  <p className="absolute top-[4%] left-1/2 -translate-x-1/2 uppercase tracking-[2px] md:tracking-[6px] text-[#c89b2c] text-[2.2vw] md:text-sm font-semibold z-40 whitespace-nowrap">
                    BOYS & GIRLS
                  </p>

                  {/* Main Twin Models Image */}
                  <div className="relative z-30 w-full h-full flex items-end justify-center">
                    <img
                      src={item.image}
                      alt="kids"
                      className="h-[85%] md:h-[92%] object-contain drop-shadow-2xl"
                    />
                  </div>

                  {/* Left Headings */}
                  <div className="absolute left-[6%] top-1/2 -translate-y-1/2 z-40">
                    <p className="text-[#c89b2c] tracking-[1.5px] md:tracking-[4px] uppercase text-[1.8vw] md:text-xs mb-[2%] md:mb-4 whitespace-nowrap">
                      New Arrival
                    </p>
                    <h2 className="text-[5.5vw] md:text-6xl font-semibold leading-tight text-[#2f2f2f]">
                      Tiny <br /> Fashion
                    </h2>
                  </div>

                  {/* Right Headings */}
                  <div className="absolute right-[6%] top-1/2 -translate-y-1/2 text-right z-40">
                    <h3 className="text-[4.5vw] md:text-5xl font-light text-[#2f2f2f] leading-tight">
                      Happy <br /> Styles
                    </h3>
                    <p className="mt-[2%] md:mt-5 text-gray-500 text-[1.8vw] md:text-base max-w-[22vw] md:max-w-[220px] ml-auto leading-relaxed">
                      Comfortable looks designed for playful everyday moments.
                    </p>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => navigate("/products/Girls")}
                    className="absolute bottom-[6%] left-1/2 -translate-x-1/2 px-[4%] py-[1.5%] md:px-8 md:py-3 bg-black text-white uppercase tracking-[2px] md:tracking-[4px] text-[1.8vw] md:text-[11px] z-40 hover:bg-[#c89b2c] hover:text-black transition-all duration-300 whitespace-nowrap"
                  >
                    SHOP NOW
                  </button>
                </div>
              )}

              {/* SALE SLIDE */}
              {item.type === "sale" && (
                <div className="relative w-full h-full bg-[#f7f3ee] overflow-hidden flex items-center justify-center">
                  <h1 className="absolute text-[22vw] md:text-[260px] lg:text-[360px] font-serif font-semibold tracking-[-3px] md:tracking-[-10px] text-[#2f2f2f] opacity-10 z-10 select-none whitespace-nowrap">
                    KIDZY
                  </h1>

                  <img
                    src={item.image}
                    alt=""
                    className="relative z-20 h-[85%] md:h-[95%] object-contain"
                  />

                  <p className="absolute top-[4%] left-1/2 -translate-x-1/2 text-[#c89b2c] tracking-[2px] md:tracking-[6px] text-[2.2vw] md:text-sm font-semibold z-30 whitespace-nowrap">
                    NEW COLLECTION
                  </p>

                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-30 pointer-events-none">
                    <div className="pointer-events-auto">
                      <h1 className="text-[5.5vw] md:text-6xl font-semibold text-[#2f2f2f] leading-tight">
                        Kids Fashion
                      </h1>
                      <p className="mt-[1%] md:mt-3 text-gray-600 text-[2vw] md:text-base">
                        Made for comfort & everyday style
                      </p>
                      <button
                        onClick={() => navigate("/products/Boys")}
                        className="mt-[2%] md:mt-6 px-[3.5%] py-[1.5%] md:px-6 md:py-3 bg-black text-white text-[1.8vw] md:text-sm tracking-[1.5px] md:tracking-[3px] hover:bg-[#c89b2c] hover:text-black transition"
                      >
                        SHOP NOW
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* NEW SLIDE */}
              {item.type === "new" && (
                <div className="relative w-full h-full bg-[#f7f3ee] overflow-hidden flex items-center">
                  <h1 className="absolute text-[22vw] md:text-[260px] lg:text-[360px] font-serif font-semibold tracking-[-4px] md:tracking-[-12px] text-[#2f2f2f] opacity-10 z-10 select-none left-1/2 -translate-x-1/2 whitespace-nowrap">
                    KIDZY
                  </h1>

                  <div className="relative z-30 w-1/2 px-[6%] md:px-16">
                    <p className="tracking-[2px] md:tracking-[6px] text-[#7a8450] text-[2vw] md:text-sm mb-[2%] md:mb-4 whitespace-nowrap">
                      NEW COLLECTION
                    </p>
                    <h1 className="text-[5.5vw] md:text-6xl font-semibold text-[#2f2f2f] leading-tight">
                      Kids <br /> Style
                    </h1>
                    <p className="mt-[1%] md:mt-3 text-[3vw] md:text-3xl text-[#c89b2c] font-light italic whitespace-nowrap">
                      Made for comfort ♡
                    </p>
                    <p className="mt-[2%] md:mt-6 text-gray-600 text-[1.8vw] md:text-base max-w-[40vw] md:max-w-md line-clamp-2 md:line-clamp-none">
                      Comfortable outfits designed for everyday play and fun.
                    </p>
                    <button
                      onClick={() => navigate("/products/Girls")}
                      className="mt-[2%] md:mt-8 px-[3.5%] py-[1.5%] md:px-6 md:py-3 bg-[#7a8450] text-white rounded-md text-[1.8vw] md:text-sm tracking-[1.5px] md:tracking-[2px] hover:bg-[#5f673f] transition whitespace-nowrap"
                    >
                      SHOP NOW →
                    </button>
                  </div>

                  <div className="absolute right-[6%] bottom-0 h-full flex items-end z-20">
                    <img
                      src={item.image}
                      alt=""
                      className="h-[85%] md:h-[95%] object-contain"
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
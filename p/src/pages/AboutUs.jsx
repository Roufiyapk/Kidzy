import React from "react";
import { FaHeart, FaShieldAlt, FaLeaf, FaChevronRight } from "react-icons/fa";

function AboutUs() {
  return (
    <div className="bg-[#f7f3ee] text-stone-900 selection:bg-amber-100 selection:text-amber-900">
      
      <section className="px-6 md:px-14 pt-20 pb-16 max-w-7xl mx-auto border-b border-[#e5ddd4]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 flex flex-col gap-3">
            <p className="uppercase tracking-[0.25em] text-[10px] font-bold text-stone-400">
              Our Journey
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-black italic tracking-wide leading-tight text-stone-900">
              Chic Styles For <br />
              Little Trendsetters.
            </h1>
            <div className="h-[3px] w-16 bg-amber-500 rounded-full mt-2" />
          </div>
          
          <div className="lg:col-span-5">
            <p className="text-stone-600 text-sm md:text-base font-medium leading-relaxed">
              We believe that kids’ clothing should be a beautiful harmony of playful imagination and premium, adult-grade tailoring. Our collections are mindfully curated to deliver comfort without ever compromising on sophisticated style.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 md:px-14 py-20 max-w-7xl mx-auto border-b border-[#e5ddd4]">
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center gap-6">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">How We Started</span>
            <h2 className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-stone-900">
              Redefining the Childhood Wardrobe
            </h2>
          </div>
          
          <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
            As parents, we constantly found ourselves choosing between two extremes: ultra-bright clothing that lacked structure, or beautiful luxury pieces that were too delicate for actual play. 
          </p>
          
          <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
            We launched our platform to fill that gap. Every piece in our catalog—from structured everyday co-ord sets to elegant dresses and smart casual polo shorts—is sourced to endure the ruggedness of daily adventures while looking effortlessly polished.
          </p>

          <blockquote className="border-l-2 border-stone-900 pl-4 my-4 italic text-stone-800 text-base font-serif max-w-xl text-center">
            "We don't just dress children; we design backgrounds for their most cherished childhood memories."
          </blockquote>
        </div>
      </section>

      <section className="px-6 md:px-14 py-20 max-w-7xl mx-auto border-b border-[#e5ddd4]">
        <div className="text-center max-w-xl mx-auto mb-16 flex flex-col items-center gap-2">
          <p className="uppercase tracking-[0.2em] text-[10px] font-bold text-stone-400">Our Promises</p>
          <h2 className="text-2xl md:text-3xl font-serif font-black italic text-stone-900">What We Stand For</h2>
          <div className="h-[2px] w-12 bg-amber-500 rounded-full mt-1" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-white border border-[#e5ddd4] rounded-2xl p-6 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-transparent group-hover:bg-amber-500 transition-colors" />
            <div className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center text-stone-700 mb-5 border border-stone-100">
              <FaLeaf className="text-sm" />
            </div>
            <h3 className="text-stone-900 font-bold text-base mb-2 tracking-tight">Premium Combed Fabrics</h3>
            <p className="text-stone-600 text-xs leading-relaxed">
              Sensitive skin deserves elite care. We meticulously select breathable, high-grade cottons and premium blends that feel soft instantly and soften even more with every wash.
            </p>
          </div>

          <div className="bg-white border border-[#e5ddd4] rounded-2xl p-6 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-transparent group-hover:bg-amber-500 transition-colors" />
            <div className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center text-stone-700 mb-5 border border-stone-100">
              <FaHeart className="text-sm" />
            </div>
            <h3 className="text-stone-900 font-bold text-base mb-2 tracking-tight">Elegance Meets Play</h3>
            <p className="text-stone-600 text-xs leading-relaxed">
              Kids never sit still, and their clothes shouldn't either. Our styles feature custom tailored waistbands, premium tags, and flexible stretch joints built explicitly for active play.
            </p>
          </div>

          <div className="bg-white border border-[#e5ddd4] rounded-2xl p-6 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-transparent group-hover:bg-amber-500 transition-colors" />
            <div className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center text-stone-700 mb-5 border border-stone-100">
              <FaShieldAlt className="text-sm" />
            </div>
            <h3 className="text-stone-900 font-bold text-base mb-2 tracking-tight">Uncompromising Quality</h3>
            <p className="text-stone-600 text-xs leading-relaxed">
              Every seam is double-locked, and every button is anchor-stitched. We build clothing items that survive playground tumbles and can easily be handed down to younger siblings.
            </p>
          </div>

        </div>
      </section>

      <section className="px-6 md:px-14 py-20 max-w-7xl mx-auto text-center">
        <div className="bg-stone-900 text-[#f7f3ee] rounded-3xl p-8 md:p-12 shadow-xl relative overflow-hidden flex flex-col items-center max-w-4xl mx-auto group">
          <div className="absolute inset-0 opacity-5 pointer-events-none border border-dashed border-white m-4 rounded-2xl" />
          
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-amber-400 mb-3">
            Explore the Edit
          </span>
          
          <h2 className="text-2xl md:text-4xl font-serif font-medium tracking-wide mb-6 max-w-md leading-tight">
            Ready to Upgrade Your Kid's Style Grid?
          </h2>
          
          <button className="bg-white text-stone-900 px-6 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase border border-transparent hover:bg-amber-500 hover:text-stone-900 transition-all duration-300 shadow-md flex items-center gap-2 group/btn">
            Explore Collections 
            <FaChevronRight className="text-[9px] transform translate-x-0 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

    </div>
  );
}

export default AboutUs;
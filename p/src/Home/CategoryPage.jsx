import { useNavigate } from "react-router-dom";
import girl from "../assets/girl.jpeg";
import boy from "../assets/boy.jpeg";
import baby from "../assets/baby.jpeg";

function CategoryPage() {
  const navigate = useNavigate();

  const categories = [
    {
      id: 1,
      name: "Baby",
      image: baby,
      subtitle: "Soft • Cozy • Cute",
      style: "bg-stone-900 text-[#f7f3ee]",
    },
    {
      id: 2,
      name: "Girls",
      image: girl,
      subtitle: "Elegant • Stylish • Trendy",
      style: "bg-white text-stone-900 border border-[#e5ddd4]",
    },
    {
      id: 3,
      name: "Boys",
      image: boy,
      subtitle: "Bold • Casual • Cool",
      style: "bg-stone-100 text-stone-800 border border-stone-200",
    },
  ];

  return (
    <div className="bg-[#f7f3ee] px-6 md:px-14 py-16 border-b border-[#e5ddd4]">

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 max-w-7xl mx-auto">
        <div className="flex flex-col gap-2">
          <p className="uppercase tracking-[0.25em] text-[10px] font-bold text-stone-500">
            Fashion Categories
          </p>

          <h1 className="text-3xl md:text-4xl font-serif font-black italic tracking-wide text-stone-900 leading-tight">
            Discover <br className="hidden md:block" />
            Trending Collections
          </h1>
          <div className="h-[2px] w-12 bg-amber-500 rounded-full mt-1" />
        </div>

        <p className="text-stone-600 max-w-sm text-xs sm:text-sm font-medium leading-relaxed">
          Curated outfits and trending fashion styles designed for comfort,
          elegance, and everyday wear.
        </p>
      </div>

      {/* CATEGORY GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">

        {categories.map((item, index) => (
          <div
            key={item.id}
            onClick={() => navigate(`/products/${item.name}`)}
            className="
              group relative overflow-hidden
              rounded-2xl
              cursor-pointer
              bg-white
              border border-[#e5ddd4]
              shadow-xs hover:shadow-lg
              transition-all duration-500
              hover:-translate-y-1.5
              opacity-0 translate-y-10
              animate-[fadeUp_0.7s_ease_forwards]
              w-full
            "
            style={{ animationDelay: `${index * 0.15}s` }}
          >

            {/* IMAGE AREA */}
            <div className="h-[300px] sm:h-[340px] md:h-[360px] lg:h-[400px] w-full bg-[#fcfaf7] flex items-center justify-center overflow-hidden relative">
              <img
                src={item.image}
                alt={item.name}
                className="
                  h-full w-auto object-contain
                  scale-105
                  group-hover:scale-115
                  transition duration-700 ease-out
                "
              />
              {/* Top ambient brand edge line active on card hover */}
              <div className="absolute top-0 left-0 w-full h-[3px] bg-transparent group-hover:bg-amber-500 transition-colors duration-300" />
            </div>

            {/* CONTENT CARD OVERLAY */}
            <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-stone-950/80 via-stone-950/30 to-transparent pt-16">

              {/* Subtitle Accent Pill */}
              <div className={`
                inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-wide mb-3 shadow-xs
                ${item.style}
              `}>
                {item.subtitle}
              </div>

              {/* Category Name */}
              <h2 className="text-white text-2xl font-serif font-bold tracking-wide mb-3">
                {item.name}
              </h2>

              {/* Action Button */}
              <button className="
                bg-white text-stone-900
                px-5 py-2 rounded-full
                text-xs font-bold tracking-wider uppercase
                border border-transparent
                group-hover:bg-stone-900 group-hover:text-white
                transition-all duration-300 shadow-sm
              ">
                Shop Now
              </button>

            </div>

          </div>
        ))}

      </div>

      {/* CORE CSS FADE ANIMATION ENGINE */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

    </div>
  );
}

export default CategoryPage;
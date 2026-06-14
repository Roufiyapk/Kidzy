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
      style: "bg-black text-white",
    },
    {
      id: 2,
      name: "Girls",
      image: girl,
      subtitle: "Elegant • Stylish • Trendy",
      style: "bg-pink-100 text-black",
    },
    {
      id: 3,
      name: "Boys",
      image: boy,
      subtitle: "Bold • Casual • Cool",
      style: "bg-blue-100 text-black",
    },
  ];

  return (
    <div className="bg-[#f7f3ee] px-5 md:px-20 py-14">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
        <div>
          <p className="uppercase tracking-[5px] text-sm text-gray-500 mb-2">
            Fashion Categories
          </p>

          <h1 className="text-4xl md:text-4xl font-bold leading-tight">
            Discover <br />
            Trending Collections
          </h1>
        </div>

        <p className="text-gray-600 max-w-md text-sm md:text-base">
          Curated outfits and trending fashion styles designed for comfort,
          elegance, and everyday wear.
        </p>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">

        {categories.map((item, index) => (
          <div
            key={item.id}
            onClick={() => navigate(`/products/${item.name}`)}
            className="
              group relative overflow-hidden
              rounded-[24px]
              cursor-pointer
              shadow-md hover:shadow-xl
              transition-all duration-500
              hover:-translate-y-1
              opacity-0 translate-y-10
              animate-[fadeUp_0.7s_ease_forwards]
              w-full
            "
            style={{ animationDelay: `${index * 0.2}s` }}
          >

            {/* IMAGE AREA (ONLY CHANGE HERE) */}
            <div className="h-[380px] w-full bg-gray-50 flex items-center justify-center overflow-hidden">

              <img
                src={item.image}
                alt={item.name}
                className="
                  h-full w-auto object-contain
                  scale-110
                  group-hover:scale-125
                  transition duration-700
                "
              />

            </div>

            {/* CONTENT */}
            <div className="absolute bottom-0 left-0 w-full p-5 bg-gradient-to-t from-black/70 via-black/10 to-transparent">

              <div className={`
                inline-block px-3 py-1.5 rounded-full text-xs font-semibold mb-3
                ${item.style}
              `}>
                {item.subtitle}
              </div>

              <h2 className="text-white text-2xl font-bold">
                {item.name}
              </h2>

              <button className="
                mt-3 bg-white text-black
                px-4 py-2 rounded-full
                text-sm font-semibold
                hover:bg-black hover:text-white
                transition-all duration-300
              ">
                Shop Now
              </button>

            </div>

          </div>
        ))}

      </div>

      {/* ANIMATION */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

    </div>
  );
}

export default CategoryPage;
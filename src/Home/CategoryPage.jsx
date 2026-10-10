import { useNavigate } from "react-router-dom";

function CategoryPage() {
  const navigate = useNavigate();

  const categories = [
    {
      id: 1,
      name: "Girls",
      image:
        "https://res.cloudinary.com/eydyeffr/image/upload/v1789900698/copy_of_whatsapp_image_2026-09-20_at_40057_pm.jpg",
      subtitle: "Cute • Stylish • Trendy",
      number: "01",
    },
    {
      id: 2,
      name: "Boys",
      image:
        "https://res.cloudinary.com/eydyeffr/image/upload/v1789900536/copy_of_boy.jpg",
      subtitle: "Cool • Casual • Fun",
      number: "02",
    },
    {
      id: 3,
      name: "Toys",
      image:
        "https://res.cloudinary.com/eydyeffr/image/upload/v1789903393/copy_of_cool_maker_stack_d_heishi_studio_bracelet_making_kit_with_easy_beading.jpg",
      subtitle: "Play • Learn • Explore",
      number: "03",
    },
    {
      id: 4,
      name: "School Supplies",
      image:
        "https://res.cloudinary.com/eydyeffr/image/upload/v1789904250/copy_of_school_accessories.jpg",
      subtitle: "Smart • Fun • Ready",
      number: "04",
    },
    {
      id: 5,
      name: "Footwear",
      image:
        "https://res.cloudinary.com/eydyeffr/image/upload/v1790011842/1_Par_de_T%C3%AAnis_Respir%C3%A1veis_de_Malha_para_Crian%C3%A7as_Meninas_Sapatos_Esportivos_Casuais_Brancos_com_e_Absor%C3%A7%C3%A3o_de_Impacto_para_o_Ver%C3%A3o.jpg",
      subtitle: "Comfy • Active • Stylish",
      number: "05",
    },
    {
      id: 6,
      name: "Books",
      image:
        "https://res.cloudinary.com/eydyeffr/image/upload/v1789904376/copy_of_book.jpg",
      subtitle: "Read • Learn • Imagine",
      number: "06",
    },
    {
      id: 7,
      name: "Kids Accessories",
      image:
        "https://res.cloudinary.com/eydyeffr/image/upload/v1789904317/copy_of_accessories.jpg",
      subtitle: "Cute • Fun • Everyday",
      number: "07",
    },
    {
      id: 8,
      name: "Kids Care",
      image:
        "https://res.cloudinary.com/eydyeffr/image/upload/v1791572851/Smiling_Baby_with_Blue_Knee_Pads.png",
      subtitle: "Gentle • Fresh • Caring",
      number: "08",
    },
  ];

  const handleShopNow = (categoryName) => {
    navigate(`/products/${encodeURIComponent(categoryName)}`);
  };

  return (
    <section className="w-full bg-[#FBF9F6] px-4 sm:px-6 md:px-8 py-7 md:py-9 border-b border-[#EAE2D8]">
      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-5 md:mb-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div className="flex flex-col gap-1.5">
            <p className="uppercase tracking-[0.3em] text-[10px] font-semibold text-[#A18468]">
              THE WORLD OF KIDZY
            </p>

            <h1 className="text-3xl sm:text-4xl font-serif font-medium tracking-tight text-[#49372B] leading-tight">
              Discover Our Collections
            </h1>

            <div className="h-[2px] w-10 bg-[#B69A7B] mt-1" />
          </div>

          <p className="text-[#817467] max-w-md text-xs sm:text-sm font-normal leading-relaxed">
            Thoughtfully chosen little essentials for every moment of
            childhood — from everyday fashion to playful discoveries.
          </p>
        </div>
      </div>

      {/* CATEGORY AREA */}
      <div className="max-w-[1000px] mx-auto">
        {/* FIRST ROW — 5 CATEGORIES */}
        <div
          className="
            grid
            grid-cols-2
            sm:grid-cols-3
            md:grid-cols-5
            gap-2
            sm:gap-2.5
            justify-items-center
          "
        >
          {categories.slice(0, 5).map((item, index) => (
            <CategoryCard
              key={item.id}
              item={item}
              index={index}
              onShop={handleShopNow}
            />
          ))}
        </div>

        {/* SECOND ROW — 3 CENTERED CATEGORIES */}
        <div className="mt-2 sm:mt-2.5 flex justify-center gap-2 sm:gap-2.5">
          {categories.slice(5, 8).map((item, index) => (
            <CategoryCard
              key={item.id}
              item={item}
              index={index + 5}
              onShop={handleShopNow}
            />
          ))}
        </div>
      </div>

      {/* ANIMATION */}
      <style>{`
        @keyframes categoryFadeUp {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}

function CategoryCard({ item, index, onShop }) {
  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onShop(item.name);
    }
  };

  return (
    <article
      onClick={() => onShop(item.name)}
      onKeyDown={handleKeyDown}
      role="link"
      tabIndex={0}
      aria-label={`Explore ${item.name} collection`}
      className="
        group
        relative
        overflow-hidden
        rounded-xl
        cursor-pointer
        bg-[#F2ECE4]
        border
        border-[#E6DCCF]
        shadow-sm
        hover:shadow-lg
        transition-all
        duration-500
        hover:-translate-y-1
        opacity-0
        translate-y-3
        animate-[categoryFadeUp_0.65s_ease_forwards]
        w-full
        max-w-[175px]
        aspect-[9/13]
        focus-visible:outline
        focus-visible:outline-2
        focus-visible:outline-offset-2
        focus-visible:outline-[#A18468]
      "
      style={{
        animationDelay: `${index * 0.07}s`,
      }}
    >
      {/* CATEGORY IMAGE */}
      <img
        src={item.image}
        alt={item.name}
        loading={index < 4 ? "eager" : "lazy"}
        className="
          absolute
          inset-0
          w-full
          h-full
          object-cover
          transition-transform
          duration-700
          ease-out
          group-hover:scale-105
        "
      />

      {/* SOFT EDITORIAL OVERLAY */}
      <div
        className="
          absolute
          inset-0
          bg-gradient-to-t
          from-[#211812]/85
          via-[#30251D]/20
          to-transparent
        "
      />

      {/* TOP CATEGORY NUMBER */}
      <div className="absolute top-2.5 left-2.5">
        <span
          className="
            flex
            items-center
            justify-center
            w-7
            h-7
            rounded-full
            bg-[#FBF7F1]/90
            text-[#6B503B]
            text-[9px]
            font-medium
            tracking-wider
            backdrop-blur-sm
          "
        >
          {item.number}
        </span>
      </div>

      {/* SUBTLE TOP ACCENT */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-transparent group-hover:bg-[#C4A582] transition-colors duration-300" />

      {/* CARD CONTENT */}
      <div className="absolute bottom-0 left-0 w-full p-3 sm:p-3.5">
        {/* SUBTITLE */}
        <p
          className="
            text-[#F0DCC3]
            text-[8px]
            sm:text-[9px]
            font-medium
            tracking-wide
            mb-1.5
          "
        >
          {item.subtitle}
        </p>

        {/* CATEGORY TITLE */}
        <h2
          className="
            text-white
            text-base
            sm:text-lg
            font-serif
            font-medium
            tracking-wide
            leading-tight
            mb-2.5
          "
        >
          {item.name}
        </h2>

        {/* DIVIDER */}
        <div className="w-full h-px bg-white/35 mb-2.5" />

        {/* SHOP NOW */}
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onShop(item.name);
          }}
          className="
            inline-flex
            items-center
            gap-2
            bg-transparent
            text-white
            text-[8px]
            sm:text-[9px]
            font-semibold
            tracking-[0.12em]
            uppercase
            transition-all
            duration-300
            group-hover:text-[#F0DCC3]
          "
        >
          Shop Now

          <span className="text-sm leading-none transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </button>
      </div>
    </article>
  );
}

export default CategoryPage;
import { useNavigate } from "react-router-dom";

function CategoryPage() {
  const navigate = useNavigate();

  const categories = [
    {
      id: 1,
      name: "Girls",
      image: "https://res.cloudinary.com/eydyeffr/image/upload/v1789900698/copy_of_whatsapp_image_2026-09-20_at_40057_pm.jpg",
      subtitle: "Cute • Stylish • Trendy",
    },
    {
      id: 2,
      name: "Boys",
      image: "https://res.cloudinary.com/eydyeffr/image/upload/v1789900536/copy_of_boy.jpg",
      subtitle: "Cool • Casual • Fun",
    },
    {
      id: 3,
      name: "Toys",
      image:"https://res.cloudinary.com/eydyeffr/image/upload/v1789903393/copy_of_cool_maker_stack_d_heishi_studio_bracelet_making_kit_with_easy_beading.jpg",
      subtitle: "Play • Learn • Explore",
    },
    {
      id: 4,
      name: "School Supplies",
      image:"https://res.cloudinary.com/eydyeffr/image/upload/v1789904250/copy_of_school_accessories.jpg",
      subtitle: "Smart • Fun • Ready",
    },
    {
      id: 5,
      name: "Footwear",
      image:"https://res.cloudinary.com/eydyeffr/image/upload/v1789904506/copy_of_footware.jpg",
      subtitle: "Comfy • Active • Stylish",
    },
    {
      id: 6,
      name: "Books",
      image:"https://res.cloudinary.com/eydyeffr/image/upload/v1789904376/copy_of_book.jpg",
      subtitle: "Read • Learn • Imagine",
    },
    {
      id: 7,
      name: "Kids Accessories",
      image:"https://res.cloudinary.com/eydyeffr/image/upload/v1789904317/copy_of_accessories.jpg",
      subtitle: "Cute • Fun • Everyday",
    },
    {
      id: 8,
      name: "Kids Care",
      image:"https://res.cloudinary.com/eydyeffr/image/upload/v1789904458/copy_of_kidscare.jpg",
      subtitle: "Gentle • Fresh • Caring",
    },
  ];

  const handleShopNow = (categoryName) => {
    navigate(`/products/${encodeURIComponent(categoryName)}`);
  };

  return (
    <section className="w-full bg-white px-4 sm:px-6 md:px-8 lg:px-10 py-10 md:py-14 border-b border-[#e5ddd4]">

      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-8 md:mb-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">

          <div className="flex flex-col gap-2">
            <p className="uppercase tracking-[0.25em] text-[10px] font-bold text-stone-500">
              Explore Kidzy
            </p>

            <h1 className="text-3xl sm:text-4xl font-serif font-black italic tracking-wide text-stone-900 leading-tight">
              Discover Our Collections
            </h1>

            <div className="h-[2px] w-12 bg-amber-500 rounded-full mt-1" />
          </div>

          <p className="text-stone-500 max-w-md text-xs sm:text-sm font-medium leading-relaxed">
            Discover fun, useful, and everyday essentials for kids — from
            fashion and toys to books, school supplies, accessories, and care.
          </p>

        </div>
      </div>

      {/* CATEGORY AREA */}
      <div className="max-w-[1150px] mx-auto">

        {/* FIRST ROW - 5 */}
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

        {/* SECOND ROW - 3 CENTERED */}
        <div
          className="
            mt-2
            sm:mt-2.5
            flex
            justify-center
            gap-2
            sm:gap-2.5
          "
        >
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
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(30px);
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
  return (
    <div
      onClick={() => onShop(item.name)}
      className="
        group
        relative
        overflow-hidden
        rounded-2xl
        cursor-pointer
        bg-white
        border
        border-[#e5ddd4]
        shadow-sm
        hover:shadow-xl
        transition-all
        duration-500
        hover:-translate-y-1.5
        opacity-0
        translate-y-8
        animate-[fadeUp_0.7s_ease_forwards]
        w-full
        max-w-[210px]
        aspect-[9/16]
      "
      style={{
        animationDelay: `${index * 0.08}s`,
      }}
    >

      {/* IMAGE */}
      <img
        src={item.image}
        alt={item.name}
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

      {/* GRADIENT */}
      <div
        className="
          absolute
          inset-0
          bg-gradient-to-t
          from-black/80
          via-black/20
          to-transparent
        "
      />

      {/* TOP HOVER LINE */}
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

      {/* CONTENT */}
      <div className="absolute bottom-0 left-0 w-full p-3 sm:p-4">

        {/* SUBTITLE */}
        <div
          className="
            inline-block
            bg-white
            text-stone-900
            px-2.5
            py-1
            rounded-full
            text-[8px]
            sm:text-[9px]
            font-bold
            tracking-wide
            mb-2
          "
        >
          {item.subtitle}
        </div>

        {/* CATEGORY NAME */}
        <h2
          className="
            text-white
            text-base
            sm:text-lg
            font-serif
            font-bold
            leading-tight
            mb-2.5
          "
        >
          {item.name}
        </h2>

        {/* SHOP NOW */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onShop(item.name);
          }}
          className="
            bg-white
            text-stone-900
            px-3.5
            py-1.5
            rounded-full
            text-[8px]
            sm:text-[9px]
            font-bold
            tracking-wider
            uppercase
            hover:bg-stone-900
            hover:text-white
            transition-all
            duration-300
          "
        >
          Shop Now
        </button>

      </div>
    </div>
  );
}

export default CategoryPage;
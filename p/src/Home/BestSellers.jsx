import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { FaHeart, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { addToWishlist, removeFromWishlist } from "../redux/wishlistSlice";
import { addWishlistItem, removeWishlistItem } from "../api/wishlistApi";

function BestSellers() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const wishlistItems = useSelector((state) => state.wishlist.items);
  const user = JSON.parse(localStorage.getItem("user"));

  const handleWishlist = async (item, isInWishlist) => {
    if (!user) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }

    try {
      if (isInWishlist) {
        dispatch(removeFromWishlist(item.id));
        await removeWishlistItem(item.id, user.id);
        toast.success("Removed from wishlist");
      } else {
        dispatch(addToWishlist({ ...item, productId: item.id }));
        await addWishlistItem({ ...item, productId: item.id, userId: user.id });
        toast.success("Added to wishlist");
      }
    } catch (error) {
      console.error(error);
      toast.error("Wishlist error");
    }
  };

  const { data: bestSellers = [], isLoading, error } = useQuery({
    queryKey: ["bestSellers"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3001/products?bestSeller=true");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth"
      });
    }
  };

  if (isLoading) return <p className="text-center py-20 font-medium text-stone-500">Loading...</p>;
  if (error) return <p className="text-center py-20 text-red-500">Error loading products</p>;

  return (
    <div className="bg-[#f7f3ee] px-6 md:px-14 py-16 border-b border-[#e5ddd4]">
      <div className="max-w-7xl mx-auto relative">

        {/* HEADER */}
        <div className="flex items-baseline justify-between mb-10 pl-2">
          <div className="flex flex-col gap-1">
            <p className="uppercase tracking-[0.2em] text-[10px] font-bold text-stone-400">
              Most Loved
            </p>
            <h2 className="text-2xl md:text-3xl font-serif font-black italic tracking-wide text-stone-900">
              Best Sellers
            </h2>
            <div className="h-[2px] w-12 bg-amber-500 rounded-full mt-1" />
          </div>

          {/* Navigation Controls */}
          <div className="flex gap-2">
            <button
              onClick={() => handleScroll("left")}
              className="w-9 h-9 rounded-full bg-white border border-[#e5ddd4] flex items-center justify-center cursor-pointer text-stone-700 hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all shadow-xs"
            >
              <FaChevronLeft className="text-xs" />
            </button>
            <button
              onClick={() => handleScroll("right")}
              className="w-9 h-9 rounded-full bg-white border border-[#e5ddd4] flex items-center justify-center cursor-pointer text-stone-700 hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all shadow-xs"
            >
              <FaChevronRight className="text-xs" />
            </button>
          </div>
        </div>

        {/* PRODUCT HORIZONTAL LIST CONTAINER */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-6 px-2 scroll-smooth snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {bestSellers.map((item) => {
            const isInWishlist = wishlistItems.some(
              (w) => String(w.id) === String(item.id) || String(w.productId ?? w.id) === String(item.id)
            );

            return (
              <div
                key={item.id}
                onClick={() => navigate(`/product/${item.id}`)}
                className="group relative min-w-[250px] sm:min-w-[280px] md:min-w-[300px] flex-shrink-0 snap-start cursor-pointer bg-white rounded-2xl border border-[#e5ddd4] overflow-hidden shadow-xs hover:shadow-md transition-all duration-300"
              >
                {/* IMAGE AREA */}
                <div className="h-[280px] w-full bg-[#fcfaf7] flex items-center justify-center overflow-hidden relative border-b border-stone-100">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-[85%] w-auto object-contain scale-100 group-hover:scale-105 transition duration-500 ease-out"
                  />

                  {/* Ambient top border banner dynamic visual effect */}
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-transparent group-hover:bg-amber-500 transition-colors duration-300" />

                  {/* Best Seller Micro Badge */}
                  <div className="absolute top-4 left-4 bg-stone-900 text-[#f7f3ee] px-2.5 py-1 rounded-md text-[9px] font-bold tracking-wider uppercase shadow-sm">
                    Best Seller
                  </div>

                  {/* Wishlist Interactive Toggle Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleWishlist(item, isInWishlist);
                    }}
                    className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center border border-stone-100 hover:bg-white shadow-xs transition-transform active:scale-90"
                  >
                    <FaHeart
                      className={`text-sm transition-colors ${
                        isInWishlist ? "text-red-500" : "text-stone-400 hover:text-stone-600"
                      }`}
                    />
                  </button>
                </div>

                {/* TEXT METADATA CONTENT INFO */}
                <div className="p-4 flex flex-col justify-between bg-white">
                  <div className="mb-2">
                    <h3 className="text-stone-900 font-bold text-sm tracking-tight line-clamp-1 group-hover:text-amber-600 transition-colors">
                      {item.name}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between mt-1 pt-1">
                    <p className="text-base font-black text-stone-900 font-mono">
                      ₹{item.price}
                    </p>

                    <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400 group-hover:text-stone-900 transition-colors flex items-center gap-1">
                      Explore 
                      <span className="transform translate-x-0 group-hover:translate-x-1 transition-transform duration-300">→</span>
                    </span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

export default BestSellers;
import { useQuery } from "@tanstack/react-query";
import { FaHeart } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
  addToWishlist,
  removeFromWishlist,
} from "../redux/wishlistSlice";

import {
  addWishlistItem,
  removeWishlistItem,
} from "../api/wishlistApi";

function BestSellers() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const wishlistItems = useSelector(
    (state) => state.wishlist.items
  );

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
        dispatch(
          addToWishlist({
            ...item,
            productId: item.id,
          })
        );

        await addWishlistItem({
          ...item,
          productId: item.id,
          userId: user.id,
        });

        toast.success("Added to wishlist");
      }
    } catch (error) {
      console.error(error);
      toast.error("Wishlist error");
    }
  };

  // FETCH ONLY bestSeller = true PRODUCTS
  const {
    data: bestSellers = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["bestSellers"],

    queryFn: async () => {
      const res = await fetch(
        "http://localhost:3001/products?bestSeller=true"
      );

      if (!res.ok) {
        throw new Error("Failed to fetch");
      }

      return res.json();
    },
  });

  if (isLoading) {
    return (
      <p className="text-center py-10">
        Loading...
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-center py-10">
        Error loading products
      </p>
    );
  }

  return (
    <div className="bg-[#f7f3ee] px-6 md:px-20 py-20 overflow-hidden">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-14">

        <div>
          <p className="uppercase tracking-[6px] text-sm text-gray-500 mb-4">
            Most Loved
          </p>

          <h2 className="text-4xl font-bold leading-tight">
            Best Sellers
          </h2>
        </div>

        <p className="max-w-lg text-gray-600 text-sm md:text-base">
          Discover our most popular styles loved
          for their premium quality and comfort.
        </p>

      </div>

      {/* PRODUCTS */}
      <div className="flex gap-8 overflow-x-auto pb-5 scroll-smooth snap-x snap-mandatory [&::-webkit-scrollbar]:hidden">

        {bestSellers.map((item, index) => {

          const isInWishlist = wishlistItems.some(
            (w) =>
              String(w.id) === String(item.id) ||
              String(w.productId ?? w.id) ===
                String(item.id)
          );

          return (
            <div
              key={item.id}
              onClick={() =>
                navigate(`/product/${item.id}`)
              }
              className={`
                group relative
                min-w-[260px] md:min-w-[310px]
                flex-shrink-0 snap-start
                cursor-pointer
                ${index % 2 === 0 ? "mt-0" : "mt-8"}
              `}
            >

              <div
                className="
                  relative overflow-hidden
                  rounded-[30px]
                  bg-white
                  shadow-lg hover:shadow-2xl
                  transition-all duration-500
                  hover:-translate-y-2
                "
              >

                {/* IMAGE */}
                <div className="h-[280px] bg-gray-50 flex items-center justify-center overflow-hidden relative">

                  <img
                    src={item.image}
                    alt={item.name}
                    className="
                      max-h-full max-w-full
                      object-contain
                      transition duration-700
                      group-hover:scale-105
                    "
                  />

                  {/* OVERLAY */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* BADGE */}
                  <div className="absolute top-4 left-4 bg-white text-black px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wide">
                    BEST SELLER
                  </div>

                  {/* WISHLIST */}
                  <FaHeart
                    onClick={(e) => {
                      e.stopPropagation();
                      handleWishlist(
                        item,
                        isInWishlist
                      );
                    }}
                    className={`
                      absolute top-4 right-4 z-20 text-xl
                      cursor-pointer
                      ${
                        isInWishlist
                          ? "text-red-500"
                          : "text-white"
                      }
                    `}
                  />

                  {/* CONTENT */}
                  <div className="absolute bottom-0 left-0 w-full p-5 text-white">

                    <h3 className="text-2xl font-bold line-clamp-1">
                      {item.name}
                    </h3>

                    <div className="flex items-center justify-between mt-3">

                      <p className="text-xl font-semibold">
                        ₹{item.price}
                      </p>

                      <button
                        className="
                          bg-white text-black
                          px-4 py-2 rounded-full
                          text-xs font-semibold
                          hover:bg-black hover:text-white
                          transition-all duration-300
                        "
                      >
                        Explore
                      </button>

                    </div>

                  </div>

                </div>

              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
}

export default BestSellers;
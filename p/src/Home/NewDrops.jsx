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

function NewDrops() {

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const wishlistItems = useSelector(
    (state) => state.wishlist.items
  );

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  // =========================
  // WISHLIST FUNCTION
  // =========================

  const handleWishlist = (
    item,
    isInWishlist
  ) => {

    if (!user) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }

    if (isInWishlist) {

      dispatch(removeFromWishlist(item.id));

      removeWishlistItem(
        item.id,
        user.id
      ).catch(console.error);

      toast.success("Removed from wishlist");

    } else {

      dispatch(
        addToWishlist({
          ...item,
          productId: item.id,
        })
      );

      addWishlistItem({
        ...item,
        productId: item.id,
        userId: user.id,
      }).catch(console.error);

      toast.success("Added to wishlist");
    }
  };

  // =========================
  // FETCH ONLY newArrival:true
  // =========================

  const {
    data = [],
    isLoading,
    error,
  } = useQuery({

    queryKey: ["newDrops"],

    queryFn: async () => {

      const res = await fetch(
        "http://localhost:3001/products"
      );

      if (!res.ok) {
        throw new Error(
          "Failed to fetch products"
        );
      }

      const products = await res.json();

      // FILTER ONLY NEW ARRIVALS
      return products.filter(
        (item) => item.newArrival === true
      );
    },
  });

  // =========================
  // LOADING
  // =========================

  if (isLoading) {
    return (
      <p className="text-center py-10">
        Loading...
      </p>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error) {
    return (
      <p className="text-center py-10">
        Error loading products
      </p>
    );
  }

  // =========================
  // UI
  // =========================

  return (

    <div className="px-6 md:px-20 py-16 bg-[#f7f3ee] overflow-hidden">

      {/* HEADER */}

      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">

        <div>

          <p className="uppercase tracking-[6px] text-sm text-gray-500 mb-4">
            Latest Fashion
          </p>

          <h2 className="text-5xl md:text-4xl font-bold leading-tight">
            New <br /> Drops
          </h2>

        </div>

        <p className="max-w-lg text-gray-600 text-sm md:text-base">
          Fresh arrivals with modern style and comfort.
        </p>

      </div>

      {/* PRODUCTS */}

      <div className="flex gap-5 overflow-x-auto pb-5 snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden">

        {data.map((item, index) => {

          const isInWishlist =
            wishlistItems.some(
              (w) =>
                String(w.id) ===
                  String(item.id) ||
                String(
                  w.productId ?? w.id
                ) === String(item.id)
            );

          return (

            <div
              key={item.id}

              onClick={() =>
                navigate(
                  `/product/${item.id}`
                )
              }

              className={`
                group relative
                min-w-[220px]
                md:min-w-[250px]
                flex-shrink-0
                snap-start
                cursor-pointer
                ${
                  index % 2 === 0
                    ? "mt-0"
                    : "mt-6"
                }
              `}
            >

              <div
                className="
                  bg-white
                  rounded-[24px]
                  overflow-hidden
                  border border-[#ebe5dd]
                  hover:border-black
                  transition-all duration-500
                  hover:-translate-y-2
                  shadow-sm hover:shadow-xl
                "
              >

                {/* IMAGE */}

                <div className="relative overflow-hidden bg-[#f1ece6]">

                  <img
                    src={item.image}
                    alt={item.name}
                    className="
                      w-full
                      h-[260px]
                      object-cover
                      group-hover:scale-105
                      transition duration-700
                    "
                  />

                  {/* BADGE */}

                  <div className="absolute top-3 left-3 bg-black text-white px-3 py-1 rounded-full text-[10px] font-semibold">
                    NEW
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
                      absolute top-3 right-3
                      text-lg cursor-pointer
                      ${
                        isInWishlist
                          ? "text-red-500"
                          : "text-white"
                      }
                    `}
                  />

                </div>

                {/* CONTENT */}

                <div className="p-4">

                  <h3 className="text-lg font-semibold line-clamp-1">
                    {item.name}
                  </h3>

                  <div className="mt-3 flex items-center justify-between">

                    <p className="text-base font-bold">
                      ₹{item.price}
                    </p>

                    <button
                      className="
                        px-3 py-1.5
                        rounded-full
                        border border-black
                        text-xs font-semibold
                        hover:bg-black
                        hover:text-white
                        transition
                      "
                    >
                      View
                    </button>

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

export default NewDrops;
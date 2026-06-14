import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHeart } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import {
  addToWishlist,
  removeFromWishlist,
} from "../redux/wishlistSlice";

import {
  addWishlistItem,
  removeWishlistItem,
} from "../api/wishlistApi";

function NewArrival() {
  const [newDrops, setNewDrops] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const wishlistItems = useSelector(
    (state) => state.wishlist.items
  );

  const user = JSON.parse(localStorage.getItem("user"));

  // =========================
  // WISHLIST
  // =========================

  const handleWishlist = (item, isInWishlist) => {
    if (!user) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }

    if (isInWishlist) {
      dispatch(removeFromWishlist(item.id));

      removeWishlistItem(item.id, user.id)
        .then(() => {
          toast.success("Removed from wishlist");
        })
        .catch((err) => {
          console.error(err);
        });

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
      })
        .then(() => {
          toast.success("Added to wishlist");
        })
        .catch((err) => {
          console.error(err);
        });
    }
  };

  // =========================
  // FETCH NEW ARRIVAL PRODUCTS
  // =========================

  useEffect(() => {
    fetch("http://localhost:3001/products")
      .then((res) => res.json())
      .then((data) => {

        // ONLY FETCH newArrival:true PRODUCTS
        const filteredProducts = data.filter(
          (item) => item.newArrival === true
        );

        setNewDrops(filteredProducts);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setLoading(false);
      });
  }, []);

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <p className="text-center mt-10">
        Loading New Arrivals...
      </p>
    );
  }

  // =========================
  // UI
  // =========================

  return (
    <div className="px-4 sm:px-6 md:px-12 py-10 bg-[#f7f3ee]">

      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center sm:text-left">
        New Arrivals
      </h1>

      {newDrops.length === 0 ? (
        <p className="text-gray-500 text-center">
          No New Arrivals Found
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 place-items-center">

          {newDrops.map((item) => {

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
                className="w-full max-w-[320px] p-3 relative bg-white shadow rounded-2xl cursor-pointer hover:shadow-xl transition"
              >

                {/* IMAGE */}

                <div className="relative w-full h-[220px] sm:h-[240px] md:h-[260px] flex items-center justify-center bg-gray-50 rounded-xl overflow-hidden">

                  <img
                    src={item.image}
                    alt={item.name}
                    className="max-h-full max-w-full object-contain hover:scale-105 transition duration-500"
                  />

                  {/* WISHLIST */}

                  <FaHeart
                    onClick={(e) => {
                      e.stopPropagation();

                      handleWishlist(
                        item,
                        isInWishlist
                      );
                    }}
                    className={`absolute top-3 right-3 text-2xl z-20 cursor-pointer ${
                      isInWishlist
                        ? "text-red-500"
                        : "text-gray-300"
                    }`}
                  />

                </div>

                {/* PRODUCT NAME */}

                <h2 className="mt-3 font-semibold text-center text-sm sm:text-base line-clamp-1">
                  {item.name}
                </h2>

                {/* PRICE */}

                <p className="text-center text-sm sm:text-base font-bold mt-1">
                  ₹{item.price}
                </p>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default NewArrival;
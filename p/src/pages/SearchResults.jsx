import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

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

function SearchResults() {
  const { query } = useParams();
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist.items);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetch("http://localhost:3001/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  }, []);

  const filteredProducts = products.filter((item) => {
    const text = query?.toLowerCase().trim() || "";
    const name = item.name?.toLowerCase() || "";
    const category = item.category?.toLowerCase() || "";
    const keywords = item.keywords || [];

    return (
      name.includes(text) ||
      category.includes(text) ||
      keywords.some((word) =>
        word.toLowerCase().includes(text)
      )
    );
  });

  const handleWishlist = (item, isInWishlist) => {
    if (!user) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }

    if (isInWishlist) {
      dispatch(removeFromWishlist(item.id));
      removeWishlistItem(item.id, user.id).catch(console.error);
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

  useEffect(() => {
    const handlePopState = () => {
      navigate("/", { replace: true });
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <h1 className="text-2xl font-semibold">
          Loading Results...
        </h1>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 md:px-12 py-10 bg-[#f7f3ee]  min-h-screen">

      <h1 className="text-2xl sm:text-3xl font-bold mb-2">
        Search Results
      </h1>

      <p className="text-gray-500 mb-8">
        Result for:
        <span className="font-semibold text-black ml-2">
          "{query}"
        </span>
      </p>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-20">
          <h2 className="text-2xl font-semibold">
            No Products Found
          </h2>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 place-items-center">

          {filteredProducts.map((item) => {
            const isInWishlist = wishlistItems.some(
              (w) =>
                String(w.id) === String(item.id) ||
                String(w.productId ?? w.id) === String(item.id)
            );

            return (
              <div
                key={item.id}
                onClick={() => navigate(`/product/${item.id}`)}
                className="w-full max-w-[320px] p-3 relative bg-white shadow rounded-2xl cursor-pointer hover:shadow-xl transition"
              >

                {/* IMAGE (MATCH PRODUCT PAGE STYLE) */}
                <div className="relative w-full h-[220px] sm:h-[240px] md:h-[260px] flex items-center justify-center bg-gray-50 rounded-xl overflow-hidden">

                  <img
                    src={item.image}
                    alt={item.name}
                    className="max-h-full max-w-full object-contain hover:scale-105 transition duration-500"
                  />

                  <FaHeart
                    onClick={(e) => {
                      e.stopPropagation();
                      handleWishlist(item, isInWishlist);
                    }}
                    className={`absolute top-3 right-3 text-2xl z-20 ${
                      isInWishlist ? "text-red-500" : "text-gray-300"
                    }`}
                  />

                </div>

                {/* TEXT */}
                <h2 className="mt-3 text-center font-semibold text-sm sm:text-base line-clamp-1">
                  {item.name}
                </h2>

                <p className="text-center font-bold mt-1 text-sm sm:text-base">
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

export default SearchResults;
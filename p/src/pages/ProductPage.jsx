import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addToWishlist, removeFromWishlist } from "../redux/wishlistSlice";
import { addWishlistItem, removeWishlistItem } from "../api/wishlistApi";
import { FaHeart, FaBars } from "react-icons/fa";

function ProductPage() {
  const { category } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const user = JSON.parse(localStorage.getItem("user"));
  const wishlistItems = useSelector((state) => state.wishlist.items);

  const [selectedAge, setSelectedAge] = useState("All");
  const [sortOpen, setSortOpen] = useState(false);
  const [sortType, setSortType] = useState("");

  const { data: products = [], isLoading, isError } = useQuery({
    queryKey: ["products", category],
    queryFn: async () => {
      const res = await fetch(
        `http://localhost:3001/products?category=${category}`
      );
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
  });

  const addMutation = useMutation({
    mutationFn: addWishlistItem,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["wishlist", user?.id],
      });
    },
  });

  const removeMutation = useMutation({
    mutationFn: ({ id, userId }) => removeWishlistItem(id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["wishlist", user?.id],
      });
    },
  });

  const handleWishlist = (item, isInWishlist) => {
    if (!user) return navigate("/login");

    if (isInWishlist) {
      dispatch(removeFromWishlist(item.id));
      removeMutation.mutate({ id: item.id, userId: user.id });
    } else {
      dispatch(addToWishlist({ ...item, productId: item.id }));
      addMutation.mutate({ ...item, userId: user.id });
    }
  };

  //  AGE FILTER SYSTEM (FIXED)
  const ageFilters = {
    boys: ["All", "0-2 Years", "2-6 Years", "6-10 Years"],
    girls: ["All", "0-2 Years", "2-6 Years", "6-10 Years"],
    baby: ["All", "0-6 Months", "6-12 Months"],
  };



    const visibleProducts = products.filter((item) => !item.deleted);


    const filteredProducts = visibleProducts
    .filter((item) => {
      if (selectedAge === "All") return true;
      return item.age === selectedAge;
    })
    .sort((a, b) => {
      if (sortType === "low-high") return a.price - b.price;
      if (sortType === "high-low") return b.price - a.price;
      return 0;
    });

  if (isLoading)
    return (
      <h1 className="text-center mt-20 text-lg sm:text-xl bg-white">
        Loading Products...
      </h1>
    );

  if (isError)
    return (
      <h1 className="text-center mt-20 text-red-500 text-lg bg-white">
        Error loading products
      </h1>
    );

  return (
    <div className="px-4 sm:px-6 md:px-12 py-6 sm:py-10 bg-[#f7f3ee] min-h-screen">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center w-full sm:w-auto capitalize">
          {category} Collection
        </h1>

        <div className="relative self-end sm:self-auto">
          <FaBars
            className="text-xl sm:text-2xl cursor-pointer"
            onClick={() => setSortOpen(!sortOpen)}
          />

          {sortOpen && (
            <div className="absolute right-0 top-8 bg-white shadow-lg border rounded w-44 sm:w-48 z-50 text-sm">
              <button
                onClick={() => {
                  setSortType("low-high");
                  setSortOpen(false);
                }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Low → High
              </button>

              <button
                onClick={() => {
                  setSortType("high-low");
                  setSortOpen(false);
                }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                High → Low
              </button>

              <button
                onClick={() => {
                  setSortType("");
                  setSortOpen(false);
                }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Reset
              </button>
            </div>
          )}
        </div>
      </div>

      {/* AGE FILTER BUTTONS */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8 sm:mb-10">

        {(ageFilters[category?.toLowerCase()] || ["All"]).map((age) => (
          <button
            key={age}
            onClick={() => setSelectedAge(age)}
            className={`px-3 sm:px-5 py-2 rounded-full border text-xs sm:text-sm transition ${
              selectedAge === age
                ? "bg-black text-white border-black"
                : "bg-white text-black hover:bg-gray-100"
            }`}
          >
            {age}
          </button>
        ))}

      </div>

      {/* PRODUCTS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 place-items-center">

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
              className="w-full max-w-[320px] p-3 relative shadow rounded-2xl bg-white cursor-pointer hover:shadow-xl transition-all duration-300"
            >
              <div className="relative w-full h-[220px] sm:h-[240px] md:h-[260px] flex items-center justify-center bg-gray-50 rounded-xl">

                <FaHeart
                  onClick={(e) => {
                    e.stopPropagation();
                    handleWishlist(item, isInWishlist);
                  }}
                  className={`absolute top-3 right-3 text-2xl z-10 ${
                    isInWishlist ? "text-red-500" : "text-gray-300"
                  }`}
                />

                <img
                  src={item.image}
                  alt={item.name}
                  className="max-h-full max-w-full object-contain rounded-xl hover:scale-105 transition duration-500"
                />

                {item.sizes?.every(
  (size) => size.stock === 0
) && (
  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
    <p className="text-white font-bold text-lg">
      OUT OF STOCK
    </p>
  </div>
)}
              </div>

              <h2 className="mt-4 font-semibold text-center text-sm sm:text-base line-clamp-1">
                {item.name}
              </h2>

              <p className="text-gray-600 text-center mt-1 text-sm">
                ₹{item.price}
              </p>
            </div>
          );
        })}

      </div>
    </div>
  );
}

export default ProductPage;
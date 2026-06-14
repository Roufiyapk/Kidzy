import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  fetchWishlist,
  removeWishlistItem,
} from "../api/wishlistApi";

import { removeFromWishlist } from "../redux/wishlistSlice";
import { addToCart } from "../redux/cartSlice";
import { toast } from "react-toastify";

function Wishlist() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const user = JSON.parse(localStorage.getItem("user"));

  const { data = [], isLoading, isError } = useQuery({
    queryKey: ["wishlist", user.id],
    queryFn: () => fetchWishlist(user.id),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => removeWishlistItem(id, user.id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries(["wishlist", user.id]);
      dispatch(removeFromWishlist(id));
    },
  });

  const handleMoveToCart = async (item) => {
    try {
      const res = await fetch("http://localhost:3001/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...item,
          qty: 1,
          productId: item.productId || item.id,
          userId: user.id,
        }),
      });

      if (!res.ok) throw new Error("Failed to add cart");

      const data = await res.json();

      dispatch(addToCart(data));
      deleteMutation.mutate(item.productId || item.id);

      toast.success("Moved to cart");
    } catch (err) {
      console.error(err);
      toast.error("Failed to move to cart");
    }
  };

  if (isLoading) {
    return (
      <h2 className="text-center mt-10 text-sm sm:text-base">
        Loading...
      </h2>
    );
  }

  if (isError) {
    return (
      <h2 className="text-center mt-10 text-sm sm:text-base">
        Error loading wishlist
      </h2>
    );
  }

  return (
    <div className="px-4 sm:px-6 md:px-12 py-10 bg-[#f7f3ee] ">

      <h1 className="text-2xl sm:text-3xl font-semibold mb-8 text-center">
        Wishlist
      </h1>

      {data.length === 0 ? (
        <p className="text-center text-gray-500">
          No wishlist items
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

          {data.map((item) => (
            <div
              key={item.id}
              className="w-full max-w-[300px] mx-auto bg-white shadow rounded-2xl hover:shadow-xl transition p-3"
            >

              {/* CLICK AREA → PRODUCT DETAILS */}
              <div
                onClick={() => navigate(`/product/${item.productId || item.id}`)}
                className="cursor-pointer"
              >

                {/* IMAGE (SMALL + CLEAN) */}
                <div className="w-full h-[220px] flex items-center justify-center bg-gray-50 rounded-xl overflow-hidden">

                  <img
                    src={item.image}
                    alt={item.name}
                    className="max-h-full max-w-full object-contain hover:scale-105 transition duration-300"
                  />

                </div>

                {/* TEXT */}
                <h3 className="mt-3 text-center text-sm font-medium truncate">
                  {item.name}
                </h3>

                <p className="text-center font-semibold text-sm">
                  ₹{item.price}
                </p>

              </div>

              {/* BUTTONS (NO NAVIGATION) */}
              <div className="flex flex-col gap-2 mt-4">

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMoveToCart(item);
                  }}
                  className="w-full bg-black text-white py-2 rounded text-sm"
                >
                  Move to Cart
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteMutation.mutate(item.productId ?? item.id);
                  }}
                  className="w-full border border-red-500 text-red-500 py-2 rounded text-sm"
                >
                  Remove
                </button>

              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}

export default Wishlist;
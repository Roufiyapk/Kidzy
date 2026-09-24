import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHeart } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import {
  addToWishlist,
  removeFromWishlist,
} from "../redux/wishlistSlice";

import { addToCart } from "../redux/cartSlice";

import api from "../api/api";

function NewArrival() {
  const [newDrops, setNewDrops] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const wishlistItems = useSelector(
    (state) => state.wishlist?.items || []
  );

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  // ADD / REMOVE WISHLIST

  const handleWishlist = (
    item,
    isInWishlist
  ) => {
    if (!user) {
      toast.error(
        "Please login to add to wishlist"
      );

      navigate("/login");
      return;
    }

    // REMOVE
    if (isInWishlist) {
      dispatch(
        removeFromWishlist(item.id)
      );

      removeWishlistItem(
        item.id,
        user.id
      )
        .then(() =>
          toast.success(
            "Removed from wishlist"
          )
        )
        .catch((err) =>
          console.error(err)
        );

      return;
    }

    // ADD
    const wishlistData = {
      ...item,
      productId: item.id,
      userId: user.id,
    };

    dispatch(
      addToWishlist(wishlistData)
    );

    addWishlistItem(wishlistData)
      .then(() =>
        toast.success(
          "Added to wishlist"
        )
      )
      .catch((err) =>
        console.error(err)
      );
  };

  // ADD WISHLIST ITEM TO DATABASE

  const addWishlistItem = async (item) => {
    try {
      await api.post(
        "/wishlist",
        item
      );
    } catch (error) {
      console.error(
        "Error adding wishlist:",
        error
      );
    }
  };

  // REMOVE WISHLIST ITEM FROM DATABASE

  const removeWishlistItem = async (
    productId,
    userId
  ) => {
    try {
      const res = await api.get(
        `/wishlist?userId=${userId}&productId=${productId}`
      );

      const wishlist = res.data;

      if (wishlist.length > 0) {
        await api.delete(
          `/wishlist/${wishlist[0].id}`
        );
      }
    } catch (error) {
      console.error(
        "Error removing wishlist:",
        error
      );
    }
  };

  // FETCH NEW ARRIVALS

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const res = await api.get(
          "/products"
        );

        const data = res.data;

        const filteredProducts =
          data.filter(
            (item) =>
              item.newArrival === true &&
              item.deleted !== true
          );

        setNewDrops(
          filteredProducts
        );
      } catch (err) {
        console.error(
          "Error fetching products:",
          err
        );

        toast.error(
          "Failed to load New Arrivals"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchNewArrivals();
  }, []);

  // ADD TO CART

  const handleAddToCart = (item) => {
    if (!user) {
      toast.info(
        "Please login to add products to cart"
      );

      navigate("/login");
      return;
    }

    dispatch(
      addToCart({
        ...item,
        qty: 1,
      })
    );

    toast.success(
      "Added to cart"
    );
  };

  // LOADING

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">

        <p className="text-lg font-medium">
          Loading New Arrivals...
        </p>

      </div>
    );
  }

  // PAGE

  return (
    <div className="min-h-screen bg-white px-4 md:px-8 lg:px-12 py-8">

      {/* PAGE HEADER */}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">

        <h1 className="text-3xl md:text-4xl font-bold">
          New Arrivals
        </h1>

      </div>

      {/* NO PRODUCTS */}

      {newDrops.length === 0 ? (

        <div className="flex justify-center items-center py-20">

          <p className="text-gray-500 text-lg">
            No New Arrivals Found
          </p>

        </div>

      ) : (

        /* PRODUCT GRID */

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 md:gap-7">

          {newDrops.map((item) => {

            // WISHLIST

            const isInWishlist =
              wishlistItems.some(
                (w) =>
                  String(
                    w.productId ?? w.id
                  ) === String(item.id)
              );

            // CHECK SIZE

            const hasSizes =
              Array.isArray(item.sizes) &&
              item.sizes.length > 0;

            // TOTAL STOCK

            const totalStock = hasSizes
              ? item.sizes.reduce(
                  (total, size) =>
                    total +
                    Number(size.stock || 0),
                  0
                )
              : Number(
                  item.stock || 0
                );

            // OUT OF STOCK

            const isOutOfStock =
              totalStock <= 0;

            // PRICE

            const currentPrice =
              Number(
                item.price || 0
              );

            const originalPrice =
              item.originalPrice
                ? Number(
                    item.originalPrice
                  )
                : null;

            const discount =
              item.discount
                ? Number(
                    item.discount
                  )
                : null;

            return (
              <div
                key={item.id}
                className="
                  bg-white
                  rounded-2xl
                  overflow-hidden
                  shadow-sm
                  hover:shadow-lg
                  transition
                  duration-300
                  relative
                  group
                  border
                  border-[#e5ddd4]
                "
              >

                {/* PRODUCT IMAGE */}

                <div
                  className="
                    relative
                    aspect-[4/5]
                    overflow-hidden
                    cursor-pointer
                    bg-white
                  "
                  onClick={() =>
                    navigate(
                      `/product/${item.id}`
                    )
                  }
                >

                  <img
                    src={item.image}
                    alt={item.name}
                    className="
                      w-full
                      h-full
                      object-cover
                      group-hover:scale-105
                      transition
                      duration-500
                    "
                  />

                  {/* OUT OF STOCK */}

                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">

                      <span className="bg-black text-white px-4 py-2 rounded-full text-sm font-semibold">
                        OUT OF STOCK
                      </span>

                    </div>
                  )}

                  {/* WISHLIST */}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();

                      handleWishlist(
                        item,
                        isInWishlist
                      );
                    }}
                    className="
                      absolute
                      top-3
                      right-3
                      bg-white
                      w-9
                      h-9
                      rounded-full
                      flex
                      items-center
                      justify-center
                      shadow
                      hover:scale-110
                      transition
                    "
                  >

                    <FaHeart
                      className={`text-sm ${
                        isInWishlist
                          ? "text-red-500"
                          : "text-gray-400"
                      }`}
                    />

                  </button>

                  {/* PLUS BUTTON */}

                  {!isOutOfStock && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();

                        handleAddToCart(
                          item
                        );
                      }}
                      className="
                        absolute
                        bottom-3
                        right-3
                        bg-white
                        w-9
                        h-9
                        rounded-lg
                        flex
                        items-center
                        justify-center
                        shadow
                        hover:scale-110
                        transition
                        text-xl
                        font-medium
                      "
                    >
                      +
                    </button>
                  )}

                </div>

                {/* PRODUCT DETAILS */}

                <div className="p-4">

                  {/* NEW ARRIVAL */}

                  <p className="text-xs font-medium tracking-wide text-gray-500 uppercase mb-1">
                    New Arrival
                  </p>

                  {/* PRODUCT NAME */}

                  <h2
                    className="
                      font-medium
                      text-sm
                      md:text-base
                      line-clamp-2
                      cursor-pointer
                      hover:underline
                      min-h-[40px]
                    "
                    onClick={() =>
                      navigate(
                        `/product/${item.id}`
                      )
                    }
                  >
                    {item.name}
                  </h2>

                  {/* PRICE */}

                  <div className="flex items-center gap-2 mt-2 flex-wrap">

                    {/* CURRENT PRICE */}

                    <span className="font-semibold text-base">
                      ₹
                      {currentPrice.toLocaleString(
                        "en-IN"
                      )}
                    </span>

                    {/* ORIGINAL PRICE */}

                    {originalPrice &&
                      originalPrice >
                        currentPrice && (
                        <span className="text-gray-400 text-sm line-through">
                          ₹
                          {originalPrice.toLocaleString(
                            "en-IN"
                          )}
                        </span>
                      )}

                    {/* DISCOUNT */}

                    {discount &&
                      discount > 0 && (
                        <span className="text-green-600 text-sm font-medium">
                          {discount}% off
                        </span>
                      )}

                  </div>

                </div>

              </div>
            );
          })}

        </div>
      )}

    </div>
  );
}

export default NewArrival;
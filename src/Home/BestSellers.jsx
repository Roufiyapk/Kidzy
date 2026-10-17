import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useQuery } from "@tanstack/react-query";

import {
  FaHeart,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

import { toast } from "react-toastify";

import api from "../api/api";

function BestSellers() {
  const notify = (type, message) => {
    toast[type](message, {
      position: "bottom-center",
      autoClose: 1800,
      hideProgressBar: true,
      closeButton: false,
      icon: false,
      style: {
        background: "#FFF9F3",
        color: "#5A4030",
        border: "1px solid #E7DED5",
        borderRadius: "12px",
        boxShadow: "0 4px 16px rgba(90, 64, 48, 0.12)",
        fontSize: "14px",
        fontWeight: 500,
      },
    });
  };

  const navigate = useNavigate();

  const scrollRef = useRef(null);

  const [wishlistItems, setWishlistItems] =
    useState([]);

  const [wishlistLoading, setWishlistLoading] =
    useState(false);

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const normalizeImageUrl = (image) => {
    if (!image) {
      return "";
    }

    const imageString =
      String(image).trim();

    if (!imageString) {
      return "";
    }

    if (
      imageString.startsWith("http://") ||
      imageString.startsWith("https://") ||
      imageString.startsWith("data:") ||
      imageString.startsWith("blob:")
    ) {
      return imageString;
    }

    const apiBaseUrl =
      api.defaults.baseURL || "";

    const backendBaseUrl =
      apiBaseUrl.replace(
        /\/api\/?$/,
        ""
      );

    if (
      imageString.startsWith("/")
    ) {
      return `${backendBaseUrl}${imageString}`;
    }

    return `${backendBaseUrl}/${imageString}`;
  };

  const getProductImage = (item) => {
    const image =
      item?.imageUrl ??
      item?.ImageUrl ??
      item?.imagePath ??
      item?.ImagePath ??
      item?.image ??
      item?.Image ??
      item?.thumbnail ??
      item?.Thumbnail ??
      "";

    return normalizeImageUrl(image);
  };

  const refreshWishlist =
    async () => {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        if (!token) {
          setWishlistItems([]);
          return [];
        }

        const response =
          await api.get(
            "/wishlist"
          );

        const wishlist =
          response?.data?.data ??
          response?.data ??
          [];

        const items =
          Array.isArray(wishlist)
            ? wishlist
            : Array.isArray(
                wishlist?.items
              )
              ? wishlist.items
              : Array.isArray(
                  wishlist?.Items
                )
                ? wishlist.Items
                : Array.isArray(
                    wishlist?.data
                  )
                  ? wishlist.data
                  : Array.isArray(
                      wishlist?.Data
                    )
                    ? wishlist.Data
                    : [];

        setWishlistItems(items);

        return items;
      } catch (error) {
        console.error(
          "Get wishlist error:",
          error
        );

        if (
          error?.response?.status ===
          401
        ) {
          setWishlistItems([]);
        }

        return [];
      }
    };

  useEffect(() => {
    if (user) {
      refreshWishlist();
    } else {
      setWishlistItems([]);
    }
  }, []);

  const handleWishlist =
    async (
      item,
      isInWishlist
    ) => {

      const currentUser =
        JSON.parse(
          localStorage.getItem(
            "user"
          ) || "null"
        );

      if (!currentUser) {
        notify("error", 
          "Please login first"
        );

        navigate("/login");

        return;
      }

      const productId =
        item?.productId ??
        item?.id ??
        item?.Id;

      if (!productId) {
        notify("error", 
          "Product ID not found"
        );

        return;
      }

      try {
        setWishlistLoading(
          true
        );

        if (isInWishlist) {
          await api.delete(
            `/wishlist/${productId}`
          );

          await refreshWishlist();

          notify("success", 
            "Removed from wishlist"
          );

          return;
        }

        await api.post(
          "/wishlist",
          {
            productId:
              Number(productId),
          }
        );

        await refreshWishlist();

        notify("success", 
          "Added to wishlist"
        );
      } catch (error) {
        console.error(
          "Wishlist error:",
          error
        );

        if (
          error?.response?.status ===
          401
        ) {
          notify("error", 
            "Please login first"
          );

          navigate("/login");

          return;
        }

        const message =
          error?.response?.data
            ?.message ||
          error?.response?.data
            ?.title ||
          error?.response?.data
            ?.errors?.[0] ||
          "Wishlist operation failed";

        notify("error", message);
      } finally {
        setWishlistLoading(
          false
        );
      }
    };

  const {
    data: bestSellers = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: [
      "bestSellers",
    ],

    queryFn:
      async () => {
        const response =
          await api.get(
            "/products",
            {
              params: {
                BestSeller: true,
                Status: "active",
                Page: 1,
                PageSize: 100,
              },
            }
          );

        console.log(
          "BEST SELLERS BACKEND RESPONSE:",
          response.data
        );

        const root =
          response?.data?.data ??
          response?.data ??
          {};

        const data =
          root?.data ??
          root;

        const products =
          Array.isArray(data)
            ? data
            : Array.isArray(
                data?.products
              )
              ? data.products
              : Array.isArray(
                  data?.Products
                )
                ? data.Products
                : Array.isArray(
                    data?.items
                  )
                  ? data.items
                  : Array.isArray(
                      data?.Items
                    )
                    ? data.Items
                    : [];

        return products;
      },
  });

  const handleScroll = (
    direction
  ) => {
    if (!scrollRef.current) {
      return;
    }

    const scrollAmount =
      scrollRef.current
        .clientWidth * 0.75;

    const currentScroll =
      scrollRef.current
        .scrollLeft;

    const newScrollPosition =
      direction === "left"
        ? currentScroll -
          scrollAmount
        : currentScroll +
          scrollAmount;

    scrollRef.current.scrollTo(
      {
        left:
          newScrollPosition,
        behavior:
          "smooth",
      }
    );
  };

  if (isLoading) {
    return (
      <p className="text-center py-20 font-medium text-stone-500">
        Loading...
      </p>
    );
  }

  if (isError) {
    return (
      <p className="text-center py-20 text-red-500">
        Error loading products
      </p>
    );
  }

  return (
    <div className="w-full min-w-0 overflow-hidden bg-[#FBF9F6] px-3 py-7 sm:px-5 sm:py-9 md:px-10 md:py-11 border-b border-[#EAE2D8]">

      <div className="relative mx-auto w-full max-w-7xl min-w-0">

        {

}

        <div className="mb-6 flex flex-col items-start justify-between gap-4 px-1 sm:flex-row sm:items-end md:mb-8">

          <div className="flex flex-col gap-1">

            <p className="uppercase tracking-[0.28em] text-[10px] font-semibold text-[#A18468]">
              Most Loved
            </p>

            <h2 className="text-2xl font-serif font-medium tracking-tight text-[#49372B] sm:text-3xl">
              Best Sellers
            </h2>

            <div className="h-[2px] w-10 bg-[#B69A7B] mt-1" />

          </div>

          {

}

          <div className="flex shrink-0 gap-2 self-end sm:self-auto">

            {}

            <button
              type="button"
              onClick={() =>
                handleScroll(
                  "left"
                )
              }
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E4D8CA] bg-[#F3EAE0] text-[#6B503B] transition-all hover:border-[#49372B] hover:bg-[#49372B] hover:text-white"
              aria-label="Previous products"
            >
              <FaChevronLeft className="text-xs" />
            </button>

            {}

            <button
              type="button"
              onClick={() =>
                handleScroll(
                  "right"
                )
              }
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E4D8CA] bg-[#F3EAE0] text-[#6B503B] transition-all hover:border-[#49372B] hover:bg-[#49372B] hover:text-white"
              aria-label="Next products"
            >
              <FaChevronRight className="text-xs" />
            </button>

          </div>

        </div>

        {

}

        <div
          ref={scrollRef}
          className="flex w-full min-w-0 gap-3 overflow-x-auto overscroll-x-contain px-1 pb-5 scroll-smooth snap-x snap-mandatory sm:gap-5"
          style={{
            scrollbarWidth:
              "none",
            msOverflowStyle:
              "none",
          }}
        >

          {

}

          {bestSellers.length ===
          0 ? (

            <p className="w-full text-center py-10 text-[#817467]">
              No best sellers available.
            </p>

          ) : (

            bestSellers.map(
              (item) => {

                const productId =
                  item?.productId ??
                  item?.id ??
                  item?.Id;

                const productName =
                  item?.name ??
                  item?.Name ??
                  "Product";

                const productPrice =
                  item?.price ??
                  item?.Price ??
                  0;

                const productImage =
                  getProductImage(
                    item
                  );

                const isInWishlist =
                  wishlistItems.some(
                    (wishlist) => {

                      const wishlistProductId =
                        wishlist?.productId ??
                        wishlist?.ProductId ??
                        wishlist?.product?.id ??
                        wishlist?.product?.Id ??
                        wishlist?.id ??
                        wishlist?.Id;

                      return (
                        String(
                          wishlistProductId
                        ) ===
                        String(
                          productId
                        )
                      );
                    }
                  );

                return (

                  <div
                    key={
                      productId
                    }
                    onClick={() =>
                      navigate(
                        `/product/${productId}`
                      )
                    }
                    className="group relative w-[72vw] min-w-[220px] max-w-[275px] flex-shrink-0 snap-start cursor-pointer overflow-hidden rounded-xl border border-[#E8DED2] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:w-[255px] md:w-[275px]"
                  >

                    {

}

                    <div className="relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden border-b border-[#EEE5DB] bg-[#F7F2EC] sm:aspect-[275/310]">

                      {productImage ? (

                        <img
                          src={
                            productImage
                          }
                          alt={
                            productName
                          }
                          className="h-[90%] w-auto max-w-[94%] object-contain scale-100 transition duration-500 ease-out group-hover:scale-105"
                          onError={(
                            event
                          ) => {
                            console.error(
                              "Product image failed:",
                              productImage
                            );

                            event.currentTarget.style.display =
                              "none";
                          }}
                        />

                      ) : (

                        <div className="text-[#A09487] text-sm">
                          No image
                        </div>

                      )}

                      {}

                      <div className="absolute top-0 left-0 w-full h-[2px] bg-transparent group-hover:bg-[#B69A7B] transition-colors duration-300" />

                      {}

                      <div className="absolute left-2 top-2 rounded-full bg-[#F8F2EA]/95 px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.08em] text-[#6B503B] shadow-sm backdrop-blur-sm sm:left-3 sm:top-3 sm:px-2.5 sm:text-[9px] sm:tracking-[0.12em]">
                        Best Seller
                      </div>

                      {

}

                      <button
                        type="button"
                        disabled={
                          wishlistLoading
                        }
                        onClick={(
                          event
                        ) => {

                          event.stopPropagation();

                          handleWishlist(
                            item,
                            isInWishlist
                          );
                        }}
                        className="absolute right-2 top-2 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-[#E8DED2] bg-[#FBF9F6]/95 shadow-sm backdrop-blur-sm transition-transform hover:bg-white active:scale-90 disabled:opacity-50 sm:right-3 sm:top-3"
                        aria-label={
                          isInWishlist
                            ? "Remove from wishlist"
                            : "Add to wishlist"
                        }
                      >

                        <FaHeart
                          className={
                            isInWishlist
                              ? "text-sm text-[#B75D58]"
                              : "text-sm text-[#A09487] hover:text-[#6B503B]"
                          }
                        />

                      </button>

                    </div>

                    {

}

                    <div className="flex min-w-0 flex-col justify-between bg-white p-3 sm:p-4">

                      <div className="mb-2">

                        <h3 className="line-clamp-2 break-words text-sm font-medium tracking-wide text-[#49372B] transition-colors group-hover:text-[#A18468] sm:line-clamp-1">
                          {
                            productName
                          }
                        </h3>

                      </div>

                      <div className="mt-1 flex flex-wrap items-center justify-between gap-2 pt-1">

                        <p className="text-base font-semibold text-[#49372B]">
                          ₹
                          {Number(
                            productPrice
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </p>

                        <span className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-[#A09487] transition-colors group-hover:text-[#49372B] sm:text-[10px] sm:tracking-[0.12em]">

                          Explore

                          <span className="transform translate-x-0 group-hover:translate-x-1 transition-transform duration-300">
                            →
                          </span>

                        </span>

                      </div>

                    </div>

                  </div>
                );
              }
            )

          )}

        </div>

      </div>
    </div>
  );
}

export default BestSellers;
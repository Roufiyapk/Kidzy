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
    <div className="bg-[#FBF9F6] px-4 sm:px-6 md:px-10 py-9 md:py-11 border-b border-[#EAE2D8]">

      <div className="max-w-7xl mx-auto relative">

        {

}

        <div className="flex items-end justify-between mb-6 md:mb-8 px-1">

          <div className="flex flex-col gap-1">

            <p className="uppercase tracking-[0.28em] text-[10px] font-semibold text-[#A18468]">
              Most Loved
            </p>

            <h2 className="text-2xl md:text-3xl font-serif font-medium tracking-tight text-[#49372B]">
              Best Sellers
            </h2>

            <div className="h-[2px] w-10 bg-[#B69A7B] mt-1" />

          </div>

          {

}

          <div className="flex gap-2">

            {}

            <button
              type="button"
              onClick={() =>
                handleScroll(
                  "left"
                )
              }
              className="w-9 h-9 rounded-full bg-[#F3EAE0] border border-[#E4D8CA] flex items-center justify-center cursor-pointer text-[#6B503B] hover:bg-[#49372B] hover:text-white hover:border-[#49372B] transition-all"
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
              className="w-9 h-9 rounded-full bg-[#F3EAE0] border border-[#E4D8CA] flex items-center justify-center cursor-pointer text-[#6B503B] hover:bg-[#49372B] hover:text-white hover:border-[#49372B] transition-all"
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
          className="flex gap-4 sm:gap-5 overflow-x-auto pb-5 px-1 scroll-smooth snap-x snap-mandatory"
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
                    className="group relative min-w-[235px] sm:min-w-[255px] md:min-w-[275px] flex-shrink-0 snap-start cursor-pointer bg-white rounded-xl border border-[#E8DED2] overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  >

                    {

}

                    <div className="h-[290px] sm:h-[310px] w-full bg-[#F7F2EC] flex items-center justify-center overflow-hidden relative border-b border-[#EEE5DB]">

                      {productImage ? (

                        <img
                          src={
                            productImage
                          }
                          alt={
                            productName
                          }
                          className="h-[90%] w-auto max-w-[94%] object-contain scale-100 group-hover:scale-105 transition duration-500 ease-out"
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

                      <div className="absolute top-3 left-3 bg-[#F8F2EA]/95 text-[#6B503B] px-2.5 py-1 rounded-full text-[9px] font-semibold tracking-[0.12em] uppercase shadow-sm backdrop-blur-sm">
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
                        className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-[#FBF9F6]/95 backdrop-blur-sm flex items-center justify-center border border-[#E8DED2] hover:bg-white shadow-sm transition-transform active:scale-90 disabled:opacity-50"
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

                    <div className="p-3.5 sm:p-4 flex flex-col justify-between bg-white">

                      <div className="mb-2">

                        <h3 className="text-[#49372B] font-medium text-sm tracking-wide line-clamp-1 group-hover:text-[#A18468] transition-colors">
                          {
                            productName
                          }
                        </h3>

                      </div>

                      <div className="flex items-center justify-between mt-1 pt-1">

                        <p className="text-base font-semibold text-[#49372B]">
                          ₹
                          {Number(
                            productPrice
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </p>

                        <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#A09487] group-hover:text-[#49372B] transition-colors flex items-center gap-1">

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
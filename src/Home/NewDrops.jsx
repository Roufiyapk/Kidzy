import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FaHeart,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import api from "../api/api";

import { setWishlist } from "../redux/wishlistSlice";

const normalizeImageUrl = (image) => {
  if (!image) {
    return "";
  }

  const imageString = String(image).trim();

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
    apiBaseUrl.replace(/\/api\/?$/, "");

  if (imageString.startsWith("/")) {
    return `${backendBaseUrl}${imageString}`;
  }

  return `${backendBaseUrl}/${imageString}`;
};

function NewDrops() {
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
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const wishlistItems = useSelector(
    (state) => state.wishlist?.items || []
  );

  useEffect(() => {
    const loadWishlist = async () => {
      const token =
        localStorage.getItem("token");

      if (!token) {
        dispatch(setWishlist([]));
        return;
      }

      try {
        const response =
          await api.get("/wishlist");

        const responseData =
          response?.data?.data ??
          response?.data ??
          {};

        const wishlistData =
          Array.isArray(responseData)
            ? responseData
            : Array.isArray(
                responseData?.items
              )
              ? responseData.items
              : Array.isArray(
                  responseData?.Items
                )
                ? responseData.Items
                : Array.isArray(
                    responseData?.data
                  )
                  ? responseData.data
                  : Array.isArray(
                      responseData?.Data
                    )
                    ? responseData.Data
                    : [];

        dispatch(
          setWishlist(
            wishlistData
          )
        );
      } catch (error) {
        console.error(
          "Wishlist load error:",
          error
        );

        dispatch(
          setWishlist([])
        );
      }
    };

    loadWishlist();
  }, [dispatch]);

  const refreshWishlist = async () => {
    const response =
      await api.get("/wishlist");

    const responseData =
      response?.data?.data ??
      response?.data ??
      {};

    const wishlistData =
      Array.isArray(responseData)
        ? responseData
        : Array.isArray(
            responseData?.items
          )
          ? responseData.items
          : Array.isArray(
              responseData?.Items
            )
            ? responseData.Items
            : Array.isArray(
                responseData?.data
              )
              ? responseData.data
              : Array.isArray(
                  responseData?.Data
                )
                ? responseData.Data
                : [];

    dispatch(
      setWishlist(
        wishlistData
      )
    );
  };

  const handleWishlist = async (
    item,
    isInWishlist
  ) => {
    const token =
      localStorage.getItem("token");

    if (!token) {
      notify("error", 
        "Please login first"
      );

      navigate("/login");
      return;
    }

    const productId =
      item?.id ??
      item?.Id;

    if (!productId) {
      notify("error", 
        "Product ID not found."
      );

      return;
    }

    try {

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
        error?.response?.status === 401
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
          ?.errors?.[0] ||
        "Wishlist operation failed";

      notify("error", message);
    }
  };

  const {
    data: newDrops = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["newDrops"],

    queryFn: async () => {
      const response =
        await api.get(
          "/products",
          {
            params: {
              NewArrival: true,
              Page: 1,
              PageSize: 100,
            },
          }
        );

      console.log(
        "NEW DROPS BACKEND RESPONSE:",
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

    const {
      scrollLeft,
      clientWidth,
    } = scrollRef.current;

    const scrollAmount =
      clientWidth * 0.75;

    const newScrollPosition =
      direction === "left"
        ? scrollLeft -
          scrollAmount
        : scrollLeft +
          scrollAmount;

    scrollRef.current.scrollTo({
      left:
        newScrollPosition,
      behavior: "smooth",
    });
  };

  if (isLoading) {
    return (
      <div className="bg-[#FBF9F6]">
        <p className="text-center py-20 font-medium text-[#817467]">
          Loading...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-[#FBF9F6]">
        <p className="text-center py-20 text-[#49372B]">
          Error loading products
        </p>
      </div>
    );
  }

  if (newDrops.length === 0) {
    return null;
  }

  return (
    <section className="bg-[#FBF9F6] px-4 sm:px-6 md:px-10 lg:px-14 py-10 md:py-12 border-b border-[#E9E0D6]">
      <div className="max-w-7xl mx-auto relative">

        <div className="flex items-end justify-between gap-4 mb-6 md:mb-8">
          <div className="flex flex-col gap-1.5">
            <p className="uppercase tracking-[0.24em] text-[10px] font-semibold text-[#A18468]">
              JUST ARRIVED
            </p>

            <h2 className="text-2xl md:text-3xl font-serif font-medium tracking-tight text-[#49372B]">
              New Drops
            </h2>

            <p className="text-xs sm:text-sm text-[#817467] leading-relaxed max-w-md mt-1">
              Fresh finds for little personalities and everyday adventures.
            </p>

            <div className="h-[2px] w-10 bg-[#B69A7B] mt-1" />
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleScroll("left")}
              aria-label="Previous products"
              className="w-9 h-9 rounded-full bg-white border border-[#E5DACE] flex items-center justify-center cursor-pointer text-[#6B5847] hover:bg-[#49372B] hover:text-white hover:border-[#49372B] transition-all duration-300"
            >
              <FaChevronLeft className="text-xs" />
            </button>

            <button
              type="button"
              onClick={() => handleScroll("right")}
              aria-label="Next products"
              className="w-9 h-9 rounded-full bg-white border border-[#E5DACE] flex items-center justify-center cursor-pointer text-[#6B5847] hover:bg-[#49372B] hover:text-white hover:border-[#49372B] transition-all duration-300"
            >
              <FaChevronRight className="text-xs" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-5 overflow-x-auto pb-4 px-1 scroll-smooth snap-x snap-mandatory"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {newDrops.map((item) => {
            const productId = item?.id ?? item?.Id;
            const productName = item?.name ?? item?.Name ?? "Product";
            const productPrice = item?.price ?? item?.Price ?? 0;

            const productImage = normalizeImageUrl(
              item?.imageUrl ??
                item?.ImageUrl ??
                item?.imagePath ??
                item?.ImagePath ??
                item?.image ??
                item?.Image ??
                ""
            );

            const isInWishlist = wishlistItems.some((wishlist) => {
              const wishlistProductId =
                wishlist?.productId ??
                wishlist?.ProductId ??
                wishlist?.product?.id ??
                wishlist?.product?.Id ??
                wishlist?.id ??
                wishlist?.Id;

              return String(wishlistProductId) === String(productId);
            });

            return (
              <article
                key={productId}
                onClick={() => navigate(`/product/${productId}`)}
                className="group relative min-w-[235px] sm:min-w-[265px] md:min-w-[285px] flex-shrink-0 snap-start cursor-pointer bg-white rounded-xl border border-[#EAE2D8] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#49372B]/10"
              >

                <div className="h-[290px] sm:h-[310px] w-full bg-[#F5F0E9] flex items-center justify-center overflow-hidden relative">
                  {productImage ? (
                    <img
                      src={productImage}
                      alt={productName}
                      loading="lazy"
                      className="h-[88%] w-[88%] object-contain transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  ) : (
                    <div className="text-[#9B8B7C] text-xs">Image unavailable</div>
                  )}

                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#49372B]/[0.04] to-transparent" />

                  <div className="absolute top-3 left-3 bg-[#FBF7F1]/95 text-[#6B503B] px-2.5 py-1 rounded-sm text-[9px] font-semibold tracking-[0.12em] uppercase border border-[#E8DCCB]">
                    New Arrival
                  </div>

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleWishlist(item, isInWishlist);
                    }}
                    aria-label={
                      isInWishlist ? "Remove from wishlist" : "Add to wishlist"
                    }
                    className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-white/95 flex items-center justify-center border border-[#EAE2D8] shadow-sm transition-all duration-300 hover:bg-[#49372B] hover:border-[#49372B] active:scale-90"
                  >
                    <FaHeart
                      className={
                        isInWishlist
                          ? "text-sm text-[#49372B]"
                          : "text-sm text-[#A99A8B] group-hover:text-[#49372B]"
                      }
                    />
                  </button>
                </div>

                <div className="p-4 sm:p-4 bg-white">
                  <h3 className="text-[#49372B] font-medium text-sm tracking-wide line-clamp-1 transition-colors duration-300 group-hover:text-[#A18468]">
                    {productName}
                  </h3>

                  <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-[#F0E9E1]">
                    <p className="text-base font-semibold text-[#49372B]">
                      ₹{Number(productPrice).toLocaleString("en-IN")}
                    </p>

                    <span className="text-[9px] font-semibold tracking-[0.14em] uppercase text-[#8B7A69] group-hover:text-[#49372B] transition-colors flex items-center gap-1.5">
                      Explore
                      <span className="text-sm leading-none transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default NewDrops;


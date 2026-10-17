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
    <section className="w-full min-w-0 overflow-hidden bg-[#FBF9F6] px-3 py-7 sm:px-5 sm:py-10 md:px-10 lg:px-14 md:py-12 border-b border-[#E9E0D6]">
      <div className="relative mx-auto w-full max-w-7xl min-w-0">

        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end md:mb-8">
          <div className="flex flex-col gap-1.5">
            <p className="uppercase tracking-[0.24em] text-[10px] font-semibold text-[#A18468]">
              JUST ARRIVED
            </p>

            <h2 className="text-2xl font-serif font-medium tracking-tight text-[#49372B] sm:text-3xl">
              New Drops
            </h2>

            <p className="mt-1 max-w-md text-xs leading-relaxed text-[#817467] sm:text-sm">
              Fresh finds for little personalities and everyday adventures.
            </p>

            <div className="h-[2px] w-10 bg-[#B69A7B] mt-1" />
          </div>

          <div className="flex shrink-0 gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => handleScroll("left")}
              aria-label="Previous products"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E5DACE] bg-white text-[#6B5847] transition-all duration-300 hover:border-[#49372B] hover:bg-[#49372B] hover:text-white"
            >
              <FaChevronLeft className="text-xs" />
            </button>

            <button
              type="button"
              onClick={() => handleScroll("right")}
              aria-label="Next products"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E5DACE] bg-white text-[#6B5847] transition-all duration-300 hover:border-[#49372B] hover:bg-[#49372B] hover:text-white"
            >
              <FaChevronRight className="text-xs" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex w-full min-w-0 gap-3 overflow-x-auto overscroll-x-contain px-1 pb-4 scroll-smooth snap-x snap-mandatory sm:gap-5"
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
                className="group relative w-[72vw] min-w-[220px] max-w-[285px] flex-shrink-0 snap-start cursor-pointer overflow-hidden rounded-xl border border-[#EAE2D8] bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#49372B]/10 sm:w-[265px] md:w-[285px]"
              >

                <div className="relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden bg-[#F5F0E9] sm:aspect-[285/310]">
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

                  <div className="absolute left-2 top-2 max-w-[calc(100%-4rem)] rounded-sm border border-[#E8DCCB] bg-[#FBF7F1]/95 px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.08em] text-[#6B503B] sm:left-3 sm:top-3 sm:px-2.5 sm:text-[9px] sm:tracking-[0.12em]">
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
                    className="absolute right-2 top-2 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-[#EAE2D8] bg-white/95 shadow-sm transition-all duration-300 hover:border-[#49372B] hover:bg-[#49372B] active:scale-90 sm:right-3 sm:top-3 sm:h-9 sm:w-9"
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

                <div className="min-w-0 bg-white p-3 sm:p-4">
                  <h3 className="line-clamp-2 break-words text-sm font-medium tracking-wide text-[#49372B] transition-colors duration-300 group-hover:text-[#A18468] sm:line-clamp-1">
                    {productName}
                  </h3>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#F0E9E1] pt-3">
                    <p className="text-sm font-semibold text-[#49372B] sm:text-base">
                      ₹{Number(productPrice).toLocaleString("en-IN")}
                    </p>

                    <span className="flex items-center gap-1.5 text-[8px] font-semibold uppercase tracking-[0.1em] text-[#8B7A69] transition-colors group-hover:text-[#49372B] sm:text-[9px] sm:tracking-[0.14em]">
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


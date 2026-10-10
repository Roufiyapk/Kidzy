import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHeart } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import api from "../api/api";

import { setCart } from "../redux/cartSlice";
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
    apiBaseUrl.replace(
      /\/api\/?$/,
      ""
    );

  if (imageString.startsWith("/")) {
    return `${backendBaseUrl}${imageString}`;
  }

  return `${backendBaseUrl}/${imageString}`;
};

function NewArrival() {
  const [newDrops, setNewDrops] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showSizePopup, setShowSizePopup] =
    useState(false);

  const [selectedProduct, setSelectedProduct] =
    useState(null);

  const [selectedSize, setSelectedSize] =
    useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const addingCartRef = useRef(false);

  const wishlistItems = useSelector(
    (state) => state.wishlist?.items || []
  );

  const refreshWishlist = async () => {
    const token =
      localStorage.getItem(
        "token"
      );

    if (!token) {
      dispatch(
        setWishlist([])
      );

      return [];
    }

    try {
      const response =
        await api.get(
          "/wishlist"
        );

      const responseData =
        response?.data?.data ??
        response?.data ??
        [];

      const wishlistItems =
        Array.isArray(
          responseData
        )
          ? responseData
          : Array.isArray(
              responseData?.items
            )
            ? responseData.items
            : Array.isArray(
                responseData?.Items
              )
              ? responseData.Items
              : [];

      dispatch(
        setWishlist(
          wishlistItems
        )
      );

      return wishlistItems;
    } catch (error) {
      console.error(
        "Wishlist load error:",
        error
      );

      dispatch(
        setWishlist([])
      );

      return [];
    }
  };

  useEffect(() => {
    const fetchNewArrivals =
      async () => {
        try {
          setLoading(true);

          const response =
            await api.get(
              "/products",
              {
                params: {
                  NewArrival: true,
                  Status: "active",
                  Page: 1,
                  PageSize: 100,
                },
              }
            );

          console.log(
            "NEW ARRIVALS BACKEND RESPONSE:",
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
                  : [];

          setNewDrops(
            products
          );
        } catch (error) {
          console.error(
            "Error fetching new arrivals:",
            error
          );

          console.error(
            "Status:",
            error?.response?.status
          );

          console.error(
            "Backend response:",
            error?.response?.data
          );

          setNewDrops([]);

          toast.error(
            error?.response?.data
              ?.message ||
            "Failed to load New Arrivals"
          , {
            position: "bottom-center",
            autoClose: 1800,
            hideProgressBar: true,
            closeButton: false,
            icon: false,
            style: {
              background: "#FFF9F3",
              color: "#5A4030",
              border: "1px solid #E7DED5",
              boxShadow: "0 4px 14px rgba(90, 64, 48, 0.12)",
            },
          });
        } finally {
          setLoading(false);
        }
      };

    fetchNewArrivals();
  }, []);

  const getProductSizes = (
    product
  ) => {
    if (
      Array.isArray(
        product?.sizes
      )
    ) {
      return product.sizes;
    }

    if (
      Array.isArray(
        product?.Sizes
      )
    ) {
      return product.Sizes;
    }

    if (
      Array.isArray(
        product?.variants
      )
    ) {
      return product.variants.flatMap(
        (variant) =>
          Array.isArray(
            variant?.sizes
          )
            ? variant.sizes.map(
                (sizeItem) => ({
                  ...sizeItem,

                  productVariantId:
                    sizeItem?.productVariantId ??
                    sizeItem?.ProductVariantId ??
                    sizeItem?.variantId ??
                    sizeItem?.VariantId ??
                    sizeItem?.id ??
                    sizeItem?.Id ??
                    variant?.id ??
                    variant?.Id ??
                    null,
                })
              )
            : []
      );
    }

    if (
      Array.isArray(
        product?.Variants
      )
    ) {
      return product.Variants.flatMap(
        (variant) =>
          Array.isArray(
            variant?.Sizes
          )
            ? variant.Sizes.map(
                (sizeItem) => ({
                  ...sizeItem,

                  productVariantId:
                    sizeItem?.productVariantId ??
                    sizeItem?.ProductVariantId ??
                    sizeItem?.variantId ??
                    sizeItem?.VariantId ??
                    sizeItem?.id ??
                    sizeItem?.Id ??
                    variant?.id ??
                    variant?.Id ??
                    null,
                })
              )
            : []
      );
    }

    return [];
  };

  const getSizeValue = (
    size
  ) => {
    if (
      typeof size ===
        "object" &&
      size !== null
    ) {
      return (
        size.size ??
        size.Size ??
        size.name ??
        size.Name ??
        size.value ??
        size.Value ??
        ""
      );
    }

    return size;
  };

  const getSizeStock = (
    size
  ) => {
    if (
      typeof size ===
        "object" &&
      size !== null
    ) {
      return Number(
        size.stock ??
        size.Stock ??
        0
      );
    }

    return 999999;
  };

  const hasProductSizes = (
    product
  ) => {
    return (
      getProductSizes(
        product
      ).length > 0
    );
  };

  const closeSizePopup = () => {
    setShowSizePopup(false);
    setSelectedProduct(null);
    setSelectedSize("");
  };

  const handleWishlist =
    async (product) => {
      const token =
        localStorage.getItem(
          "token"
        );

      if (!token) {
        toast.error(
          "Please login first"
        , {
            position: "bottom-center",
            autoClose: 1800,
            hideProgressBar: true,
            closeButton: false,
            icon: false,
            style: {
              background: "#FFF9F3",
              color: "#5A4030",
              border: "1px solid #E7DED5",
              boxShadow: "0 4px 14px rgba(90, 64, 48, 0.12)",
            },
          });

        navigate("/login");

        return;
      }

      const productId =
        product?.id ??
        product?.Id;

      if (!productId) {
        toast.error(
          "Product ID not found"
        , {
            position: "bottom-center",
            autoClose: 1800,
            hideProgressBar: true,
            closeButton: false,
            icon: false,
            style: {
              background: "#FFF9F3",
              color: "#5A4030",
              border: "1px solid #E7DED5",
              boxShadow: "0 4px 14px rgba(90, 64, 48, 0.12)",
            },
          });

        return;
      }

      const existing =
        wishlistItems.find(
          (item) => {
            const wishlistProductId =
              item?.productId ??
              item?.ProductId ??
              item?.product?.id ??
              item?.product?.Id ??
              item?.id ??
              item?.Id;

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

      try {
        if (existing) {
          await api.delete(
            `/wishlist/${productId}`
          );

          await refreshWishlist();

          toast.success(
            "Removed from wishlist"
          , {
            position: "bottom-center",
            autoClose: 1800,
            hideProgressBar: true,
            closeButton: false,
            icon: false,
            style: {
              background: "#FFF9F3",
              color: "#5A4030",
              border: "1px solid #E7DED5",
              boxShadow: "0 4px 14px rgba(90, 64, 48, 0.12)",
            },
          });

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

        toast.success(
          "Added to wishlist"
        , {
            position: "bottom-center",
            autoClose: 1800,
            hideProgressBar: true,
            closeButton: false,
            icon: false,
            style: {
              background: "#FFF9F3",
              color: "#5A4030",
              border: "1px solid #E7DED5",
              boxShadow: "0 4px 14px rgba(90, 64, 48, 0.12)",
            },
          });
      } catch (error) {
        console.error(
          "Wishlist error:",
          error
        );

        if (
          error?.response?.status ===
          401
        ) {
          toast.error(
            "Please login first"
          , {
            position: "bottom-center",
            autoClose: 1800,
            hideProgressBar: true,
            closeButton: false,
            icon: false,
            style: {
              background: "#FFF9F3",
              color: "#5A4030",
              border: "1px solid #E7DED5",
              boxShadow: "0 4px 14px rgba(90, 64, 48, 0.12)",
            },
          });

          navigate("/login");

          return;
        }

        toast.error(
          error?.response?.data
            ?.message ||
          error?.response?.data
            ?.title ||
          error?.response?.data
            ?.errors?.[0] ||
          "Wishlist update failed"
        , {
            position: "bottom-center",
            autoClose: 1800,
            hideProgressBar: true,
            closeButton: false,
            icon: false,
            style: {
              background: "#FFF9F3",
              color: "#5A4030",
              border: "1px solid #E7DED5",
              boxShadow: "0 4px 14px rgba(90, 64, 48, 0.12)",
            },
          });
      }
    };

  const addProductToCart =
    async (
      product,
      size = null
    ) => {
      if (
        addingCartRef.current
      ) {
        return false;
      }

      const currentUser =
        JSON.parse(
          localStorage.getItem(
            "user"
          ) || "null"
        );

      if (!currentUser) {
        toast.info(
          "Please login to add products to cart"
        , {
            position: "bottom-center",
            autoClose: 1800,
            hideProgressBar: true,
            closeButton: false,
            icon: false,
            style: {
              background: "#FFF9F3",
              color: "#5A4030",
              border: "1px solid #E7DED5",
              boxShadow: "0 4px 14px rgba(90, 64, 48, 0.12)",
            },
          });

        navigate("/login");

        return false;
      }

      addingCartRef.current =
        true;

      try {
        const response =
          await api.get(
            `/products/${product.id}`
          );

        const latestProduct =
          response?.data?.data ??
          response?.data;

        if (!latestProduct) {
          toast.error(
            "Product not found"
          , {
            position: "bottom-center",
            autoClose: 1800,
            hideProgressBar: true,
            closeButton: false,
            icon: false,
            style: {
              background: "#FFF9F3",
              color: "#5A4030",
              border: "1px solid #E7DED5",
              boxShadow: "0 4px 14px rgba(90, 64, 48, 0.12)",
            },
          });

          return false;
        }

        const sizes =
          getProductSizes(
            latestProduct
          );

        const productHasSizes =
          sizes.length > 0;

        if (
          productHasSizes &&
          !size
        ) {
          setSelectedProduct(
            latestProduct
          );

          setSelectedSize("");

          setShowSizePopup(
            true
          );

          return false;
        }

        let productVariantId =
          null;

        if (
          productHasSizes
        ) {
          const selectedSizeObject =
            sizes.find(
              (sizeItem) =>
                String(
                  getSizeValue(
                    sizeItem
                  )
                ) ===
                String(size)
            );

          if (
            !selectedSizeObject
          ) {
            toast.error(
              "Please select a valid size"
            , {
            position: "bottom-center",
            autoClose: 1800,
            hideProgressBar: true,
            closeButton: false,
            icon: false,
            style: {
              background: "#FFF9F3",
              color: "#5A4030",
              border: "1px solid #E7DED5",
              boxShadow: "0 4px 14px rgba(90, 64, 48, 0.12)",
            },
          });

            return false;
          }

          const stock =
            getSizeStock(
              selectedSizeObject
            );

          if (stock <= 0) {
            toast.error(
              "Selected size is out of stock"
            , {
            position: "bottom-center",
            autoClose: 1800,
            hideProgressBar: true,
            closeButton: false,
            icon: false,
            style: {
              background: "#FFF9F3",
              color: "#5A4030",
              border: "1px solid #E7DED5",
              boxShadow: "0 4px 14px rgba(90, 64, 48, 0.12)",
            },
          });

            return false;
          }

          productVariantId =
            selectedSizeObject?.productVariantId ??
            selectedSizeObject?.ProductVariantId ??
            selectedSizeObject?.variantId ??
            selectedSizeObject?.VariantId ??
            selectedSizeObject?.id ??
            selectedSizeObject?.Id ??
            null;

          if (
            productVariantId ==
            null
          ) {
            toast.error(
              "Product variant not found"
            , {
            position: "bottom-center",
            autoClose: 1800,
            hideProgressBar: true,
            closeButton: false,
            icon: false,
            style: {
              background: "#FFF9F3",
              color: "#5A4030",
              border: "1px solid #E7DED5",
              boxShadow: "0 4px 14px rgba(90, 64, 48, 0.12)",
            },
          });

            return false;
          }
        } else {
          const stock =
            Number(
              latestProduct?.stock ??
              latestProduct?.Stock ??
              0
            );

          if (stock <= 0) {
            toast.error(
              "Product is out of stock"
            , {
            position: "bottom-center",
            autoClose: 1800,
            hideProgressBar: true,
            closeButton: false,
            icon: false,
            style: {
              background: "#FFF9F3",
              color: "#5A4030",
              border: "1px solid #E7DED5",
              boxShadow: "0 4px 14px rgba(90, 64, 48, 0.12)",
            },
          });

            return false;
          }
        }

        const cartResponse =
          await api.get(
            "/cart"
          );

        const cartResponseData =
          cartResponse?.data?.data ??
          cartResponse?.data ??
          [];

        const cartItems =
          Array.isArray(
            cartResponseData?.items
          )
            ? cartResponseData.items
            : Array.isArray(
                cartResponseData
              )
              ? cartResponseData
              : [];

        const existingItem =
          cartItems.find(
            (item) => {
              const existingProductId =
                item?.productId ??
                item?.product?.id ??
                "";

              const existingVariantId =
                item?.productVariantId ??
                item?.productVariant?.id ??
                item?.variantId ??
                null;

              const sameProduct =
                String(
                  existingProductId
                ) ===
                String(
                  latestProduct.id
                );

              const sameVariant =
                existingVariantId ==
                null
                  ? productVariantId ==
                    null
                  : String(
                      existingVariantId
                    ) ===
                    String(
                      productVariantId
                    );

              return (
                sameProduct &&
                sameVariant
              );
            }
          );

        if (
          existingItem
        ) {
          toast.info(
            "Already in cart"
          , {
            position: "bottom-center",
            autoClose: 1800,
            hideProgressBar: true,
            closeButton: false,
            icon: false,
            style: {
              background: "#FFF9F3",
              color: "#5A4030",
              border: "1px solid #E7DED5",
              boxShadow: "0 4px 14px rgba(90, 64, 48, 0.12)",
            },
          });

          return false;
        }

        const cartItem = {
          productId:
            Number(
              latestProduct.id
            ),

          productVariantId:
            productVariantId ==
            null
              ? null
              : Number(
                  productVariantId
                ),

          quantity: 1,
        };

        await api.post(
          "/cart",
          cartItem
        );

        const updatedResponse =
          await api.get(
            "/cart"
          );

        const updatedResponseData =
          updatedResponse?.data?.data ??
          updatedResponse?.data ??
          [];

        const updatedCart =
          Array.isArray(
            updatedResponseData?.items
          )
            ? updatedResponseData.items
            : Array.isArray(
                updatedResponseData
              )
              ? updatedResponseData
              : [];

        dispatch(
          setCart(
            updatedCart
          )
        );

        closeSizePopup();

        toast.success(
          "Added to cart"
        , {
            position: "bottom-center",
            autoClose: 1800,
            hideProgressBar: true,
            closeButton: false,
            icon: false,
            style: {
              background: "#FFF9F3",
              color: "#5A4030",
              border: "1px solid #E7DED5",
              boxShadow: "0 4px 14px rgba(90, 64, 48, 0.12)",
            },
          });

        return true;
      } catch (error) {
        console.error(
          "Cart error:",
          error
        );

        console.error(
          "Cart API error:",
          error?.response?.data
        );

        toast.error(
          error?.response?.data
            ?.message ||
            error?.response?.data
              ?.title ||
            "Failed to add to cart"
        , {
            position: "bottom-center",
            autoClose: 1800,
            hideProgressBar: true,
            closeButton: false,
            icon: false,
            style: {
              background: "#FFF9F3",
              color: "#5A4030",
              border: "1px solid #E7DED5",
              boxShadow: "0 4px 14px rgba(90, 64, 48, 0.12)",
            },
          });

        return false;
      } finally {
        addingCartRef.current =
          false;
      }
    };

  const handleAddToCart =
    async (product) => {
      const currentUser =
        JSON.parse(
          localStorage.getItem(
            "user"
          ) || "null"
        );

      if (!currentUser) {
        toast.info(
          "Please login to add products to cart"
        , {
            position: "bottom-center",
            autoClose: 1800,
            hideProgressBar: true,
            closeButton: false,
            icon: false,
            style: {
              background: "#FFF9F3",
              color: "#5A4030",
              border: "1px solid #E7DED5",
              boxShadow: "0 4px 14px rgba(90, 64, 48, 0.12)",
            },
          });

        navigate("/login");

        return;
      }

      if (
        hasProductSizes(
          product
        )
      ) {
        setSelectedProduct(
          product
        );

        setSelectedSize("");

        setShowSizePopup(
          true
        );

        return;
      }

      await addProductToCart(
        product,
        null
      );
    };

  const handleAddSelectedSizeToCart =
    async () => {
      if (
        !selectedProduct
      ) {
        return;
      }

      if (
        !selectedSize
      ) {
        toast.error(
          "Please select a size"
        , {
            position: "bottom-center",
            autoClose: 1800,
            hideProgressBar: true,
            closeButton: false,
            icon: false,
            style: {
              background: "#FFF9F3",
              color: "#5A4030",
              border: "1px solid #E7DED5",
              boxShadow: "0 4px 14px rgba(90, 64, 48, 0.12)",
            },
          });

        return;
      }

      const selectedSizeObject =
        getProductSizes(
          selectedProduct
        ).find(
          (size) =>
            String(
              getSizeValue(
                size
              )
            ) ===
            String(
              selectedSize
            )
        );

      if (
        selectedSizeObject &&
        getSizeStock(
          selectedSizeObject
        ) <= 0
      ) {
        toast.error(
          "This size is out of stock"
        , {
            position: "bottom-center",
            autoClose: 1800,
            hideProgressBar: true,
            closeButton: false,
            icon: false,
            style: {
              background: "#FFF9F3",
              color: "#5A4030",
              border: "1px solid #E7DED5",
              boxShadow: "0 4px 14px rgba(90, 64, 48, 0.12)",
            },
          });

        return;
      }

      await addProductToCart(
        selectedProduct,
        selectedSize
      );
    };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-lg font-medium">
          Loading New Arrivals...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 md:px-8 lg:px-12 py-8">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">

        <h1 className="text-3xl md:text-4xl font-bold">
          New Arrivals
        </h1>

      </div>

      {newDrops.length === 0 ? (

        <div className="flex justify-center items-center py-20">

          <p className="text-gray-500 text-lg">
            No New Arrivals Found
          </p>

        </div>

      ) : (

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 md:gap-7">

          {newDrops.map(
            (item) => {

              const isInWishlist =
                wishlistItems.some(
                  (w) =>
                    String(
                      w.productId ??
                      w.id
                    ) ===
                    String(
                      item.id
                    )
                );

              const sizes =
                getProductSizes(
                  item
                );

              const hasSizes =
                sizes.length > 0;

              const totalStock =
                hasSizes
                  ? sizes.reduce(
                      (
                        total,
                        size
                      ) =>
                        total +
                        getSizeStock(
                          size
                        ),
                      0
                    )
                  : Number(
                      item.stock ??
                      item.Stock ??
                      0
                    );

              const isOutOfStock =
                totalStock <= 0;

              const currentPrice =
                Number(
                  item.price ??
                  item.Price ??
                  0
                );

              const originalPrice =
                item.originalPrice !=
                null
                  ? Number(
                      item.originalPrice
                    )
                  : null;

              const discount =
                item.discount !=
                null
                  ? Number(
                      item.discount
                    )
                  : null;

              const image =
                normalizeImageUrl(
                  item.imageUrl ??
                  item.ImageUrl ??
                  item.imagePath ??
                  item.ImagePath ??
                  item.image ??
                  item.Image ??
                  item.thumbnail ??
                  item.Thumbnail ??
                  ""
                );

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
                      src={image}
                      alt={
                        item.name ??
                        item.Name ??
                        "Product"
                      }
                      className="
                        w-full
                        h-full
                        object-cover
                        group-hover:scale-105
                        transition
                        duration-500
                      "
                    />

                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">

                        <span className="bg-black text-white px-4 py-2 rounded-full text-sm font-semibold">
                          OUT OF STOCK
                        </span>

                      </div>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();

                        handleWishlist(
                          item
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
                            ? "text-[#5A4030]"
                            : "text-[#B6A494]"
                        }`}
                      />

                    </button>

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

                  <div className="p-4">

                    <p className="text-xs font-medium tracking-wide text-gray-500 uppercase mb-1">
                      New Arrival
                    </p>

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
                      {item.name ??
                        item.Name}
                    </h2>

                    <div className="flex items-center gap-2 mt-2 flex-wrap">

                      <span className="font-semibold text-base">
                        ₹
                        {currentPrice.toLocaleString(
                          "en-IN"
                        )}
                      </span>

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

                      {discount &&
                        discount > 0 && (
                          <span className="text-[#6B4F3A] text-sm font-medium">
                            {discount}% off
                          </span>
                        )}

                    </div>

                  </div>

                </div>
              );
            }
          )}

        </div>
      )}

      {showSizePopup &&
        selectedProduct && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">

            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl">

              <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">

                <div>

                  <h3 className="text-lg font-semibold text-gray-900">
                    Select Size
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    Select a size to add this product to cart.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={
                    closeSizePopup
                  }
                  className="text-gray-500 hover:text-black text-xl"
                >
                  ×
                </button>

              </div>

              <div className="px-6 py-6">

                <div className="flex flex-wrap gap-2">

                  {getProductSizes(
                    selectedProduct
                  ).map(
                    (
                      size,
                      index
                    ) => {

                      const sizeValue =
                        getSizeValue(
                          size
                        );

                      const stock =
                        getSizeStock(
                          size
                        );

                      const isOutOfStock =
                        stock <= 0;

                      const isSelected =
                        String(
                          selectedSize
                        ) ===
                        String(
                          sizeValue
                        );

                      return (
                        <button
                          key={
                            size?.id ??
                            size?.Id ??
                            index
                          }
                          type="button"
                          disabled={
                            isOutOfStock
                          }
                          onClick={() =>
                            setSelectedSize(
                              sizeValue
                            )
                          }
                          className={`
                            min-w-[70px]
                            px-4
                            py-2.5
                            rounded-lg
                            border
                            text-sm
                            font-medium
                            transition
                            ${
                              isSelected
                                ? "bg-[#5A4030] text-white border-[#5A4030]"
                                : "bg-white text-[#5A4030] border-[#E7DED5]"
                            }
                            ${
                              isOutOfStock
                                ? "opacity-40 line-through cursor-not-allowed"
                                : "hover:border-[#6B4F3A]"
                            }
                          `}
                        >
                          {sizeValue}
                        </button>
                      );
                    }
                  )}

                </div>

              </div>

              <div className="px-6 pb-6 flex gap-3">

                <button
                  type="button"
                  onClick={
                    closeSizePopup
                  }
                  className="flex-1 border border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={
                    handleAddSelectedSizeToCart
                  }
                  className="flex-1 bg-[#5A4030] text-white py-3 rounded-lg hover:bg-[#6B4F3A] transition"
                >
                  Add to Cart
                </button>

              </div>

            </div>

          </div>
        )}

    </div>
  );
}

export default NewArrival;
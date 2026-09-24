import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../redux/cartSlice";
import { toast } from "react-toastify";
import api from "../api/api";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { items } = useSelector(
    (state) => state.cart
  );

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedAge, setSelectedAge] = useState("");
  const [selectedImage, setSelectedImage] = useState("");

  // IMAGE ZOOM

  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);

  // REVIEWS

  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  // FETCH PRODUCT

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(
          `/products/${id}`
        );

        const data = response.data;

        setProduct(data);

        const firstImage =
          data.image ||
          (Array.isArray(data.images) && data.images.length > 0
            ? data.images[0]
            : "");

        setSelectedImage(firstImage);

        setLoading(false);
      } catch (error) {
        console.error(
          "Product fetch error:",
          error
        );

        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // CHECK WHETHER PRODUCT HAS SIZES

  const hasSizes =
    Array.isArray(product?.sizes) &&
    product.sizes.length > 0;

  // AGE OPTIONS

  const ageOptions = Array.isArray(product?.age)
    ? product.age.filter(Boolean)
    : product?.age
      ? [product.age]
      : [];

  const hasMultipleAges = ageOptions.length > 1;

  // PRODUCT IMAGES

  const productImages = [
    ...(product?.image ? [product.image] : []),
    ...(Array.isArray(product?.images) ? product.images : []),
  ].filter(
    (image, index, array) =>
      image && array.indexOf(image) === index
  );

  // CURRENT SELECTED SIZE DATA

  const selectedSizeData =
    product?.sizes?.find(
      (size) => size.size === selectedSize
    );

  // CURRENT STOCK

  const currentStock = hasSizes
    ? Number(
        selectedSizeData?.stock ?? 0
      )
    : Number(
        product?.stock ?? 0
      );

  // OUT OF STOCK

  const outOfStock = hasSizes
    ? selectedSize &&
      currentStock <= 0
    : currentStock <= 0;

  // IMAGE ZOOM HELPERS

  const openZoom = () => {
    setZoomScale(1);
    setIsZoomOpen(true);
  };

  const closeZoom = () => {
    setZoomScale(1);
    setIsZoomOpen(false);
  };

  const increaseZoom = () => {
    setZoomScale((previous) =>
      Math.min(previous + 0.25, 3)
    );
  };

  const decreaseZoom = () => {
    setZoomScale((previous) =>
      Math.max(previous - 0.25, 1)
    );
  };

  const resetZoom = () => {
    setZoomScale(1);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeZoom();
      }
    };

    if (isZoomOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isZoomOpen]);

  // SELECT AGE

  const handleAgeSelect = (age) => {
    setSelectedAge(age);
  };

  // SELECT SIZE

  const handleSizeSelect = (size) => {
    if (!size) return;
    setSelectedSize(size);
  };

  // Automatically select the only age category.
  useEffect(() => {
    if (ageOptions.length === 1) {
      setSelectedAge(ageOptions[0]);
    } else {
      setSelectedAge("");
    }
  }, [product?.age]);

  // ADD TO CART

  const handleAddToCart = async () => {
    if (!product) return;

    // LOGIN CHECK

    if (!user) {
      toast.error("Please login first");

      setTimeout(() => {
        navigate("/login");
      }, 500);

      return;
    }

    // SIZE CHECK

    if (
      hasSizes &&
      !selectedSize
    ) {
      toast.error("Please select size");
      return;
    }

    // AGE CHECK

    if (hasMultipleAges && !selectedAge) {
      toast.error("Please select age");
      return;
    }

    // STOCK CHECK

    if (currentStock <= 0) {
      toast.error("Out of stock");
      return;
    }

    // DUPLICATE CHECK

    const exists = items.some(
      (item) =>
        String(
          item.productId || item.id
        ) === String(product.id) &&
        String(
          item.selectedSize || ""
        ) ===
          String(
            selectedSize || ""
          ) &&
        String(
          item.selectedAge || ""
        ) ===
          String(
            selectedAge || ""
          )
    );

    if (exists) {
      toast.error("Already in cart");
      return;
    }

    // CART ITEM

    const cartItem = {
      ...product,
      selectedSize:
        selectedSize || null,
      selectedAge:
        selectedAge || (ageOptions.length === 1 ? ageOptions[0] : null),
      qty: 1,
      productId: product.id,
      userId: user.id,
    };

    try {
      const response = await api.post(
        "/cart",
        cartItem
      );

      const data = response.data;

      dispatch(
        addToCart(data)
      );

      toast.success(
        "Added to cart"
      );
    } catch (error) {
      console.error(
        "Add to cart error:",
        error
      );

      toast.error(
        "Failed to add to cart"
      );
    }
  };

  // BUY NOW

  const handleBuyNow = () => {
    if (!product) return;

    // LOGIN CHECK

    if (!user) {
      toast.error("Please login first");

      setTimeout(() => {
        navigate("/login");
      }, 500);

      return;
    }

    // SIZE CHECK

    if (
      hasSizes &&
      !selectedSize
    ) {
      toast.error("Please select size");
      return;
    }

    // AGE CHECK

    if (hasMultipleAges && !selectedAge) {
      toast.error("Please select age");
      return;
    }

    // STOCK CHECK

    if (currentStock <= 0) {
      toast.error("Out of stock");
      return;
    }

    // REMOVE OLD BUY NOW ITEM

    localStorage.removeItem(
      "buyNowItem"
    );

    // NEW BUY NOW ITEM

    const buyNowItem = {
      ...product,
      selectedSize:
        selectedSize || null,
      selectedAge:
        selectedAge || (ageOptions.length === 1 ? ageOptions[0] : null),
      qty: 1,
      productId: product.id,
      userId: user.id,
    };

    // SAVE BUY NOW ITEM

    localStorage.setItem(
      "buyNowItem",
      JSON.stringify(
        buyNowItem
      )
    );

    toast.success(
      "Proceeding to checkout"
    );

    // NAVIGATE

    navigate("/checkout");
  };

  // FETCH ALL REVIEWS FOR THIS PRODUCT

  const loadReviews = async () => {
    try {
      // Get all reviews
      const response = await api.get(
        "/reviews"
      );

      const allReviews =
        Array.isArray(response.data)
          ? response.data
          : [];

      // Only this product
      const productReviews =
        allReviews
          .filter(
            (review) =>
              String(
                review.productId
              ) === String(id)
          )
          .sort(
            (a, b) =>
              new Date(
                b.createdAt
              ) -
              new Date(
                a.createdAt
              )
          );

      setReviews(
        productReviews
      );
    } catch (error) {
      console.error(
        "Review fetch error:",
        error
      );
    }
  };

  useEffect(() => {
    loadReviews();
  }, [id]);

  // SUBMIT REVIEW

  const handleSubmitReview = async () => {
    const currentUser =
      JSON.parse(
        localStorage.getItem(
          "user"
        ) || "null"
      );

    // LOGIN CHECK

    if (!currentUser) {
      toast.error(
        "Please login first"
      );

      navigate("/login");
      return;
    }

    // RATING CHECK

    if (
      rating < 1 ||
      rating > 5
    ) {
      toast.error(
        "Please select a rating"
      );

      return;
    }

    // COMMENT CHECK

    if (!reviewComment.trim()) {
      toast.error(
        "Please write a review"
      );

      return;
    }

    // DUPLICATE REVIEW CHECK

    const alreadyReviewed =
      reviews.some(
        (review) =>
          String(
            review.userId
          ) ===
            String(
              currentUser.id
            ) &&
          String(
            review.productId
          ) ===
            String(
              product.id
            )
      );

    if (alreadyReviewed) {
      toast.info(
        "You have already reviewed this product"
      );

      return;
    }

    // REVIEW DATA

    const reviewData = {
      productId: product.id,
      userId: currentUser.id,
      userName:
        currentUser.name ||
        "Customer",
      rating,
      title:
        reviewTitle.trim(),
      comment:
        reviewComment.trim(),
      productName:
        product.name,
      productImage:
        product.image,
      createdAt:
        new Date().toISOString(),
    };

    try {
      setReviewLoading(true);

      await api.post(
        "/reviews",
        reviewData
      );

      await loadReviews();

      setRating(0);
      setReviewTitle("");
      setReviewComment("");

      toast.success(
        "Review added successfully"
      );
    } catch (error) {
      console.error(
        "Review submit error:",
        error
      );

      toast.error(
        "Failed to add review"
      );
    } finally {
      setReviewLoading(false);
    }
  };

  // REVIEW SUMMARY

  const averageRating =
    reviews.length > 0
      ? reviews.reduce(
          (total, review) =>
            total +
            Number(
              review.rating || 0
            ),
          0
        ) / reviews.length
      : 0;

  // LOADING

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-center text-lg">
          Loading...
        </p>
      </div>
    );
  }

  // PRODUCT NOT FOUND

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-center text-lg">
          Product not found
        </p>
      </div>
    );
  }

  // UI

  return (
    <div className="px-4 md:px-10 py-10 bg-white min-h-screen">

      {/*
          PRODUCT SECTION
       */}

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 bg-white p-5 md:p-7 rounded-2xl shadow-md">

        {/*
            IMAGE SECTION
        */}

        <div>

          {/* MAIN IMAGE */}

          <div
            className="
              group
              relative
              w-[400px]
              max-w-full
              mx-auto
              aspect-[3/4]
              bg-white
              rounded-2xl
              overflow-hidden
              border
              border-gray-100
              cursor-zoom-in
            "
            onClick={openZoom}
            title="Click to zoom"
          >

            <img
              src={
                selectedImage ||
                product.image
              }
              alt={product.name}
              className="
                w-full
                h-full
                object-contain
                transition-transform
                duration-500
                group-hover:scale-[1.03]
              "
            />

            <div
              className="
                absolute
                bottom-4
                right-4
                bg-white/95
                border
                border-gray-200
                rounded-full
                px-3
                py-2
                text-xs
                font-medium
                text-gray-700
                shadow-sm
                opacity-0
                group-hover:opacity-100
                transition-opacity
                duration-300
                pointer-events-none
              "
            >
              Click to zoom
            </div>

          </div>

          {/* THUMBNAILS */}

          {productImages.length > 1 && (
            <div className="flex gap-3 mt-4 overflow-x-auto pb-1">

              {productImages.map(
                (image, index) => (
                  <button
                    type="button"
                    key={`${image}-${index}`}
                    onClick={() =>
                      setSelectedImage(
                        image
                      )
                    }
                    className={`
                      flex-shrink-0
                      rounded-xl
                      overflow-hidden
                      border-2
                      ${
                        selectedImage ===
                        image
                          ? "border-orange-500"
                          : "border-transparent"
                      }
                    `}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-20 h-24 object-contain bg-white"
                    />
                  </button>
                )
              )}

            </div>
          )}

        </div>

        {/* 
            PRODUCT DETAILS
         */}

        <div className="pt-2">

          {/* PRODUCT NAME */}

          <h1 className="text-2xl font-bold">
            {product.name}
          </h1>

          {/* CATEGORY */}

          {product.category && (
            <p className="text-gray-500 mt-2">
              Category:{" "}
              {product.category}
            </p>
          )}

          {/* SUBCATEGORY */}

          {product.subCategory && (
            <p className="text-gray-500 mt-1">
              Type:{" "}
              {product.subCategory}
            </p>
          )}

          {/* GENDER */}

          {product.gender && (
            <p className="text-gray-500 mt-1">
              For:{" "}
              {product.gender}
            </p>
          )}

          {/* AGE */}

          {ageOptions.length === 1 && (
            <p className="text-gray-500 mt-1">
              Age:{" "}{ageOptions[0]}
            </p>
          )}

          {hasMultipleAges && (
            <div className="mt-6">

              <h3 className="text-xl font-semibold mb-4">
                Select Age Category
              </h3>

              <div className="flex flex-wrap gap-3">
                {ageOptions.map((age) => (
                  <button
                    type="button"
                    key={age}
                    onClick={() => handleAgeSelect(age)}
                    className={`
                      px-5
                      py-3
                      rounded-xl
                      border
                      text-sm
                      font-medium
                      transition
                      ${
                        selectedAge === age
                          ? "border-orange-500 text-orange-500 bg-orange-50"
                          : "border-gray-400 text-gray-700 bg-white hover:border-orange-400"
                      }
                    `}
                  >
                    {age}
                  </button>
                ))}
              </div>

              {!selectedAge && (
                <p className="text-sm text-gray-500 mt-2">
                  Please select an age category.
                </p>
              )}

            </div>
          )}

          {/* PRICE */}

          <p className="text-3xl font-bold mt-5">
            ₹{product.price}
          </p>

          {/* =================================
              STOCK
          ================================= */}

          <div className="mt-4">

            {hasSizes ? (
              !selectedSize ? (
                <p className="text-gray-500 font-medium">
                  Select a size to check stock
                </p>
              ) : currentStock <= 0 ? (
                <p className="text-red-500 font-semibold">
                  Out of Stock
                </p>
              ) : currentStock <= 3 ? (
                <p className="text-orange-500 font-semibold">
                  Only {currentStock} left in stock
                </p>
              ) : (
                <p className="text-green-600 font-semibold">
                  In Stock:{" "}
                  {currentStock}
                </p>
              )
            ) : currentStock <= 0 ? (
              <p className="text-red-500 font-semibold">
                Out of Stock
              </p>
            ) : currentStock <= 3 ? (
              <p className="text-orange-500 font-semibold">
                Only {currentStock} left in stock
              </p>
            ) : (
              <p className="text-green-600 font-semibold">
                In Stock:{" "}
                {currentStock}
              </p>
            )}

          </div>

          {/* 
              PRODUCT DESCRIPTION
           */}

          <div className="mt-8 pt-6 border-t border-gray-200">

            <h2 className="text-lg font-semibold text-gray-900">
              Product Description
            </h2>

            <p className="text-sm text-gray-600 mt-3 leading-7">
              {product.description ||
                "A stylish and comfortable choice for little ones, designed for everyday wear and special moments."}
            </p>

          </div>

          {/*
              SIZE
          */}

          {hasSizes && (
            <div className="mt-8">

              <h3 className="text-xl font-semibold mb-4">
                Select Size
              </h3>

              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">

                {product.sizes?.map(
                  (sizeObj) => {

                    const sizeStock =
                      Number(
                        sizeObj.stock ?? 0
                      );

                    const sizeOutOfStock =
                      sizeStock <= 0;

                    return (
                      <button
                        type="button"
                        key={
                          sizeObj.size
                        }
                        onClick={() =>
                          handleSizeSelect(
                            sizeObj.size
                          )
                        }
                        disabled={
                          sizeOutOfStock
                        }
                        className={`
                          min-w-[110px]
                          px-3
                          py-3
                          border
                          rounded-xl
                          text-sm
                          font-medium
                          transition
                          ${
                            sizeOutOfStock
                              ? "border-gray-200 text-gray-400 bg-gray-100 cursor-not-allowed"
                              : selectedSize ===
                                sizeObj.size
                              ? "border-orange-500 text-orange-500 bg-orange-50"
                              : "border-gray-400 text-gray-700 bg-white hover:border-orange-400"
                          }
                        `}
                      >

                        <div>
                          {sizeObj.size}
                        </div>

                        <div
                          className={`
                            text-xs
                            mt-1
                            ${
                              sizeOutOfStock
                                ? "text-red-400"
                                : sizeStock <= 3
                                ? "text-orange-500"
                                : "text-green-600"
                            }
                          `}
                        >
                          {sizeOutOfStock
                            ? "Out of Stock"
                            : `Stock: ${sizeStock}`}
                        </div>

                      </button>
                    );
                  }
                )}

              </div>

            </div>
          )}

          {/* 
              STOCK BASED PRODUCT
           */}

          {!hasSizes && (
            <div
              className={`
                mt-5
                p-3
                rounded-lg
                border
                ${
                  currentStock <= 0
                    ? "bg-red-50 border-red-200"
                    : currentStock <= 3
                    ? "bg-orange-50 border-orange-200"
                    : "bg-green-50 border-green-200"
                }
              `}
            >

              <div className="flex justify-between items-center">

                <span className="font-medium">
                  Available Stock
                </span>

                <span
                  className={`
                    font-bold
                    ${
                      currentStock <= 0
                        ? "text-red-500"
                        : currentStock <= 3
                        ? "text-orange-500"
                        : "text-green-600"
                    }
                  `}
                >
                  {currentStock <= 0
                    ? "Out of Stock"
                    : currentStock}
                </span>

              </div>

            </div>
          )}

          {/* 
              SELECTED SIZE STOCK
          */}

          {hasSizes &&
            selectedSize && (
              <div
                className={`
                  mt-5
                  p-3
                  rounded-lg
                  border
                  ${
                    currentStock <= 0
                      ? "bg-red-50 border-red-200"
                      : currentStock <= 3
                      ? "bg-orange-50 border-orange-200"
                      : "bg-green-50 border-green-200"
                  }
                `}
              >

                <div className="flex justify-between items-center">

                  <span className="font-medium">
                    Selected Size
                  </span>

                  <span className="font-semibold">
                    {selectedSize}
                  </span>

                </div>

                {hasMultipleAges && selectedAge && (
                  <div className="flex justify-between items-center mt-1">

                    <span className="font-medium">
                      Selected Age
                    </span>

                    <span className="font-semibold">
                      {selectedAge}
                    </span>

                  </div>
                )}

                <div className="flex justify-between items-center mt-1">

                  <span className="font-medium">
                    Available Stock
                  </span>

                  <span
                    className={`
                      font-bold
                      ${
                        currentStock <= 0
                          ? "text-red-500"
                          : currentStock <= 3
                          ? "text-orange-500"
                          : "text-green-600"
                      }
                    `}
                  >
                    {currentStock <= 0
                      ? "Out of Stock"
                      : currentStock}
                  </span>

                </div>

              </div>
            )}

          {/* 
              BUTTONS
          */}

          <div className="flex gap-3 mt-7">

            {/* BUY NOW */}

            <button
              type="button"
              onClick={
                handleBuyNow
              }
              disabled={Boolean(
                outOfStock
              )}
              className={`
                flex-1
                h-14
                rounded-full
                border
                font-semibold
                text-base
                transition
                ${
                  outOfStock
                    ? "border-gray-300 text-gray-400 bg-white cursor-not-allowed"
                    : "border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
                }
              `}
            >
              Buy Now
            </button>

            {/* ADD TO BAG */}

            <button
              type="button"
              onClick={
                handleAddToCart
              }
              disabled={Boolean(
                outOfStock
              )}
              className={`
                flex-1
                h-14
                rounded-full
                font-semibold
                text-base
                transition
                ${
                  outOfStock
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-[#ff6b00] text-white hover:bg-[#e85f00]"
                }
              `}
            >
              {outOfStock
                ? "Out of Stock"
                : "Add to Bag"}
            </button>

          </div>

        </div>

      </div>

      {/* 
          IMAGE ZOOM MODAL
       */}

      {isZoomOpen && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            bg-black/80
            flex
            items-center
            justify-center
            p-4
          "
          onClick={closeZoom}
        >

          {/* CLOSE */}

          <button
            type="button"
            onClick={closeZoom}
            aria-label="Close image zoom"
            className="
              absolute
              top-4
              right-4
              sm:top-6
              sm:right-6
              z-20
              w-11
              h-11
              rounded-full
              bg-white
              text-gray-900
              text-2xl
              flex
              items-center
              justify-center
              shadow-lg
              hover:bg-gray-100
            "
          >
            ×
          </button>

          {/* ZOOM CONTROLS */}

          <div
            className="
              absolute
              bottom-5
              left-1/2
              -translate-x-1/2
              z-20
              flex
              items-center
              gap-2
              bg-white
              rounded-full
              shadow-lg
              p-2
            "
            onClick={(event) => event.stopPropagation()}
          >

            <button
              type="button"
              onClick={decreaseZoom}
              disabled={zoomScale <= 1}
              className="
                w-10
                h-10
                rounded-full
                border
                border-gray-200
                text-xl
                disabled:opacity-40
              "
              aria-label="Zoom out"
            >
              −
            </button>

            <button
              type="button"
              onClick={resetZoom}
              className="
                px-4
                h-10
                rounded-full
                border
                border-gray-200
                text-sm
                font-medium
              "
            >
              {Math.round(zoomScale * 100)}%
            </button>

            <button
              type="button"
              onClick={increaseZoom}
              disabled={zoomScale >= 3}
              className="
                w-10
                h-10
                rounded-full
                border
                border-gray-200
                text-xl
                disabled:opacity-40
              "
              aria-label="Zoom in"
            >
              +
            </button>

          </div>

          {/* IMAGE */}

          <div
            className="
              max-w-[92vw]
              max-h-[88vh]
              flex
              items-center
              justify-center
              overflow-auto
            "
            onClick={(event) => event.stopPropagation()}
          >

            <img
              src={
                selectedImage ||
                product.image
              }
              alt={product.name}
              className="
                max-w-full
                max-h-[85vh]
                w-auto
                h-auto
                object-contain
                rounded-xl
                select-none
                origin-center
                transition-transform
                duration-200
              "
              style={{
                transform: `scale(${zoomScale})`,
              }}
            />

          </div>

        </div>
      )}

      {/* 
          REVIEWS
      */}

      <section className="max-w-4xl mx-auto mt-8 bg-white rounded-2xl shadow-md p-5 md:p-7">

        {/* 
            REVIEW HEADER
         */}

        <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-5">

          <div>

            <h2 className="text-2xl font-bold text-gray-900">
              Ratings & Reviews
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              {reviews.length}{" "}
              {reviews.length === 1
                ? "review"
                : "reviews"}
            </p>

          </div>

          {reviews.length > 0 && (
            <div className="flex items-center gap-3">

              <div className="text-3xl font-bold text-gray-900">
                {averageRating.toFixed(1)}
              </div>

              <div>

                <div className="text-yellow-400 text-base tracking-wide">

                  {"★".repeat(
                    Math.round(
                      averageRating
                    )
                  )}

                  <span className="text-gray-300">
                    {"★".repeat(
                      5 -
                        Math.round(
                          averageRating
                        )
                    )}
                  </span>

                </div>

                <p className="text-xs text-gray-500">
                  Average rating
                </p>

              </div>

            </div>
          )}

        </div>

        {/* 
            RATING SUMMARY + WRITE REVIEW
        */}

        <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-5 mt-6">

          {/* SUMMARY */}

          <div className="bg-gray-50 rounded-2xl p-5 flex flex-col items-center justify-center text-center">

            <p className="text-sm text-gray-500">
              Product Rating
            </p>

            <p className="text-4xl font-bold text-gray-900 mt-2">
              {reviews.length > 0
                ? averageRating.toFixed(
                    1
                  )
                : "0.0"}
            </p>

            <div className="text-yellow-400 text-lg mt-1 tracking-wide">
              ★★★★★
            </div>

            <p className="text-xs text-gray-500 mt-2">
              Based on {reviews.length}{" "}
              {reviews.length === 1
                ? "review"
                : "reviews"}
            </p>

          </div>

          {/* WRITE REVIEW */}

          {user ? (
            <div className="border border-gray-200 rounded-2xl p-5">

              <h3 className="text-lg font-semibold text-gray-900">
                Write a Review
              </h3>

              <p className="text-sm text-gray-500 mt-1 mb-4">
                Share your experience with this product.
              </p>

              {/* STARS */}

              <div className="flex items-center gap-1 mb-4">

                {[1, 2, 3, 4, 5].map(
                  (star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() =>
                        setRating(star)
                      }
                      aria-label={`${star} star`}
                      className={`
                        text-3xl
                        leading-none
                        transition
                        ${
                          star <= rating
                            ? "text-yellow-400"
                            : "text-gray-300 hover:text-yellow-300"
                        }
                      `}
                    >
                      ★
                    </button>
                  )
                )}

                <span className="text-sm text-gray-500 ml-2">
                  {rating > 0
                    ? `${rating}/5`
                    : "Select a rating"}
                </span>

              </div>

              {/* TITLE */}

              <input
                type="text"
                value={reviewTitle}
                onChange={(e) =>
                  setReviewTitle(
                    e.target.value
                  )
                }
                placeholder="Review title (optional)"
                className="
                  w-full
                  border
                  border-gray-300
                  rounded-xl
                  px-4
                  py-3
                  mb-3
                  outline-none
                  focus:border-gray-500
                "
              />

              {/* COMMENT */}

              <textarea
                rows="4"
                value={reviewComment}
                onChange={(e) =>
                  setReviewComment(
                    e.target.value
                  )
                }
                placeholder="Write your review..."
                className="
                  w-full
                  border
                  border-gray-300
                  rounded-xl
                  px-4
                  py-3
                  mb-4
                  outline-none
                  focus:border-gray-500
                  resize-none
                "
              />

              <button
                type="button"
                onClick={
                  handleSubmitReview
                }
                disabled={
                  reviewLoading
                }
                className="
                  w-full
                  sm:w-auto
                  bg-black
                  text-white
                  px-6
                  py-3
                  rounded-xl
                  font-semibold
                  hover:bg-gray-800
                  transition
                  disabled:opacity-50
                "
              >
                {reviewLoading
                  ? "Submitting..."
                  : "Submit Review"}
              </button>

            </div>
          ) : (
            <div className="border border-gray-200 rounded-2xl p-5 flex flex-col justify-center">

              <h3 className="text-lg font-semibold text-gray-900">
                Want to write a review?
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Login to share your rating and review.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate("/login")
                }
                className="
                  mt-4
                  w-full
                  sm:w-fit
                  bg-black
                  text-white
                  px-6
                  py-3
                  rounded-xl
                  font-semibold
                  hover:bg-gray-800
                  transition
                "
              >
                Login to Review
              </button>

            </div>
          )}

        </div>

        {/* 
            REVIEW LIST
        */}

        <div className="mt-7">

          <div className="flex items-center justify-between mb-4">

            <div>

              <h3 className="text-lg font-semibold text-gray-900">
                Customer Reviews
              </h3>

              <p className="text-xs text-gray-500 mt-1">
                Reviews from all customers
              </p>

            </div>

          </div>

          {reviews.length === 0 ? (

            <div className="border border-dashed border-gray-300 rounded-2xl py-10 px-5 text-center">

              <p className="text-gray-600 font-medium">
                No reviews yet
              </p>

              <p className="text-sm text-gray-500 mt-1">
                Be the first to review this product.
              </p>

            </div>

          ) : (

            <div className="space-y-3">

              {reviews.map(
                (review, index) => {

                  const reviewRating =
                    Math.max(
                      0,
                      Math.min(
                        5,
                        Number(
                          review.rating || 0
                        )
                      )
                    );

                  return (
                    <div
                      key={
                        review.id ??
                        index
                      }
                      className="
                        border
                        border-gray-200
                        rounded-2xl
                        p-4
                        md:p-5
                      "
                    >

                      {/* USER + RATING */}

                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">

                        <div>

                          <p className="font-semibold text-gray-900">
                            {review.userName ||
                              "Customer"}
                          </p>

                          <div className="flex items-center gap-2 mt-1">

                            <div className="text-yellow-400 text-sm tracking-wide">

                              {"★".repeat(
                                reviewRating
                              )}

                              <span className="text-gray-300">

                                {"★".repeat(
                                  5 -
                                    reviewRating
                                )}

                              </span>

                            </div>

                            <span className="text-xs text-gray-400">
                              {reviewRating}/5
                            </span>

                          </div>

                        </div>

                        {review.createdAt && (
                          <span className="text-xs text-gray-400">
                            {new Date(
                              review.createdAt
                            ).toLocaleDateString(
                              "en-IN"
                            )}
                          </span>
                        )}

                      </div>

                      {/* TITLE */}

                      {review.title && (
                        <h4 className="font-semibold text-gray-900 mt-4">
                          {review.title}
                        </h4>
                      )}

                      {/* COMMENT */}

                      <p className="text-gray-600 mt-2 leading-6">
                        {review.comment}
                      </p>

                    </div>
                  );
                }
              )}

            </div>

          )}

        </div>

      </section>

    </div>
  );
}

export default ProductDetails;
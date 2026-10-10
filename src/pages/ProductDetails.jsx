import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../redux/cartSlice";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
  const [selectedImage, setSelectedImage] = useState("");


  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);


  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  const getStoredUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  };

  const user = getStoredUser();


  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(
          `/products/${id}`
        );

        const responseData = response.data;
        const data = responseData?.data ?? responseData;

        const variants = Array.isArray(data?.variants)
          ? data.variants
          : [];

        const normalizedSizes = variants.flatMap((variant) => {
          const nestedSizes = Array.isArray(variant?.sizes)
            ? variant.sizes
            : Array.isArray(variant?.Sizes)
            ? variant.Sizes
            : null;

          const sizeItems = nestedSizes ?? [variant];

          return sizeItems.map((sizeItem) => ({
            // Each nested size represents a ProductVariant database row.
            // Prefer its own ID; the grouped ageGroup object has no ID.
            id:
              sizeItem?.id ??
              sizeItem?.Id ??
              sizeItem?.productVariantId ??
              sizeItem?.ProductVariantId ??
              null,
            productVariantId:
              sizeItem?.productVariantId ??
              sizeItem?.ProductVariantId ??
              sizeItem?.id ??
              sizeItem?.Id ??
              null,
            ageGroup:
              variant?.ageGroup ??
              variant?.AgeGroup ??
              sizeItem?.ageGroup ??
              sizeItem?.AgeGroup ??
              null,
            size:
              sizeItem?.size ??
              sizeItem?.Size ??
              sizeItem?.name ??
              sizeItem?.Name ??
              "",
            stock: Number(
              sizeItem?.stock ??
              sizeItem?.Stock ??
              variant?.stock ??
              variant?.Stock ??
              0
            ),
          }));
        }).filter((item) => item.size);

        const ageGroups = [...new Set(
          variants
            .map((variant) => variant?.ageGroup ?? variant?.AgeGroup ?? "")
            .filter(Boolean)
        )];

      
        const backendImages = Array.isArray(data?.images)
          ? data.images
          : Array.isArray(data?.Images)
          ? data.Images
          : [];

        const getImageUrl = (image) => {
          if (typeof image === "string") return image;
          return image?.imageUrl ?? image?.ImageUrl ?? image?.url ?? image?.Url ?? "";
        };

        const primaryImage = getImageUrl(
          data?.imageUrl ??
          data?.ImageUrl ??
          data?.image ??
          data?.Image ??
          backendImages[0] ??
          ""
        );

        const allImages = [
          primaryImage,
          ...backendImages.map(getImageUrl),
        ].filter(
          (image, index, array) =>
            image && array.indexOf(image) === index
        );

        const normalizedProduct = {
          ...data,
          image: primaryImage,
          images: allImages,
          category:
            data?.categoryName ??
            data?.CategoryName ??
            data?.category?.name ??
            data?.Category?.Name ??
            data?.category ??
            "",
          subCategory:
            data?.subCategoryName ??
            data?.SubCategoryName ??
            data?.subCategory?.name ??
            data?.SubCategory?.Name ??
            data?.subCategory ??
            "",
          id: data?.id ?? data?.Id,
          name: data?.name ?? data?.Name ?? "Product",
          description: data?.description ?? data?.Description ?? "",
          price: Number(data?.price ?? data?.Price ?? 0),
          stock: Number(data?.stock ?? data?.Stock ?? 0),
          gender: data?.gender ?? data?.Gender ?? null,
          age: data?.age ?? data?.Age ?? ageGroups,
          variants,
          sizes: normalizedSizes,
        };

        setProduct(normalizedProduct);
        setSelectedSize("");

        setSelectedImage(allImages[0] ?? "");

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


  const hasSizes =
    Array.isArray(product?.sizes) &&
    product.sizes.length > 0;


  const productImages = [
    ...(product?.image ? [product.image] : []),
    ...(Array.isArray(product?.images) ? product.images : []),
    ...(Array.isArray(product?.Images) ? product.Images : []),
  ].filter(
    (image, index, array) =>
      image && array.indexOf(image) === index
  );


  const selectedSizeData =
    product?.sizes?.find(
      (size) => size.size === selectedSize
    );


  const currentStock = hasSizes
    ? Number(
        selectedSizeData?.stock ?? 0
      )
    : Number(
        product?.stock ?? 0
      );


  const outOfStock = hasSizes
    ? Boolean(selectedSize) && currentStock <= 0
    : currentStock <= 0;


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


  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };


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
        String(item.selectedSize || "") === String(selectedSize || "")
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
      productVariantId: selectedSizeData?.productVariantId != null
        ? Number(selectedSizeData.productVariantId)
        : selectedSizeData?.id != null
          ? Number(selectedSizeData.id)
          : null,
      qty: 1,
      productId: product.id,
      userId: user.id,
    };

    try {
      const response = await api.post(
        "/cart",
        cartItem
      );

      const responseData = response.data;
      const data = responseData?.data ?? responseData;

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
      productVariantId: selectedSizeData?.productVariantId != null
        ? Number(selectedSizeData.productVariantId)
        : selectedSizeData?.id != null
          ? Number(selectedSizeData.id)
          : null,
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


  const loadReviews = async () => {
    try {
      const response = await api.get(
        `/reviews/product/${id}`
      );

      const responseData = response.data;

      const productReviews =
        Array.isArray(responseData?.data)
          ? responseData.data
          : Array.isArray(responseData)
          ? responseData
          : [];

      const sortedReviews =
        [...productReviews].sort(
          (a, b) =>
            new Date(
              b.createdAt
            ) -
            new Date(
              a.createdAt
            )
        );

      setReviews(
        sortedReviews
      );
    } catch (error) {
      console.error(
        "Review fetch error:",
        error
      );

      setReviews([]);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.errors?.[0] ||
        "Failed to retrieve reviews.";

      console.error(
        "Backend review error:",
        message
      );
    }
  };

  useEffect(() => {
    if (id) {
      loadReviews();
    }
  }, [id]);


  const handleSubmitReview = async () => {
    const currentUser = getStoredUser();

    // LOGIN CHECK

    if (!currentUser) {
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


    const reviewData = {
      productId: Number(
        product.id
      ),
      rating: Number(
        rating
      ),
      title:
        reviewTitle.trim(),
      comment:
        reviewComment.trim(),
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

      if (
        error?.response?.status === 401
      ) {
        toast.error(
          "Please login first"
        );

        navigate("/login");
        return;
      }

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.errors?.[0] ||
        "Failed to add review.";

      toast.error(
        message
      );
    } finally {
      setReviewLoading(false);
    }
  };


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


  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-center text-lg">
          Loading...
        </p>
      </div>
    );
  }


  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-center text-lg">
          Product not found
        </p>
      </div>
    );
  }


  return (
    <div className="px-4 md:px-10 py-10 bg-white min-h-screen">

      {}

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 bg-white p-5 md:p-7 rounded-2xl shadow-md">

        {}

        <div>

          {}

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

          {}

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
                          ? "border-[#5A4030]"
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

        {}

        <div className="pt-2">

          {}

          <h1 className="text-2xl font-bold">
            {product.name}
          </h1>

          {}

          {product.category && (
            <p className="text-gray-500 mt-2">
              Category:{" "}
              {product.category}
            </p>
          )}

          {}

          {product.subCategory && (
            <p className="text-gray-500 mt-1">
              Type:{" "}
              {product.subCategory}
            </p>
          )}

          {}

          {product.gender && (
            <p className="text-gray-500 mt-1">
              For:{" "}
              {product.gender}
            </p>
          )}

          {}

          {product.age && (
            <p className="text-gray-500 mt-1">
              Age:{" "}
              {Array.isArray(product.age)
                ? product.age.join(" • " )
                : product.age}
            </p>
          )}

          {}

          <p className="text-3xl font-bold mt-5">
            ₹{product.price}
          </p>

          {}

          {}

          <div className="mt-8 pt-6 border-t border-gray-200">

            <h2 className="text-lg font-semibold text-gray-900">
              Product Description
            </h2>

            <p className="text-sm text-gray-600 mt-3 leading-7">
              {product.description ||
                "A stylish and comfortable choice for little ones, designed for everyday wear and special moments."}
            </p>

          </div>

          {}

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
                              ? "border-[#5A4030] text-[#5A4030] bg-[#F7F3EE]"
                              : "border-[#E7DED5] text-[#5A4030] bg-white hover:border-[#6B4F3A]"
                          }
                        `}
                      >

                        <div>
                          {sizeObj.size}
                        </div>

                      </button>
                    );
                  }
                )}

              </div>

            </div>
          )}

          {}

          {}

          <div className="flex gap-3 mt-7">

            {}

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
                    : "border-[#E7DED5] bg-white text-[#5A4030] hover:bg-[#F7F3EE]"
                }
              `}
            >
              Buy Now
            </button>

            {}

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
                    : "bg-[#5A4030] text-white hover:bg-[#4A3326]"
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

      {}

      {isZoomOpen && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            bg-[#5A4030]/80
            flex
            items-center
            justify-center
            p-4
          "
          onClick={closeZoom}
        >

          {}

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

          {}

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

          {}

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

      {}

      <section className="max-w-4xl mx-auto mt-8 bg-white rounded-2xl shadow-md p-5 md:p-7">

        {}

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

                <div className="text-[#6B4F3A] text-base tracking-wide">

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

        {}

        <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-5 mt-6">

          {}

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

            <div className="text-[#6B4F3A] text-lg mt-1 tracking-wide">
              ★★★★★
            </div>

            <p className="text-xs text-gray-500 mt-2">
              Based on {reviews.length}{" "}
              {reviews.length === 1
                ? "review"
                : "reviews"}
            </p>

          </div>

          {}

          <div className="border border-gray-200 rounded-2xl p-5">

            <h3 className="text-lg font-semibold text-gray-900">
              Write a Review
            </h3>

            <p className="text-sm text-gray-500 mt-1 mb-4">
              Share your experience with this product.
            </p>

            {}

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
                          ? "text-[#6B4F3A]"
                          : "text-gray-300 hover:text-[#5A4030]"
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

            {}

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
                focus:border-[#6B4F3A]
              "
            />

            {}

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
                focus:border-[#6B4F3A]
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
                bg-[#5A4030]
                text-white
                px-6
                py-3
                rounded-xl
                font-semibold
                hover:bg-[#4A3326]
                transition
                disabled:opacity-50
              "
            >
              {reviewLoading
                ? "Submitting..."
                : "Submit Review"}
            </button>

          </div>

        </div>

        {}

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

                      {}

                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">

                        <div>

                          <p className="font-semibold text-gray-900">
                            {review.userName ||
                              "Customer"}
                          </p>

                          <div className="flex items-center gap-2 mt-1">

                            <div className="text-[#6B4F3A] text-sm tracking-wide">

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

                      {}

                      {review.title && (
                        <h4 className="font-semibold text-gray-900 mt-4">
                          {review.title}
                        </h4>
                      )}

                      {}

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

      <ToastContainer
        position="bottom-center"
        autoClose={1800}
        hideProgressBar
        newestOnTop
        closeButton={false}
        closeOnClick
        pauseOnHover={false}
        draggable={false}
        theme="light"
        icon={false}
        toastStyle={{
          background: "#FFF5F7",
          color: "#78394B",
          border: "1px solid #F0C7D1",
          borderRadius: "10px",
          boxShadow: "0 4px 14px rgba(120, 57, 75, 0.10)",
          fontSize: "13px",
          fontWeight: "500",
          minHeight: "42px",
          padding: "10px 14px",
        }}
      />
    </div>
  );
}

export default ProductDetails;
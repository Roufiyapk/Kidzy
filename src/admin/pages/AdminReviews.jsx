import { useEffect, useState } from "react";
import {
  FaStar,
  FaTrash,
  FaTrophy,
} from "react-icons/fa";
import api from "../../api/api";

function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  // FETCH REVIEWS + PRODUCTS
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [reviewsResponse, productsResponse] = await Promise.all([
          api.get("/reviews"),
          api.get("/products"),
        ]);

        const existingReviews = Array.isArray(reviewsResponse.data)
          ? reviewsResponse.data
          : [];

        const existingProducts = Array.isArray(productsResponse.data)
          ? productsResponse.data
          : [];

        const sortedReviews = [...existingReviews].sort(
          (a, b) =>
            new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );

        setReviews(sortedReviews);
        setProducts(existingProducts);
      } catch (error) {
        console.error("Failed to load reviews/products:", error);
        setReviews([]);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // FIND PRODUCT FROM REVIEW
  const getProductForReview = (review) => {
    return products.find(
      (product) => String(product.id) === String(review.productId)
    );
  };

  // MAKE / REMOVE BEST SELLER
  const handleBestSeller = async (review) => {
    const product = getProductForReview(review);

    if (!product) {
      alert("Product not found for this review.");
      return;
    }

    try {
      setActionId(`best-${review.id}`);

      const updatedBestSeller = !Boolean(product.bestSeller);

      await api.patch(`/products/${product.id}`, {
        bestSeller: updatedBestSeller,
      });

      setProducts((prevProducts) =>
        prevProducts.map((item) =>
          String(item.id) === String(product.id)
            ? { ...item, bestSeller: updatedBestSeller }
            : item
        )
      );
    } catch (error) {
      console.error("Failed to update best seller:", error);
      alert("Failed to update best seller status.");
    } finally {
      setActionId(null);
    }
  };

  // DELETE REVIEW
  const handleDeleteReview = async (reviewId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this review?"
    );

    if (!confirmed) return;

    try {
      setActionId(`delete-${reviewId}`);

      await api.delete(`/reviews/${reviewId}`);

      setReviews((prevReviews) =>
        prevReviews.filter(
          (review) => String(review.id) !== String(reviewId)
        )
      );
    } catch (error) {
      console.error("Failed to delete review:", error);
      alert("Failed to delete review.");
    } finally {
      setActionId(null);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
          <p className="text-gray-500 font-medium">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      {/* 
          HEADER
       */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Customer Reviews
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          View customer ratings and manage best seller products.
        </p>
      </div>

      {/* 
          EMPTY STATE
       */}
      {reviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
          <p className="text-gray-500">No reviews available.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {reviews.map((review) => {
            const product = getProductForReview(review);
            const productImage = product?.image || review.productImage || "";
            const isBestSeller = Boolean(product?.bestSeller);

            return (
              <div
                key={review.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 md:p-6"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* 
                      PRODUCT IMAGE
                 */}
                  <div className="flex-shrink-0">
                    {productImage ? (
                      <img
                        src={productImage}
                        alt={review.productName || "Product"}
                        className="w-24 h-28 object-contain bg-white rounded-xl border border-gray-200"
                      />
                    ) : (
                      <div className="w-24 h-28 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center text-xs text-gray-400 text-center p-2">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* 
                      REVIEW DETAILS
                   */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">
                          Product
                        </p>

                        <h2 className="text-lg font-bold text-gray-900 truncate">
                          {review.productName || product?.name || "Unknown Product"}
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                          Customer: {review.userName || "Customer"}
                        </p>

                        {review.createdAt && (
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      {/* 
                          RATING
                      */}
                      <div className="flex-shrink-0">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <FaStar
                              key={star}
                              className={
                                star <= Number(review.rating || 0)
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }
                            />
                          ))}

                          <span className="ml-2 text-sm font-semibold text-gray-700">
                            {Number(review.rating || 0)}/5
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 
                        REVIEW TITLE
                     */}
                    <h3 className="text-base font-bold text-gray-900 mt-5">
                      {review.title || "Great Product"}
                    </h3>

                    {/* 
                        REVIEW COMMENT
                    */}
                    <p className="text-sm text-gray-600 leading-relaxed mt-2">
                      {review.comment || "No comment provided."}
                    </p>

                    {/* 
                        ACTIONS
                     */}
                    <div className="flex flex-wrap items-center gap-3 mt-6">
                      <button
                        type="button"
                        onClick={() => handleBestSeller(review)}
                        disabled={
                          !product || actionId === `best-${review.id}`
                        }
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed ${
                          isBestSeller
                            ? "bg-green-600 text-white hover:bg-green-700"
                            : "bg-gray-900 text-white hover:bg-gray-800"
                        }`}
                      >
                        <FaTrophy className="text-sm" />
                        {actionId === `best-${review.id}`
                          ? "Updating..."
                          : isBestSeller
                          ? "Remove Best Seller"
                          : "Make Best Seller"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteReview(review.id)}
                        disabled={actionId === `delete-${review.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 text-red-600 bg-white hover:bg-red-50 text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <FaTrash className="text-sm" />
                        {actionId === `delete-${review.id}`
                          ? "Deleting..."
                          : "Delete Review"}
                      </button>

                      {!product && (
                        <span className="text-xs text-red-500">
                          Product not found
                        </span>
                      )}
                    </div>
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

export default AdminReviews;

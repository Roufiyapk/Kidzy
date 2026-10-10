import { useEffect, useState } from "react";
import {
  FaStar,
  FaTrash,
} from "react-icons/fa";
import api from "../../api/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const [deleteReviewId, setDeleteReviewId] =
    useState(null);

  const notify = (message, type = "error") => {
    toast[type](message, {
      position: "bottom-center",
      autoClose: 1800,
      hideProgressBar: true,
      closeButton: false,
      icon: false,
      style: {
        background: "#FFF9F3",
        color: "#30251F",
        border: "1px solid #D8C7B5",
        borderRadius: "12px",
        boxShadow: "0 4px 16px rgba(48, 37, 31, 0.16)",
        fontSize: "14px",
        fontWeight: 500,
      },
    });
  };

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);

        const response = await api.get(
          "/reviews"
        );

        console.log(
          "Reviews API response:",
          response.data
        );

        const reviewData =
          response?.data?.data;

        const existingReviews =
          Array.isArray(reviewData)
            ? reviewData
            : [];

        const sortedReviews =
          [...existingReviews].sort(
            (a, b) => {
              return (
                new Date(
                  b.createdAt || 0
                ).getTime() -
                new Date(
                  a.createdAt || 0
                ).getTime()
              );
            }
          );

        setReviews(sortedReviews);
      } catch (error) {
        console.error(
          "Failed to load reviews:",
          error
        );

        console.error(
          "Status:",
          error.response?.status
        );

        console.error(
          "Backend response:",
          error.response?.data
        );

        setReviews([]);

        notify(
          error.response?.data?.message ||
            "Failed to load reviews."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const openDeleteConfirmation = (
    reviewId
  ) => {
    setDeleteReviewId(reviewId);
  };

  const closeDeleteConfirmation = () => {
    if (actionId !== null) {
      return;
    }

    setDeleteReviewId(null);
  };

  const handleDeleteReview = async () => {
    if (deleteReviewId === null) {
      return;
    }

    const reviewId = deleteReviewId;

    try {
      setActionId(
        `delete-${reviewId}`
      );

      await api.delete(
        `/reviews/${reviewId}`
      );

      setReviews(
        (previousReviews) => {
          return previousReviews.filter(
            (review) => {
              return (
                String(review.id) !==
                String(reviewId)
              );
            }
          );
        }
      );

      setDeleteReviewId(null);

      notify(
        "Review deleted successfully.",
        "success"
      );
    } catch (error) {
      console.error(
        "Failed to delete review:",
        error
      );

      console.error(
        "Status:",
        error.response?.status
      );

      console.error(
        "Backend response:",
        error.response?.data
      );

      notify(
        error.response?.data?.message ||
          "Failed to delete review."
      );
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F1EB] p-4 sm:p-6 md:p-8">

        <div className="rounded-2xl border border-[#E5D9CC] bg-white p-10 text-center">

          <p className="font-medium text-[#817467]">
            Loading reviews...
          </p>

        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F1EB] p-4 sm:p-6 md:p-8">

      {}

      <div className="mb-8">

        <h1 className="text-2xl font-bold text-[#30251F] md:text-3xl">
          Customer Reviews
        </h1>

        <p className="mt-1 text-sm text-[#817467]">
          View customer reviews and manage
          customer feedback.
        </p>

      </div>

      {}

      {reviews.length === 0 ? (

        <div className="rounded-2xl border border-[#E5D9CC] bg-white p-10 text-center">

          <p className="text-[#817467]">
            No reviews available.
          </p>

        </div>

      ) : (

        <div className="space-y-5">

          {}

          {reviews.map((review) => {

            const productName =
              review?.productName ||
              review?.product?.name ||
              "Unknown Product";

            const productImage =
              review?.productImage ||
              review?.product?.image ||
              review?.product?.imageUrl ||
              "";

            const customerName =
              review?.userName ||
              review?.user?.name ||
              review?.customerName ||
              "Customer";

            const rating = Number(
              review?.rating || 0
            );

            return (
              <div
                key={review.id}
                className="rounded-2xl border border-[#E5D9CC] bg-white p-5 shadow-[0_8px_28px_rgba(48,37,31,0.06)] transition-shadow hover:shadow-[0_12px_32px_rgba(48,37,31,0.10)] md:p-6"
              >

                <div className="flex flex-col gap-6 lg:flex-row">

                  <div className="shrink-0">

                    {productImage ? (

                      <img
                        src={productImage}
                        alt={productName}
                        className="h-28 w-24 rounded-xl border border-[#E5D9CC] bg-white object-contain"
                      />

                    ) : (

                      <div className="flex h-28 w-24 items-center justify-center rounded-xl border border-[#E5D9CC] bg-[#F5F1EB] p-2 text-center text-xs text-[#A99A8B]">
                        No Image
                      </div>

                    )}

                  </div>

                  <div className="min-w-0 flex-1">

                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

                      <div className="min-w-0">

                        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#A99A8B]">
                          Product
                        </p>

                        <h2 className="truncate text-lg font-bold text-[#30251F]">
                          {productName}
                        </h2>

                        <p className="mt-1 text-sm text-[#817467]">
                          Customer:{" "}
                          {customerName}
                        </p>

                        {review?.createdAt && (

                          <p className="mt-1 text-xs text-[#A99A8B]">
                            {new Date(
                              review.createdAt
                            ).toLocaleDateString()}
                          </p>

                        )}

                      </div>

                      <div className="shrink-0">

                        <div className="flex items-center gap-1">

                          {[1, 2, 3, 4, 5].map(
                            (star) => (

                              <FaStar
                                key={star}
                                className={
                                  star <= rating
                                    ? "text-[#C9A35F]"
                                    : "text-[#DED6CC]"
                                }
                              />

                            )
                          )}

                          <span className="ml-2 text-sm font-semibold text-[#5A4030]">
                            {rating}/5
                          </span>

                        </div>

                      </div>

                    </div>

                    <h3 className="mt-5 text-base font-bold text-[#30251F]">
                      {review?.title ||
                        "Customer Review"}
                    </h3>

                    <p className="mt-2 text-sm leading-relaxed text-[#6E6258]">
                      {review?.comment ||
                        review?.reviewText ||
                        "No comment provided."}
                    </p>

                    <div className="mt-6">

                      <button
                        type="button"
                        onClick={() =>
                          openDeleteConfirmation(
                            review.id
                          )
                        }
                        disabled={
                          actionId ===
                          `delete-${review.id}`
                        }
                        className="inline-flex items-center gap-2 rounded-lg border border border-[#E5B8B2] bg-white px-4 py-2 text-sm font-semibold text-[#A33D32] transition hover:bg-[#FFF1EF] disabled:cursor-not-allowed disabled:opacity-60"
                      >

                        <FaTrash className="text-sm" />

                        {actionId ===
                        `delete-${review.id}`
                          ? "Deleting..."
                          : "Delete Review"}

                      </button>

                    </div>

                  </div>

                </div>

              </div>
            );
          })}

        </div>

      )}

      {}

      {deleteReviewId !== null && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={
            closeDeleteConfirmation
          }
        >

          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(event) => {
              event.stopPropagation();
            }}
          >

            {}

            <div className="mb-5 flex justify-center">

              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">

                <FaTrash className="text-xl text-red-600" />

              </div>

            </div>

            {}

            <h2 className="text-center text-xl font-bold text-[#30251F]">
              Delete Review?
            </h2>

            {}

            <p className="mt-2 text-center text-sm leading-relaxed text-[#817467]">

              Are you sure you want to delete
              this review?

              <br />

              This action cannot be undone.

            </p>

            {}

            <div className="mt-6 flex justify-center gap-3">

              <button
                type="button"
                onClick={
                  closeDeleteConfirmation
                }
                disabled={
                  actionId !== null
                }
                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-[#5A4030] transition hover:bg-[#F5F1EB] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleDeleteReview
                }
                disabled={
                  actionId ===
                  `delete-${deleteReviewId}`
                }
                className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {actionId ===
                `delete-${deleteReviewId}`
                  ? "Deleting..."
                  : "Delete"}

              </button>

            </div>

          </div>

        </div>

      )}
      <ToastContainer
        position="bottom-center"
        autoClose={1800}
        hideProgressBar
        newestOnTop
        closeButton={false}
        pauseOnFocusLoss
        draggable
        theme="light"
      />
    </div>
  );
}

export default AdminReviews;
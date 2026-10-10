import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import api from "../api/api";

function Orders() {
  const navigate = useNavigate();
  const location = useLocation();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedOrder, setSelectedOrder] =
    useState(null);

  const [successMessage, setSuccessMessage] =
    useState("");

  const [
    cancelOrderConfirmation,
    setCancelOrderConfirmation,
  ] = useState(null);

  const [cancellingOrder, setCancellingOrder] =
    useState(false);

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) {
      return "";
    }

    if (
      imageUrl.startsWith("http://") ||
      imageUrl.startsWith("https://") ||
      imageUrl.startsWith("data:")
    ) {
      return imageUrl;
    }

    const baseURL =
      api.defaults?.baseURL || "";

    const backendBaseURL =
      baseURL.replace(/\/api\/?$/, "");

    if (imageUrl.startsWith("/")) {
      return `${backendBaseURL}${imageUrl}`;
    }

    return `${backendBaseURL}/${imageUrl}`;
  };

  useEffect(() => {
    const getOrders = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const response = await api.get(
          "/orders/my-orders"
        );

        const data =
          response?.data?.data;

        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          setOrders([]);
        }
      } catch (error) {
        console.error(
          "Failed to load orders:",
          error
        );

        console.error(
          "Backend response:",
          error.response?.data
        );

        toast.error(
          error.response?.data?.message ||
            "Failed to load your orders"
        );
      } finally {
        setLoading(false);
      }
    };

    getOrders();
  }, [user?.id]);

  useEffect(() => {
    const message =
      location.state?.orderSuccess;

    if (message) {
      setSuccessMessage(message);

      navigate(location.pathname, {
        replace: true,
        state: {},
      });
    }
  }, [
    location.state,
    location.pathname,
    navigate,
  ]);

  const handleCancelOrder = async (
    order
  ) => {
    if (!order?.id) {
      return;
    }

    try {
      setCancellingOrder(true);

      const response =
        await api.put(
          `/orders/${order.id}/cancel`
        );

      const updatedOrder =
        response?.data?.data;

      if (!updatedOrder) {
        throw new Error(
          "Invalid cancellation response"
        );
      }

      setOrders(
        (currentOrders) =>
          currentOrders.map(
            (currentOrder) =>
              String(
                currentOrder.id
              ) ===
              String(order.id)
                ? updatedOrder
                : currentOrder
          )
      );

      setSelectedOrder(
        (currentOrder) =>
          currentOrder &&
          String(
            currentOrder.id
          ) ===
            String(order.id)
            ? updatedOrder
            : currentOrder
      );

      toast.success(
        "Order cancelled successfully"
      );
    } catch (error) {
      console.error(
        "Cancel order error:",
        error
      );

      console.error(
        "Backend response:",
        error.response?.data
      );

      toast.error(
        error.response?.data?.message ||
          "Unable to cancel order"
      );
    } finally {
      setCancellingOrder(false);
    }
  };

  if (!user?.id) {
    return (
      <div className="min-h-screen bg-[#F7F3EE] flex items-center justify-center px-4">

        <div className="bg-white rounded-2xl shadow-sm border border-[#E7DED5] p-8 text-center max-w-md w-full">

          <h2 className="text-2xl font-bold mb-3">
            Please Login
          </h2>

          <p className="text-[#7A6A5D] mb-6">
            Login to view your orders.
          </p>

          <button
            onClick={() =>
              navigate("/login")
            }
            className="bg-[#5A4030] text-white px-6 py-3 rounded-xl hover:bg-[#4A3326]"
          >
            Login
          </button>

        </div>

      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F3EE] flex items-center justify-center">

        <p className="text-lg text-[#7A6A5D]">
          Loading your orders...
        </p>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F3EE] px-4 md:px-10 py-10">

      <div className="max-w-5xl mx-auto">

        {}

        <div className="flex items-center justify-between mb-8">

          <div>

            <h1 className="text-3xl font-bold">
              My Orders
            </h1>

            <p className="text-[#7A6A5D] mt-1">
              View your order history
            </p>

          </div>

          <button
            onClick={() =>
              navigate("/")
            }
            className="hidden sm:block border border-[#E7DED5] px-5 py-2.5 rounded-xl hover:bg-[#5A4030] hover:text-white transition"
          >
            Continue Shopping
          </button>

        </div>

        {}

        {successMessage && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 flex items-start gap-3">

            <div className="w-9 h-9 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 font-bold">
              ✓
            </div>

            <div className="flex-1">

              <p className="font-semibold text-green-800">
                Order Successful 🎉
              </p>

              <p className="text-sm text-green-700 mt-1">
                {successMessage}
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                setSuccessMessage("")
              }
              className="text-green-700 hover:text-green-900 text-xl"
            >
              ×
            </button>

          </div>
        )}

        {}

        {orders.length === 0 ? (

          <div className="bg-white rounded-2xl shadow-sm border border-[#E7DED5] p-10 text-center">

            <div className="text-5xl mb-4">
              🛍️
            </div>

            <h2 className="text-xl font-semibold mb-2">
              No Orders Yet
            </h2>

            <p className="text-[#7A6A5D] mb-6">
              You haven't placed any orders yet.
            </p>

            <button
              onClick={() =>
                navigate("/")
              }
              className="bg-[#5A4030] text-white px-6 py-3 rounded-xl hover:bg-[#4A3326]"
            >
              Start Shopping
            </button>

          </div>

        ) : (

          <div className="space-y-5">

            {orders.map((order) => {

              const totalAmount =
                order.totalAmount ??
                order.totalPrice ??
                order.total ??
                0;

              const status =
                order.status ||
                "Order Placed";

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl shadow-sm border border-[#E7DED5] overflow-hidden"
                >

                  {}

                  <div className="p-5 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                    <div>

                      <p className="text-sm text-[#7A6A5D]">
                        Order ID
                      </p>

                      <p className="font-bold">
                        #{order.id}
                      </p>

                    </div>

                    <div>

                      <p className="text-sm text-[#7A6A5D]">
                        Order Date
                      </p>

                      <p className="font-medium">
                        {order.createdAt
                          ? new Date(
                              order.createdAt
                            ).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )
                          : "Not available"}
                      </p>

                    </div>

                    <div>

                      <p className="text-sm text-[#7A6A5D]">
                        Total
                      </p>

                      <p className="font-bold">
                        ₹
                        {Number(
                          totalAmount
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </p>

                    </div>

                    {}

                    <div>

                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                          status ===
                          "Delivered"
                            ? "bg-green-100 text-green-700"
                            : status ===
                              "Cancelled"
                            ? "bg-red-100 text-red-700"
                            : status ===
                              "Shipped"
                            ? "bg-blue-100 text-blue-700"
                            : status ===
                              "Out for Delivery"
                            ? "bg-indigo-100 text-indigo-700"
                            : status ===
                              "Processing"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {status}
                      </span>

                    </div>

                  </div>

                  {}

                  <div className="p-5">

                    <div className="space-y-4">

                      {order.items?.map(
                        (
                          item,
                          index
                        ) => {

                          const quantity =
                            Number(
                              item.quantity ??
                                1
                            );

                          const price =
                            Number(
                              item.price ??
                                0
                            );

                          const itemTotal =
                            Number(
                              item.totalPrice ??
                                price *
                                  quantity
                            );

                          const imageUrl =
                            getImageUrl(
                              item.imageUrl
                            );

                          return (
                            <div
                              key={
                                item.id ||
                                `${item.productId}-${index}`
                              }
                              className="flex items-center gap-4 border-b pb-4 last:border-b-0 last:pb-0"
                            >

                              {}

                              <div className="w-20 h-20 flex-shrink-0">

                                {imageUrl ? (

                                  <img
                                    src={
                                      imageUrl
                                    }
                                    alt={
                                      item.productName ||
                                      "Product"
                                    }
                                    className="w-full h-full object-cover rounded-xl border border-[#F0E8E1]"
                                    onError={(
                                      event
                                    ) => {
                                      event.currentTarget.style.display =
                                        "none";

                                      const fallback =
                                        event.currentTarget
                                          .nextElementSibling;

                                      if (
                                        fallback
                                      ) {
                                        fallback.style.display =
                                          "flex";
                                      }
                                    }}
                                  />

                                ) : null}

                                <div
                                  className={`w-full h-full bg-[#F7F3EE] rounded-xl items-center justify-center text-[#9A8A7D] text-sm ${
                                    imageUrl
                                      ? "hidden"
                                      : "flex"
                                  }`}
                                >
                                  No Image
                                </div>

                              </div>

                              {}

                              <div className="flex-1 min-w-0">

                                <h3 className="font-semibold">
                                  {
                                    item.productName
                                  }
                                </h3>

                                {item.ageGroup && (
                                  <p className="text-sm text-[#7A6A5D] mt-1">
                                    Age:{" "}
                                    {
                                      item.ageGroup
                                    }
                                  </p>
                                )}

                                {item.size && (
                                  <p className="text-sm text-[#7A6A5D]">
                                    Size:{" "}
                                    {
                                      item.size
                                    }
                                  </p>
                                )}

                                <p className="text-sm text-[#7A6A5D]">
                                  Quantity:{" "}
                                  {
                                    quantity
                                  }
                                </p>

                              </div>

                              {}

                              <div className="text-right">

                                <p className="font-semibold">
                                  ₹
                                  {price.toLocaleString(
                                    "en-IN"
                                  )}
                                </p>

                                <p className="text-sm text-[#7A6A5D]">
                                  ×{" "}
                                  {
                                    quantity
                                  }
                                </p>

                                <p className="font-bold mt-1">
                                  ₹
                                  {itemTotal.toLocaleString(
                                    "en-IN"
                                  )}
                                </p>

                              </div>

                            </div>
                          );
                        }
                      )}

                    </div>

                    {}

                    <div className="mt-5 pt-4 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                      {}

                      <div>

                        <p className="text-sm text-[#7A6A5D]">
                          Payment
                        </p>

                        <p className="font-medium capitalize">
                          {order.paymentMethod ||
                            "Cash on Delivery"}
                        </p>

                        <p
                          className={`text-sm font-medium mt-1 ${
                            order.paymentStatus ===
                            "Paid"
                              ? "text-green-600"
                              : "text-orange-500"
                          }`}
                        >
                          {order.paymentStatus ||
                            "Pending"}
                        </p>

                      </div>

                      {}

                      <div className="flex flex-col items-start sm:items-end gap-2">

                        <div className="flex flex-col sm:flex-row gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              setSelectedOrder(
                                order
                              )
                            }
                            className="border border-[#E7DED5] px-5 py-2.5 rounded-xl hover:bg-[#5A4030] hover:text-white transition"
                          >
                            View Order
                          </button>

                          {status !==
                            "Delivered" &&
                            status !==
                              "Cancelled" && (

                              <button
                                type="button"
                                disabled={
                                  cancellingOrder
                                }
                                onClick={() =>
                                  setCancelOrderConfirmation(
                                    order
                                  )
                                }
                                className="border border-red-500 text-red-600 px-5 py-2.5 rounded-xl hover:bg-red-500 hover:text-white transition disabled:opacity-50"
                              >
                                Cancel Order
                              </button>

                            )}

                        </div>

                      </div>

                    </div>

                  </div>

                </div>
              );
            })}

          </div>

        )}

      </div>

      {}

      {cancelOrderConfirmation && (

        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">

          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">

            <div className="flex items-start gap-4">

              <div className="w-11 h-11 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xl flex-shrink-0">
                !
              </div>

              <div className="flex-1">

                <h2 className="text-xl font-bold text-[#5A4030]">
                  Confirm Cancellation
                </h2>

                <p className="text-[#7A6A5D] mt-2 leading-relaxed">
                  Are you sure you want to
                  cancel order #
                  {
                    cancelOrderConfirmation.id
                  }?
                </p>

              </div>

            </div>

            <div className="flex justify-end gap-3 mt-6">

              <button
                type="button"
                disabled={
                  cancellingOrder
                }
                onClick={() =>
                  setCancelOrderConfirmation(
                    null
                  )
                }
                className="px-5 py-2.5 rounded-xl border border-[#DCD0C5] text-[#5A4030] hover:bg-[#F7F3EE] transition disabled:opacity-50"
              >
                No, Keep Order
              </button>

              <button
                type="button"
                disabled={
                  cancellingOrder
                }
                onClick={async () => {

                  const order =
                    cancelOrderConfirmation;

                  setCancelOrderConfirmation(
                    null
                  );

                  await handleCancelOrder(
                    order
                  );

                }}
                className="px-5 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
              >
                {cancellingOrder
                  ? "Cancelling..."
                  : "Yes, Cancel Order"}
              </button>

            </div>

          </div>

        </div>

      )}

      {}

      {selectedOrder && (

        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">

          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

            {}

            <div className="flex items-center justify-between p-5 border-b">

              <div>

                <h2 className="text-xl font-bold">
                  Order #
                  {
                    selectedOrder.id
                  }
                </h2>

                <p className="text-sm text-[#7A6A5D] mt-1">
                  Order Details
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedOrder(
                    null
                  )
                }
                className="text-[#7A6A5D] hover:text-black text-2xl"
              >
                ×
              </button>

            </div>

            {}

            <div className="p-5 space-y-5">

              {}

              <div className="border rounded-xl p-4">

                <h3 className="font-bold text-lg mb-3">
                  Delivery Details
                </h3>

                <div className="space-y-2">

                  <div>
                    <p className="text-sm text-[#7A6A5D]">
                      Name
                    </p>

                    <p className="font-medium">
                      {selectedOrder.name ||
                        user.name ||
                        "Not available"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-[#7A6A5D]">
                      Phone
                    </p>

                    <p className="font-medium">
                      {selectedOrder.phone ||
                        user.phone ||
                        "Not available"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-[#7A6A5D]">
                      Address
                    </p>

                    <p className="font-medium">
                      {selectedOrder.address ||
                        "Not available"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-[#7A6A5D]">
                      Place
                    </p>

                    <p className="font-medium">
                      {selectedOrder.place ||
                        "Not available"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-[#7A6A5D]">
                      State
                    </p>

                    <p className="font-medium">
                      {selectedOrder.state ||
                        "Not available"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-[#7A6A5D]">
                      PIN Code
                    </p>

                    <p className="font-medium">
                      {selectedOrder.pincode ||
                        "Not available"}
                    </p>
                  </div>

                </div>

              </div>

              {}

              <div className="border rounded-xl p-4">

                <p className="text-sm text-[#7A6A5D]">
                  Order Status
                </p>

                <p
                  className={`font-semibold mt-1 ${
                    selectedOrder.status ===
                    "Delivered"
                      ? "text-green-600"
                      : selectedOrder.status ===
                        "Cancelled"
                      ? "text-red-600"
                      : selectedOrder.status ===
                        "Shipped"
                      ? "text-blue-600"
                      : selectedOrder.status ===
                        "Out for Delivery"
                      ? "text-indigo-600"
                      : selectedOrder.status ===
                        "Processing"
                      ? "text-yellow-600"
                      : "text-purple-600"
                  }`}
                >
                  {selectedOrder.status ||
                    "Order Placed"}
                </p>

              </div>

              {}

              <div>

                <h3 className="font-bold text-lg mb-3">
                  Products
                </h3>

                <div className="space-y-3">

                  {selectedOrder.items?.map(
                    (
                      item,
                      index
                    ) => {

                      const quantity =
                        Number(
                          item.quantity ??
                            1
                        );

                      const price =
                        Number(
                          item.price ??
                            0
                        );

                      const total =
                        Number(
                          item.totalPrice ??
                            price *
                              quantity
                        );

                      const imageUrl =
                        getImageUrl(
                          item.imageUrl
                        );

                      return (
                        <div
                          key={
                            item.id ||
                            `${item.productId}-${index}`
                          }
                          className="border rounded-xl p-4 flex gap-4"
                        >

                          {}

                          <div className="w-20 h-20 flex-shrink-0">

                            {imageUrl ? (

                              <img
                                src={
                                  imageUrl
                                }
                                alt={
                                  item.productName ||
                                  "Product"
                                }
                                className="w-full h-full object-cover rounded-xl"
                              />

                            ) : (

                              <div className="w-full h-full bg-[#F7F3EE] rounded-xl flex items-center justify-center text-[#9A8A7D] text-sm">
                                No Image
                              </div>

                            )}

                          </div>

                          {}

                          <div className="flex-1">

                            <p className="font-semibold">
                              {
                                item.productName
                              }
                            </p>

                            {item.ageGroup && (
                              <p className="text-sm text-[#7A6A5D] mt-1">
                                Age:{" "}
                                {
                                  item.ageGroup
                                }
                              </p>
                            )}

                            {item.size && (
                              <p className="text-sm text-[#7A6A5D]">
                                Size:{" "}
                                {
                                  item.size
                                }
                              </p>
                            )}

                            <p className="text-sm text-[#7A6A5D]">
                              Quantity:{" "}
                              {
                                quantity
                              }
                            </p>

                          </div>

                          {}

                          <div className="text-right">

                            <p className="font-semibold">
                              ₹
                              {price.toLocaleString(
                                "en-IN"
                              )}
                            </p>

                            <p className="text-sm text-[#7A6A5D]">
                              ×{" "}
                              {
                                quantity
                              }
                            </p>

                            <p className="font-bold">
                              ₹
                              {total.toLocaleString(
                                "en-IN"
                              )}
                            </p>

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>

              </div>

              {}

              <div className="border rounded-xl p-4">

                <h3 className="font-bold text-lg mb-3">
                  Payment Details
                </h3>

                <div className="flex justify-between">

                  <span className="text-[#7A6A5D]">
                    Method
                  </span>

                  <span className="font-semibold capitalize">
                    {selectedOrder.paymentMethod ||
                      "Cash on Delivery"}
                  </span>

                </div>

                <div className="flex justify-between mt-2">

                  <span className="text-[#7A6A5D]">
                    Status
                  </span>

                  <span
                    className={`font-semibold ${
                      selectedOrder.paymentStatus ===
                      "Paid"
                        ? "text-green-600"
                        : "text-orange-500"
                    }`}
                  >
                    {selectedOrder.paymentStatus ||
                      "Pending"}
                  </span>

                </div>

              </div>

              {}

              <div className="border rounded-xl p-4 space-y-3">

                <div className="flex justify-between">

                  <span className="text-[#7A6A5D]">
                    Subtotal
                  </span>

                  <span>
                    ₹
                    {Number(
                      selectedOrder.subtotal ??
                        0
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </span>

                </div>

                <div className="flex justify-between">

                  <span className="text-[#7A6A5D]">
                    Delivery Fee
                  </span>

                  <span>
                    ₹
                    {Number(
                      selectedOrder.deliveryFee ??
                        0
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </span>

                </div>

                <div className="border-t pt-3 flex justify-between">

                  <span className="text-lg font-semibold">
                    Total
                  </span>

                  <span className="text-2xl font-bold">
                    ₹
                    {Number(
                      selectedOrder.totalAmount ??
                        selectedOrder.totalPrice ??
                        0
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </span>

                </div>

              </div>

              {}

              <div>

                <p className="text-sm text-[#7A6A5D]">
                  Order Date
                </p>

                <p className="font-medium">
                  {selectedOrder.createdAt
                    ? new Date(
                        selectedOrder.createdAt
                      ).toLocaleString(
                        "en-IN"
                      )
                    : "Not available"}
                </p>

              </div>

              {}

              {selectedOrder.cancelledAt && (
                <div>

                  <p className="text-sm text-[#7A6A5D]">
                    Cancelled Date
                  </p>

                  <p className="font-medium text-red-600">
                    {new Date(
                      selectedOrder.cancelledAt
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </p>

                </div>
              )}

            </div>

          </div>

        </div>

      )}

      <ToastContainer
        position="bottom-center"
        autoClose={1800}
        hideProgressBar
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
          borderRadius: "12px",
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

export default Orders;
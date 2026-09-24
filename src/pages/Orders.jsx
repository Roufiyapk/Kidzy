import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import api from "../api/api";



function Orders() {
  const navigate = useNavigate();
  const location = useLocation();

  const [successMessage, setSuccessMessage] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelOrderConfirmation, setCancelOrderConfirmation] = useState(null);


  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  // FETCH ONLY LOGGED-IN USER ORDERS

  useEffect(() => {
    const loadOrders = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/orders");

        const allOrders = Array.isArray(response.data)
          ? response.data
          : [];

        const userOrders = allOrders.filter(
          (order) =>
            String(order.userId) === String(user.id)
        );

        userOrders.sort(
          (a, b) =>
            new Date(b.createdAt || 0) -
            new Date(a.createdAt || 0)
        );

        setOrders(userOrders);
      } catch (error) {
        console.error(
          "Failed to load orders:",
          error
        );

        toast.error(
          "Failed to load your orders"
        );
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [user?.id]);

  // CANCEL ORDER
  // Customer can cancel before the order is shipped.

  const getOrderStatus = (order) => {
    if (typeof order?.status === "string") {
      return order.status;
    }

    return order?.status?.status || "Order Placed";
  };

  const canCancelOrder = (order) => {
    const status = getOrderStatus(order).toLowerCase();

    return status === "order placed" || status === "processing";
  };

  const handleCancelOrder = async (order) => {
    if (!order?.id || !canCancelOrder(order)) {
      return;
    }

    try {
      const response = await api.patch(
        `/orders/${order.id}`,
        {
          status: "Cancelled",
        }
      );

      const updatedOrder = response.data;

      setOrders((currentOrders) =>
        currentOrders.map((currentOrder) =>
          String(currentOrder.id) === String(order.id)
            ? updatedOrder
            : currentOrder
        )
      );

      setSelectedOrder((current) =>
        current && String(current.id) === String(order.id)
          ? updatedOrder
          : current
      );

      toast.success("Order cancelled successfully");
    } catch (error) {
      console.error("Failed to cancel order:", error);
      toast.error("Failed to cancel order");
    }
  };

  // ORDER SUCCESS MESSAGE

  useEffect(() => {
    const message =
      location.state?.orderSuccess;

    if (message) {
      setSuccessMessage(message);

      window.history.replaceState(
        {},
        document.title
      );
    }
  }, [location.state]);

  // NOT LOGGED IN

  if (!user?.id) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">

        <div className="bg-white rounded-2xl shadow-md p-8 text-center max-w-md w-full">

          <h2 className="text-2xl font-bold mb-3">
            Please Login
          </h2>

          <p className="text-gray-500 mb-6">
            Login to view your orders.
          </p>

          <button
            onClick={() =>
              navigate("/login")
            }
            className="bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800"
          >
            Login
          </button>

        </div>
      </div>
    );
  }

  // LOADING

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">

        <p className="text-lg text-gray-600">
          Loading your orders...
        </p>

      </div>
    );
  }

  // ORDERS PAGE

  return (
    <div className="min-h-screen bg-white px-4 md:px-10 py-10">

      <div className="max-w-5xl mx-auto">

        {/* TITLE */}

        <div className="flex items-center justify-between mb-8">

          <div>

            <h1 className="text-3xl font-bold">
              My Orders
            </h1>

            <p className="text-gray-500 mt-1">
              View your order history
            </p>

          </div>

          {/* CONTINUE SHOPPING */}

          <button
            onClick={() =>
              navigate("/")
            }
            className="hidden sm:block border border-black px-5 py-2.5 rounded-xl hover:bg-black hover:text-white transition"
          >
            Continue Shopping
          </button>

        </div>

        {/* ORDER SUCCESS MESSAGE */}

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
              className="text-green-700 hover:text-green-900 text-xl leading-none"
              aria-label="Close success message"
            >
              ×
            </button>

          </div>
        )}

        {/* NO ORDERS */}

        {orders.length === 0 ? (

          <div className="bg-white rounded-2xl shadow-md p-10 text-center">

            <div className="text-5xl mb-4">
              🛍️
            </div>

            <h2 className="text-xl font-semibold mb-2">
              No Orders Yet
            </h2>

            <p className="text-gray-500 mb-6">
              You haven't placed any orders yet.
            </p>

            <button
              onClick={() =>
                navigate("/")
              }
              className="bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800"
            >
              Start Shopping
            </button>

          </div>

        ) : (

          <div className="space-y-5">

            {orders.map((order) => {

              const totalAmount =
                order.totalPrice ??
                order.total ??
                order.totalAmount ??
                0;

              const status =
                typeof order.status ===
                "string"
                  ? order.status
                  : order.status?.status ||
                    "Order Placed";

              return (

                <div
                  key={order.id}
                  className="bg-white rounded-2xl shadow-md overflow-hidden"
                >

                  {/* ORDER HEADER */}

                  <div className="p-5 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                    <div>

                      <p className="text-sm text-gray-500">
                        Order ID
                      </p>

                      <p className="font-bold">
                        #{order.id}
                      </p>

                    </div>

                    <div>

                      <p className="text-sm text-gray-500">
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

                      <p className="text-sm text-gray-500">
                        Total
                      </p>

                      <p className="font-bold">
                        ₹{totalAmount}
                      </p>

                    </div>

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

                  {/* ORDER ITEMS */}

                  <div className="p-5">

                    <div className="space-y-4">

                      {order.items?.map(
                        (item, index) => {

                          const quantity =
                            Number(
                              item.qty ??
                                item.quantity ??
                                1
                            );

                          const price =
                            Number(
                              item.price ?? 0
                            );

                          return (

                            <div
                              key={
                                item.id ||
                                item.productId ||
                                index
                              }
                              className="flex items-center gap-4 border-b pb-4 last:border-b-0 last:pb-0"
                            >

                              {/* IMAGE */}

                              <div className="w-20 h-20 flex-shrink-0">

                                {item.image ? (

                                  <img
                                    src={
                                      item.image
                                    }
                                    alt={
                                      item.name ||
                                      "Product"
                                    }
                                    className="w-full h-full object-cover rounded-xl"
                                  />

                                ) : (

                                  <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                                    No Image
                                  </div>

                                )}

                              </div>

                              {/* PRODUCT DETAILS */}

                              <div className="flex-1">

                                <h3 className="font-semibold">
                                  {item.name ||
                                    item.productName ||
                                    "Product"}
                                </h3>

                                {/* SIZE */}

                                {(item.selectedSize ||
                                  item.size) && (
                                  <p className="text-sm text-gray-500 mt-1">
                                    Size:{" "}
                                    {item.selectedSize ||
                                      item.size}
                                  </p>
                                )}

                                <p className="text-sm text-gray-500">
                                  Quantity:{" "}
                                  {quantity}
                                </p>


                              </div>

                              {/* PRICE */}

                              <div className="text-right">

                                <p className="font-semibold">
                                  ₹{price}
                                </p>

                                <p className="text-sm text-gray-500">
                                  ×{" "}
                                  {quantity}
                                </p>

                                <p className="font-bold mt-1">
                                  ₹
                                  {price *
                                    quantity}
                                </p>

                              </div>

                            </div>

                          );
                        }
                      )}

                    </div>

                    {/* BOTTOM */}

                    <div className="mt-5 pt-4 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                      <div>

                        <p className="text-sm text-gray-500">
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

                      <div className="flex flex-col items-start sm:items-end gap-2">

                        {order.deliveredAt && (
                          <p className="text-xs text-gray-500">
                            Delivered:{" "}
                            {new Date(
                              order.deliveredAt
                            ).toLocaleDateString(
                              "en-IN"
                            )}
                          </p>
                        )}

                        <div className="flex flex-col sm:flex-row gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              setSelectedOrder(
                                order
                              )
                            }
                            className="border border-black px-5 py-2.5 rounded-xl hover:bg-black hover:text-white transition"
                          >
                            View Order
                          </button>

                          {canCancelOrder(order) && (
                            <button
                              type="button"
                              onClick={() =>
                                setCancelOrderConfirmation(order)
                              }
                              className="border border-red-500 text-red-600 px-5 py-2.5 rounded-xl hover:bg-red-500 hover:text-white transition"
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

      {/* CANCEL CONFIRMATION MODAL */}

      {cancelOrderConfirmation && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">

            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xl flex-shrink-0">
                !
              </div>

              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-800">
                  Confirm Cancellation
                </h2>

                <p className="text-gray-500 mt-2 leading-relaxed">
                  Are you sure you want to cancel order #{cancelOrderConfirmation.id}?
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() =>
                  setCancelOrderConfirmation(null)
                }
                className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
              >
                No, Keep Order
              </button>

              <button
                type="button"
                onClick={async () => {
                  const order = cancelOrderConfirmation;
                  setCancelOrderConfirmation(null);
                  await handleCancelOrder(order);
                }}
                className="px-5 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 transition"
              >
                Yes, Cancel Order
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ORDER DETAILS MODAL */}

      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">

          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between p-5 border-b">

              <div>

                <h2 className="text-xl font-bold">
                  Order #{selectedOrder.id}
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Order Details
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedOrder(null)
                }
                className="text-gray-500 hover:text-black text-2xl"
              >
                ×
              </button>

            </div>

            {/* MODAL BODY */}

            <div className="p-5 space-y-5">

              {/* CUSTOMER DETAILS */}

              <div className="border rounded-xl p-4">

                <h3 className="font-bold text-lg mb-3">
                  Delivery Details
                </h3>

                <div className="space-y-2">

                  <div>

                    <p className="text-sm text-gray-500">
                      Name
                    </p>

                    <p className="font-medium">
                      {selectedOrder
                        .customer?.name ||
                        user.name ||
                        "Not available"}
                    </p>

                  </div>

                  <div>

                    <p className="text-sm text-gray-500">
                      Phone
                    </p>

                    <p className="font-medium">
                      {selectedOrder
                        .customer?.phone ||
                        user.phone ||
                        "Not available"}
                    </p>

                  </div>

                  <div>

                    <p className="text-sm text-gray-500">
                      Address
                    </p>

                    <p className="font-medium">
                      {selectedOrder
                        .customer?.address ||
                        user.address ||
                        "Not available"}
                    </p>

                  </div>

                  <div>

                    <p className="text-sm text-gray-500">
                      PIN Code
                    </p>

                    <p className="font-medium">
                      {selectedOrder
                        .customer?.pincode ||
                        user.pincode ||
                        "Not available"}
                    </p>

                  </div>

                </div>

              </div>

              {/* ORDER STATUS */}

              <div className="border rounded-xl p-4">

                <p className="text-sm text-gray-500">
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
                      : "text-purple-600"
                  }`}
                >
                  {typeof selectedOrder.status ===
                  "string"
                    ? selectedOrder.status
                    : selectedOrder.status
                        ?.status ||
                      "Order Placed"}
                </p>

              </div>

              {/* PRODUCTS */}

              <div>

                <h3 className="font-bold text-lg mb-3">
                  Products
                </h3>

                <div className="space-y-3">

                  {selectedOrder.items?.map(
                    (item, index) => {

                      const quantity =
                        Number(
                          item.qty ??
                            item.quantity ??
                            1
                        );

                      const price =
                        Number(
                          item.price ?? 0
                        );

                      return (

                        <div
                          key={
                            item.id ||
                            item.productId ||
                            index
                          }
                          className="border rounded-xl p-4 flex justify-between gap-4"
                        >

                          <div>

                            <p className="font-semibold">
                              {item.name ||
                                item.productName ||
                                "Product"}
                            </p>

                            {(item.selectedSize ||
                              item.size) && (
                              <p className="text-sm text-gray-500">
                                Size:{" "}
                                {item.selectedSize ||
                                  item.size}
                              </p>
                            )}

                            <p className="text-sm text-gray-500">
                              Quantity:{" "}
                              {quantity}
                            </p>

                          </div>

                          <div className="text-right">

                            <p className="font-semibold">
                              ₹{price}
                            </p>

                            <p className="text-sm text-gray-500">
                              ×{" "}
                              {quantity}
                            </p>

                            <p className="font-bold">
                              ₹
                              {price *
                                quantity}
                            </p>

                          </div>

                        </div>

                      );
                    }
                  )}

                </div>

              </div>

              {/* PAYMENT */}

              <div className="border rounded-xl p-4">

                <h3 className="font-bold text-lg mb-3">
                  Payment Details
                </h3>

                <div className="flex justify-between">

                  <span className="text-gray-500">
                    Method
                  </span>

                  <span className="font-semibold capitalize">
                    {selectedOrder.paymentMethod ||
                      "Cash on Delivery"}
                  </span>

                </div>

                <div className="flex justify-between mt-2">

                  <span className="text-gray-500">
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

              {/* TOTAL */}

              <div className="bg-white rounded-xl p-4 border">

                <div className="flex justify-between items-center">

                  <span className="text-lg font-semibold">
                    Total
                  </span>

                  <span className="text-2xl font-bold">
                    ₹
                    {selectedOrder.totalPrice ??
                      selectedOrder.total ??
                      selectedOrder.totalAmount ??
                      0}
                  </span>

                </div>

              </div>

              {/* ORDER DATE */}

              <div>

                <p className="text-sm text-gray-500">
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

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default Orders;
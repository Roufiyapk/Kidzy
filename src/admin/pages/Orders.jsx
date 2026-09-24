import { useEffect, useMemo, useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "react-toastify";
import api from "../../api/api";

const STATUS_OPTIONS = [
  "Order Placed",
  "Processing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

const getStatusText = (status) => {
  if (typeof status === "string" && status.trim()) {
    return status;
  }

  if (status && typeof status === "object") {
    return status.status || "Order Placed";
  }

  return "Order Placed";
};

const getStatusColor = (status) => {
  const value = getStatusText(status).toLowerCase();

  switch (value) {
    case "order placed":
      return "text-purple-600";
    case "processing":
      return "text-yellow-600";
    case "shipped":
      return "text-blue-600";
    case "out for delivery":
      return "text-indigo-600";
    case "delivered":
      return "text-green-600";
    case "cancelled":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
};

const getStatusBadge = (status) => {
  const value = getStatusText(status).toLowerCase();

  switch (value) {
    case "order placed":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "processing":
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    case "shipped":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "out for delivery":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    case "delivered":
      return "bg-green-50 text-green-700 border-green-200";
    case "cancelled":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
};


const canCancelOrder = (status) => {
  const value = getStatusText(status).toLowerCase();

  return value === "order placed" || value === "processing";
};


const getCustomerName = (order) =>
  order?.customer?.name ||
  order?.user?.name ||
  "Unknown";

const getCustomerPhone = (order) =>
  order?.customer?.phone ||
  order?.user?.phone ||
  "";

const formatPhone = (phone) => {
  const value = String(phone || "").trim();

  if (!value) {
    return "N/A";
  }

  if (value.startsWith("+91")) {
    return value;
  }

  return `+91 ${value}`;
};

const formatCurrency = (value) => {
  const number = Number(value || 0);

  return `₹${number.toLocaleString("en-IN")}`;
};

const formatDate = (value) => {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function Orders() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [page, setPage] = useState(1);

  const ordersPerPage = 5;

  // FETCH ALL ORDERS
  const {
    data: orders = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const response = await api.get("/orders");

      return Array.isArray(response.data)
        ? response.data
        : [];
    },
  });

  // UPDATE ORDER STATUS
  const updateMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const response = await api.patch(`/orders/${id}`, {
        status,
        deliveredAt:
          status === "Delivered"
            ? new Date().toISOString()
            : null,
      });

      return response.data;
    },

    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({
        queryKey: ["admin-orders"],
      });

      setSelectedOrder((current) =>
        current && String(current.id) === String(updatedOrder.id)
          ? updatedOrder
          : current
      );

      toast.success("Order status updated");
    },

    onError: (updateError) => {
      console.error("Update order error:", updateError);
      toast.error("Failed to update order status");
    },
  });

  // CANCEL ORDER BEFORE SHIPPING
  const cancelMutation = useMutation({
    mutationFn: async (id) => {
      const response = await api.patch(`/orders/${id}`, {
        status: "Cancelled",
        deliveredAt: null,
      });

      return response.data;
    },

    onSuccess: (cancelledOrder) => {
      queryClient.setQueryData(
        ["admin-orders"],
        (currentOrders = []) =>
          currentOrders.map((order) =>
            String(order.id) === String(cancelledOrder.id)
              ? cancelledOrder
              : order
          )
      );

      queryClient.invalidateQueries({
        queryKey: ["admin-orders"],
      });

      setSelectedOrder((current) =>
        current &&
        String(current.id) === String(cancelledOrder.id)
          ? cancelledOrder
          : current
      );

      toast.success("Order cancelled");
    },

    onError: (cancelError) => {
      console.error("Cancel order error:", cancelError);
      toast.error("Failed to cancel order");
    },
  });

  // DELETE ORDER
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/orders/${id}`);
      return id;
    },

    onSuccess: (deletedId) => {
      queryClient.setQueryData(["admin-orders"], (currentOrders = []) =>
        currentOrders.filter(
          (order) => String(order.id) !== String(deletedId)
        )
      );

      queryClient.invalidateQueries({
        queryKey: ["admin-orders"],
      });

      setSelectedOrder(null);
      toast.success("Order deleted");
    },

    onError: (deleteError) => {
      console.error("Delete order error:", deleteError);
      toast.error("Failed to delete order");
    },
  });

  // FILTER + SORT ORDERS
  const filteredOrders = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return [...orders]
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0) -
          new Date(a.createdAt || 0)
      )
      .filter((order) => {
        const customerName = getCustomerName(order);
        const orderId = String(order.id ?? "");

        const matchesSearch =
          !searchValue ||
          orderId.toLowerCase().includes(searchValue) ||
          customerName.toLowerCase().includes(searchValue);

        const currentStatus = getStatusText(
          order.status
        ).toLowerCase();

        const matchesStatus =
          statusFilter === "all" ||
          currentStatus === statusFilter.toLowerCase();

        return matchesSearch && matchesStatus;
      });
  }, [orders, search, statusFilter]);

  // KEEP PAGE VALID AFTER FILTERING / DELETING
  useEffect(() => {
    const totalPages = Math.max(
      1,
      Math.ceil(filteredOrders.length / ordersPerPage)
    );

    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [filteredOrders.length, page]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow px-6 py-5 text-gray-600">
          Loading orders...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow px-6 py-5">
          <p className="text-red-500 font-semibold">
            Failed to load orders
          </p>

          {error?.message && (
            <p className="text-sm text-gray-500 mt-1">
              {error.message}
            </p>
          )}
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(
    filteredOrders.length / ordersPerPage
  );

  const currentOrders = filteredOrders.slice(
    (page - 1) * ordersPerPage,
    page * ordersPerPage
  );

  return (
    <div className="min-h-screen bg-gray-100 p-3 sm:p-6">

      {/* TITLE */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Admin Orders
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Manage customer orders and update order status.
        </p>
      </div>

      {/* SEARCH + FILTER */}
      <div className="flex flex-col md:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">

        <input
          type="text"
          placeholder="Search by order ID or customer name"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          className="border border-gray-300 rounded-xl px-3 sm:px-4 py-2.5 bg-white w-full md:w-96 outline-none focus:border-gray-500"
        />

        <select
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value);
            setPage(1);
          }}
          className="border border-gray-300 rounded-xl px-3 sm:px-4 py-2.5 bg-white w-full md:w-64 outline-none focus:border-gray-500"
        >
          <option value="all">
            All Status
          </option>

          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow overflow-x-auto">

        {/* HEADER */}
        <div className="min-w-[760px] grid grid-cols-5 bg-gray-200 px-4 sm:px-6 py-3 font-semibold text-sm sm:text-base">
          <div>ID</div>
          <div>Customer</div>
          <div>Items</div>
          <div>Status</div>
          <div>Details</div>
        </div>

        {/* ROWS */}
        {currentOrders.length === 0 ? (
          <div className="min-w-[760px] text-center py-12 text-gray-500">
            No orders found
          </div>
        ) : (
          currentOrders.map((order) => {
            const customerName = getCustomerName(order);
            const status = getStatusText(order.status);

            return (
              <div
                key={order.id}
                className="min-w-[760px] grid grid-cols-5 px-4 sm:px-6 py-3 sm:py-4 border-b items-center text-sm sm:text-base"
              >
                {/* ID */}
                <div className="font-medium">
                  #{order.id}
                </div>

                {/* CUSTOMER */}
                <div className="truncate pr-2">
                  <p className="font-medium">
                    {customerName}
                  </p>

                  <p className="text-xs text-gray-400 mt-1">
                    {formatDate(order.createdAt)}
                  </p>

                </div>

                {/* ITEMS */}
                <div>
                  <p>
                    {order.items?.length || 0}{" "}
                    {order.items?.length === 1
                      ? "item"
                      : "items"}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    {formatCurrency(order.totalPrice)}
                  </p>
                </div>

                {/* STATUS */}
                <div>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full border text-xs sm:text-sm font-semibold ${getStatusBadge(
                      status
                    )}`}
                  >
                    {status}
                  </span>
                </div>

                {/* ACTIONS */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(order)}
                    className="text-blue-600 hover:underline text-left"
                  >
                    Inspect
                  </button>

                  {canCancelOrder(status) && (
                    <button
                      type="button"
                      disabled={cancelMutation.isPending}
                      onClick={() => {
                        const confirmed = window.confirm(
                          `Cancel order #${order.id}?`
                        );

                        if (confirmed) {
                          cancelMutation.mutate(order.id);
                        }
                      }}
                      className="text-orange-600 hover:underline text-left disabled:opacity-50"
                    >
                      {cancelMutation.isPending
                        ? "Cancelling..."
                        : "Cancel"}
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={deleteMutation.isPending}
                    onClick={() => {
                      const confirmed = window.confirm(
                        `Delete order #${order.id}?`
                      );

                      if (confirmed) {
                        deleteMutation.mutate(order.id);
                      }
                    }}
                    className="text-red-600 hover:underline text-left disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* PAGINATION */}
      {totalPages > 0 && (
        <div className="flex justify-center items-center mt-6 gap-2 flex-wrap">

          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((current) => current - 1)}
            className="border bg-white px-3 py-1.5 rounded-lg disabled:opacity-50"
          >
            Prev
          </button>

          {Array.from(
            { length: totalPages },
            (_, index) => {
              const pageNumber = index + 1;

              return (
                <button
                  type="button"
                  key={pageNumber}
                  onClick={() => setPage(pageNumber)}
                  className={`px-3 py-1.5 border rounded-lg ${
                    page === pageNumber
                      ? "bg-black text-white"
                      : "bg-white"
                  }`}
                >
                  {pageNumber}
                </button>
              );
            }
          )}

          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => setPage((current) => current + 1)}
            className="border bg-white px-3 py-1.5 rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">

          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">

            {/* MODAL HEADER */}
            <div className="flex justify-between items-start mb-5">

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                  Order #{selectedOrder.id}
                </h2>

                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  {formatDate(selectedOrder.createdAt)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="text-xl px-2 text-gray-500 hover:text-gray-800"
                aria-label="Close order details"
              >
                ✕
              </button>
            </div>

            {/* CUSTOMER INFORMATION */}
            <div className="border rounded-xl p-4 mb-4">
              <h3 className="font-bold text-gray-800 mb-3">
                Customer Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">

                <p>
                  <b>Name:</b>{" "}
                  {getCustomerName(selectedOrder)}
                </p>

                <p>
                  <b>Phone:</b>{" "}
                  {formatPhone(
                    getCustomerPhone(selectedOrder)
                  )}
                </p>

                <p className="sm:col-span-2">
                  <b>Address:</b>{" "}
                  {selectedOrder.customer?.address ||
                    selectedOrder.user?.address ||
                    "N/A"}
                </p>

                <p>
                  <b>PIN:</b>{" "}
                  {selectedOrder.customer?.pincode ||
                    selectedOrder.user?.pincode ||
                    "N/A"}
                </p>

              </div>
            </div>

            {/* ORDER INFORMATION */}
            <div className="border rounded-xl p-4 mb-4">
              <h3 className="font-bold text-gray-800 mb-3">
                Order Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">

                <p>
                  <b>Total:</b>{" "}
                  {formatCurrency(selectedOrder.totalPrice)}
                </p>

                <p>
                  <b>Payment Method:</b>{" "}
                  {selectedOrder.paymentMethod || "N/A"}
                </p>

                <p>
                  <b>Payment Status:</b>{" "}
                  {selectedOrder.paymentStatus || "N/A"}
                </p>

                <p>
                  <b>Items:</b>{" "}
                  {selectedOrder.items?.length || 0}
                </p>

              </div>

              {/* STATUS */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-start sm:items-center mt-4">

                <b>Status:</b>

                <select
                  value={getStatusText(selectedOrder.status)}
                  disabled={updateMutation.isPending}
                  onChange={(event) => {
                    const newStatus = event.target.value;

                    updateMutation.mutate({
                      id: selectedOrder.id,
                      status: newStatus,
                    });

                    setSelectedOrder((current) => ({
                      ...current,
                      status: newStatus,
                    }));
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {status}
                    </option>
                  ))}
                </select>

              </div>
            </div>

            {/* ORDER ITEMS */}
            <div>
              <h3 className="font-bold text-gray-800 mb-3">
                Order Items
              </h3>

              <div className="space-y-4">

                {selectedOrder.items?.length > 0 ? (
                  selectedOrder.items.map(
                    (item, index) => (
                      <div
                        key={`${item.productId ?? item.id ?? "item"}-${item.selectedSize ?? "no-size"}-${index}`}
                        className="border rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:gap-4"
                      >
                        <img
                          src={
                            item.image ||
                            "https://via.placeholder.com/100"
                          }
                          alt={item.name || "Product"}
                          className="w-full sm:w-28 h-40 sm:h-28 object-cover rounded-xl bg-gray-100"
                        />

                        <div className="flex-1">

                          <h4 className="font-bold text-gray-800">
                            {item.name || "Product"}
                          </h4>

                          <p className="text-sm text-gray-600 mt-1">
                            Qty: {Number(item.qty || 0)}
                          </p>

                          {item.selectedSize && (
                            <p className="text-sm text-gray-600 mt-1">
                              Size: {item.selectedSize}
                            </p>
                          )}

                          <p className="text-sm text-gray-600 mt-1">
                            Unit Price:{" "}
                            {formatCurrency(item.price)}
                          </p>

                          <p className="font-bold mt-2 text-gray-800">
                            Item Total:{" "}
                            {formatCurrency(
                              Number(item.price || 0) *
                                Number(item.qty || 0)
                            )}
                          </p>

                        </div>
                      </div>
                    )
                  )
                ) : (
                  <p className="text-gray-500">
                    No items found.
                  </p>
                )}

              </div>
            </div>

            {/* CLOSE */}
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 rounded-xl bg-black text-white hover:bg-gray-800"
              >
                Close
              </button>
            </div>

          </div>



        </div>
      )}

    </div>
  );
}

export default Orders;

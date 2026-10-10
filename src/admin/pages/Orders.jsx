import { useEffect, useMemo, useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "react-toastify";
import api from "../../api/api";

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
      return "text-[#5A4030]";
    case "processing":
      return "text-[#80652E]";
    case "shipped":
      return "text-[#5A4030]";
    case "out for delivery":
      return "text-[#62577E]";
    case "delivered":
      return "text-[#426B42]";
    case "cancelled":
      return "text-[#A13F39]";
    default:
      return "text-[#6B5847]";
  }
};

const getStatusBadge = (status) => {
  const value = getStatusText(status).toLowerCase();

  switch (value) {
    case "order placed":
      return "bg-[#F3EDE6] text-[#5A4030] border-[#E7DDD2]";
    case "processing":
      return "bg-[#F8F0D9] text-[#80652E] border-[#E9DDBA]";
    case "shipped":
      return "bg-[#EAF0F4] text-[#466477] border-[#D7E2E8]";
    case "out for delivery":
      return "bg-[#EFEDF6] text-[#62577E] border-[#DED9ED]";
    case "delivered":
      return "bg-[#EAF3E9] text-[#426B42] border-[#D3E5D0]";
    case "cancelled":
      return "bg-[#FBEDEC] text-[#A13F39] border-[#F0D1CE]";
    default:
      return "bg-[#FAF7F2] text-[#5A4030] border-[#E7DDD2]";
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
const unwrapApiResponse = (response) => {
  let payload = response?.data ?? response;
  for (let i = 0; i < 3; i++) {
    if (!payload || typeof payload !== "object") break;

    if (
      Object.prototype.hasOwnProperty.call(payload, "data") &&
      payload.data !== null
    ) {
      payload = payload.data;
      continue;
    }

    if (
      Object.prototype.hasOwnProperty.call(payload, "Data") &&
      payload.Data !== null
    ) {
      payload = payload.Data;
      continue;
    }

    break;
  }

  return payload;
};

const getField = (object, camelName, pascalName) =>
  object?.[camelName] ?? object?.[pascalName];

const normalizeAdminOrder = (rawOrder) => {
  if (!rawOrder || typeof rawOrder !== "object") return null;

  const rawItems =
    getField(rawOrder, "items", "Items") || [];

  const items = (Array.isArray(rawItems) ? rawItems : []).map((item) => ({
    ...item,
    id: getField(item, "id", "Id"),
    productId: getField(item, "productId", "ProductId"),
    productVariantId: getField(item, "productVariantId", "ProductVariantId"),
    name:
      getField(item, "productName", "ProductName") ||
      getField(item, "name", "Name") ||
      "Product",
    image:
      getField(item, "imageUrl", "ImageUrl") ||
      getField(item, "image", "Image") ||
      "",
    qty: Number(
      getField(item, "quantity", "Quantity") ??
      getField(item, "qty", "Qty") ??
      0
    ),
    selectedSize:
      getField(item, "size", "Size") ||
      getField(item, "ageGroup", "AgeGroup") ||
      "",
    price: Number(getField(item, "price", "Price") || 0),
    totalPrice: Number(
      getField(item, "totalPrice", "TotalPrice") || 0
    ),
  }));

  const id = getField(rawOrder, "id", "Id");

  return {
    ...rawOrder,
    id,
    userId: getField(rawOrder, "userId", "UserId"),
    paymentId: getField(rawOrder, "paymentId", "PaymentId"),
    userName:
      getField(rawOrder, "userName", "UserName") ||
      getField(rawOrder, "name", "Name") ||
      "Unknown",
    userEmail: getField(rawOrder, "userEmail", "UserEmail") || "",
    customer: {
      name:
        getField(rawOrder, "name", "Name") ||
        getField(rawOrder, "userName", "UserName") ||
        "Unknown",
      phone: getField(rawOrder, "phone", "Phone") || "",
      address: getField(rawOrder, "address", "Address") || "",
      pincode: getField(rawOrder, "pincode", "Pincode") || "",
    },
    name: getField(rawOrder, "name", "Name") || "",
    phone: getField(rawOrder, "phone", "Phone") || "",
    address: getField(rawOrder, "address", "Address") || "",
    place: getField(rawOrder, "place", "Place") || "",
    state: getField(rawOrder, "state", "State") || "",
    pincode: getField(rawOrder, "pincode", "Pincode") || "",
    subtotal: Number(getField(rawOrder, "subtotal", "Subtotal") || 0),
    deliveryFee: Number(getField(rawOrder, "deliveryFee", "DeliveryFee") || 0),
    totalPrice: Number(
      getField(rawOrder, "totalAmount", "TotalAmount") ??
      getField(rawOrder, "totalPrice", "TotalPrice") ??
      0
    ),
    totalAmount: Number(
      getField(rawOrder, "totalAmount", "TotalAmount") ??
      getField(rawOrder, "totalPrice", "TotalPrice") ??
      0
    ),
    paymentMethod: getField(rawOrder, "paymentMethod", "PaymentMethod") || "",
    paymentStatus: getField(rawOrder, "paymentStatus", "PaymentStatus") || "",
    status: getField(rawOrder, "status", "Status") || "Order Placed",
    createdAt: getField(rawOrder, "createdAt", "CreatedAt"),
    cancelledAt: getField(rawOrder, "cancelledAt", "CancelledAt"),
    items,
  };
};

const normalizeOrderList = (response) => {
  const payload = unwrapApiResponse(response);
  if (Array.isArray(payload)) {
    return payload.map(normalizeAdminOrder).filter(Boolean);
  }

  const possibleLists = [
    payload?.items,
    payload?.Items,
    payload?.orders,
    payload?.Orders,
  ];

  const list = possibleLists.find(Array.isArray) || [];
  return list.map(normalizeAdminOrder).filter(Boolean);
};

function Orders() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [page, setPage] = useState(1);

  const ordersPerPage = 5;
  const {
    data: orders = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const response = await api.get("/orders/admin");
      return normalizeOrderList(response.data);
    },
  });
  const updateMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const response = await api.put(`/orders/admin/${id}/status`, {
        status,
      });

      const payload = unwrapApiResponse(response.data);
      return normalizeAdminOrder(payload);
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

      notify("success", "Order status updated");
    },

    onError: (updateError) => {
      console.error("Update order error:", updateError);
      notify("error", "Failed to update order status");
    },
  });
  const cancelMutation = useMutation({
    mutationFn: async (id) => {
      const response = await api.put(`/orders/admin/${id}/cancel`);
      const payload = unwrapApiResponse(response.data);
      return normalizeAdminOrder(payload);
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

      notify("success", "Order cancelled");
    },

    onError: (cancelError) => {
      console.error("Cancel order error:", cancelError);
      notify("error", "Failed to cancel order");
    },
  });
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/orders/admin/${id}`);
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
      notify("success", "Order deleted");
    },

    onError: (deleteError) => {
      console.error("Delete order error:", deleteError);
      notify("error", "Failed to delete order");
    },
  });
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
      <div className="min-h-screen bg-[#F1EAE1] p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow px-6 py-5 text-[#6B5847]">
          Loading orders...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-[#F1EAE1] p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow px-6 py-5">
          <p className="text-[#A13F39] font-semibold">
            Failed to load orders
          </p>

          {error?.message && (
            <p className="text-sm text-[#817467] mt-1">
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
    <div className="min-h-screen bg-[#F1EAE1] p-3 sm:p-6">

      {}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#3F3026]">
          Admin Orders
        </h1>

        <p className="text-sm text-[#817467] mt-1">
          Manage customer orders and update order status.
        </p>
      </div>

      {}
      <div className="flex flex-col md:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">

        <input
          type="text"
          placeholder="Search by order ID or customer name"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          className="border border-[#E0D5CA] rounded-xl px-3 sm:px-4 py-2.5 bg-white w-full md:w-96 outline-none focus:border-gray-500"
        />

        <select
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value);
            setPage(1);
          }}
          className="border border-[#E0D5CA] rounded-xl px-3 sm:px-4 py-2.5 bg-white w-full md:w-64 outline-none focus:border-gray-500"
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

      {}
      <div className="bg-white rounded-2xl border border-[#E7DDD2] shadow-sm overflow-x-auto">

        {}
        <div className="min-w-[760px] grid grid-cols-5 bg-[#E9DED2] px-4 sm:px-6 py-3 font-semibold text-sm sm:text-base">
          <div>ID</div>
          <div>Customer</div>
          <div>Items</div>
          <div>Status</div>
          <div>Details</div>
        </div>

        {}
        {currentOrders.length === 0 ? (
          <div className="min-w-[760px] text-center py-12 text-[#817467]">
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
                {}
                <div className="font-medium">
                  #{order.id}
                </div>

                {}
                <div className="truncate pr-2">
                  <p className="font-medium">
                    {customerName}
                  </p>

                  <p className="text-xs text-[#A99A8B] mt-1">
                    {formatDate(order.createdAt)}
                  </p>

                </div>

                {}
                <div>
                  <p>
                    {order.items?.length || 0}{" "}
                    {order.items?.length === 1
                      ? "item"
                      : "items"}
                  </p>

                  <p className="text-xs text-[#817467] mt-1">
                    {formatCurrency(order.totalAmount ?? order.totalPrice)}
                  </p>
                </div>

                {}
                <div>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full border text-xs sm:text-sm font-semibold ${getStatusBadge(
                      status
                    )}`}
                  >
                    {status}
                  </span>
                </div>

                {}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(order)}
                    className="text-[#5A4030] hover:underline text-left"
                  >
                    Inspect
                  </button>

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
                    className="text-[#A13F39] hover:underline text-left disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {}
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
                      ? "bg-[#30251F] text-white"
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

      {}
      {selectedOrder && (
        <div className="fixed inset-0 bg-[#30251F]/50 flex items-center justify-center z-50 p-3 sm:p-4">

          <div className="bg-white w-full max-w-3xl rounded-2xl border border-[#E7DDD2] shadow-xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">

            {}
            <div className="flex justify-between items-start mb-5">

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#3F3026]">
                  Order #{selectedOrder.id}
                </h2>

                <p className="text-xs sm:text-sm text-[#817467] mt-1">
                  {formatDate(selectedOrder.createdAt)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="text-xl px-2 text-[#817467] hover:text-[#3F3026]"
                aria-label="Close order details"
              >
                ✕
              </button>
            </div>

            {}
            <div className="border border-[#E7DDD2] rounded-xl p-4 mb-4">
              <h3 className="font-bold text-[#3F3026] mb-3">
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
                    selectedOrder.address ||
                    "N/A"}
                </p>

                <p>
                  <b>Place:</b>{" "}
                  {selectedOrder.place || "N/A"}
                </p>

                <p>
                  <b>State:</b>{" "}
                  {selectedOrder.state || "N/A"}
                </p>

                <p>
                  <b>PIN:</b>{" "}
                  {selectedOrder.customer?.pincode ||
                    selectedOrder.pincode ||
                    "N/A"}
                </p>

              </div>
            </div>

            {}
            <div className="border border-[#E7DDD2] rounded-xl p-4 mb-4">
              <h3 className="font-bold text-[#3F3026] mb-3">
                Order Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">

                <p>
                  <b>Total:</b>{" "}
                  {formatCurrency(selectedOrder.totalAmount ?? selectedOrder.totalPrice)}
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

              {}
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
                  className="border border-[#E0D5CA] rounded-lg px-3 py-2 bg-white outline-none"
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

            {}
            <div>
              <h3 className="font-bold text-[#3F3026] mb-3">
                Order Items
              </h3>

              <div className="space-y-4">

                {selectedOrder.items?.length > 0 ? (
                  selectedOrder.items.map(
                    (item, index) => (
                      <div
                        key={`${item.productId ?? item.id ?? "item"}-${item.selectedSize ?? "no-size"}-${index}`}
                        className="border border-[#E7DDD2] rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:gap-4"
                      >
                        <img
                          src={
                            item.image ||
                            "https://via.placeholder.com/100"
                          }
                          alt={item.name || "Product"}
                          className="w-full sm:w-28 h-40 sm:h-28 object-cover rounded-xl bg-[#F1EAE1]"
                        />

                        <div className="flex-1">

                          <h4 className="font-bold text-[#3F3026]">
                            {item.name || "Product"}
                          </h4>

                          <p className="text-sm text-[#6B5847] mt-1">
                            Qty: {Number(item.qty || 0)}
                          </p>

                          {item.selectedSize && (
                            <p className="text-sm text-[#6B5847] mt-1">
                              Size: {item.selectedSize}
                            </p>
                          )}

                          <p className="text-sm text-[#6B5847] mt-1">
                            Unit Price:{" "}
                            {formatCurrency(item.price)}
                          </p>

                          <p className="font-bold mt-2 text-[#3F3026]">
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
                  <p className="text-[#817467]">
                    No items found.
                  </p>
                )}

              </div>
            </div>

            {}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6">
              {canCancelOrder(selectedOrder.status) && (
                <button
                  type="button"
                  disabled={cancelMutation.isPending}
                  onClick={() => {
                    const confirmed = window.confirm(
                      `Cancel order #${selectedOrder.id}?`
                    );

                    if (confirmed) {
                      cancelMutation.mutate(selectedOrder.id);
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl border border-[#C9A982] text-[#8B6B50] hover:bg-[#FAF7F2] disabled:opacity-50"
                >
                  {cancelMutation.isPending ? "Cancelling..." : "Cancel Order"}
                </button>
              )}

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 rounded-xl bg-[#30251F] text-white hover:bg-[#443329]"
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

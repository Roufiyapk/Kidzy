import { useState, useMemo } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  fetchOrders,
  updateOrderStatus,
  deleteOrder,
} from "../api/ordersApi";

const STATUS_OPTIONS = [
  "Order Placed",
  "Processing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];


const getStatusText = (status) => {
  if (typeof status === "string") return status;
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

function Orders() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [page, setPage] = useState(1);
  const ordersPerPage = 5;

  const { data: orders = [], isLoading, isError } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: fetchOrders,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }) =>
      updateOrderStatus(id, { status }),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["admin-orders"],
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-orders"],
      });
      setSelectedOrder(null);
    },
  });

  const filteredOrders = useMemo(() => {
    return [...orders]
      .sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      )
      .filter((order) => {
        const customerName =
          order.user?.name ||
          order.customer?.name ||
          "Unknown";

        const matchesSearch =
          order.id.toString().includes(search) ||
          customerName.toLowerCase().includes(search.toLowerCase());

        const matchesStatus =
          statusFilter === "all"
            ? true
            : getStatusText(order.status)
              .toLowerCase()
              .includes(statusFilter.toLowerCase());

        return matchesSearch && matchesStatus;
      });
  }, [orders, search, statusFilter]);

  if (isLoading)
    return <div className="p-6">Loading orders...</div>;

  if (isError)
    return <div className="p-6 text-red-500">Failed to load orders</div>;
  const totalPages = Math.ceil(
    filteredOrders.length / ordersPerPage
  );


  const currentOrders =
    filteredOrders.slice(
      (page - 1) * ordersPerPage,
      page * ordersPerPage
    );

  return (
    <div className="min-h-screen bg-gray-100 p-3 sm:p-6">

      {/* TITLE */}
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
        Admin Orders
      </h1>

      {/* SEARCH + FILTER */}
      <div className="flex flex-col md:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">

        <input
          type="text"
          placeholder="Search by id or name"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="border rounded-lg px-3 sm:px-4 py-2 bg-white w-full md:w-80"
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="border rounded-lg px-3 sm:px-4 py-2 bg-white w-full md:w-60"
        >
          <option value="all">All Status</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
      </div>

      {/* TABLE WRAPPER */}
      <div className="bg-white rounded-2xl shadow overflow-x-auto">

        {/* HEADER */}
        <div className="min-w-[700px] grid grid-cols-5 bg-gray-200 px-4 sm:px-6 py-3 font-semibold text-sm sm:text-base">
          <div>ID</div>
          <div>Name</div>
          <div>Items</div>
          <div>Status</div>
          <div>Details</div>
        </div>

        {/* ROWS */}



        {currentOrders.map((order) => {
          const customerName =
            order.user?.name ||
            order.customer?.name ||
            "Unknown";

          return (
            <div
              key={order.id}
              className="min-w-[700px] grid grid-cols-5 px-4 sm:px-6 py-3 sm:py-4 border-b items-center text-sm sm:text-base"
            >
              <div>#{order.id}</div>

              <div className="truncate pr-2">
                {customerName}
              </div>

              <div>{order.items?.length || 0} items</div>

              <div className={`font-semibold ${getStatusColor(order.status)}`}>
                {getStatusText(order.status)}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="text-blue-600 hover:underline text-left"
                >
                  Inspect
                </button>

                <button
                  onClick={() => {
                    if (window.confirm("Delete this order?")) {
                      deleteMutation.mutate(order.id);
                    }
                  }}
                  className="text-red-600 hover:underline text-left"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* PAGINATION */}
      <div className="flex justify-center mt-6 gap-2 flex-wrap">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="border px-3 py-1 rounded disabled:opacity-50"
        >
          Prev
        </button>

        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`px-3 py-1 border rounded ${page === i + 1
                ? "bg-black text-white"
                : ""
              }`}
          >
            {i + 1}
          </button>
        ))}

        <button
          disabled={
            page === totalPages ||
            totalPages === 0
          }
          onClick={() => setPage(page + 1)}
          className="border px-3 py-1 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">

          <div className="bg-white w-full max-w-3xl rounded-2xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">

            <div className="flex justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-bold">
                Order #{selectedOrder.id}
              </h2>

              <button onClick={() => setSelectedOrder(null)}>
                ✕
              </button>
            </div>

            <div className="space-y-2 mb-4 text-sm sm:text-base">

              <p>
                <b>Customer:</b>{" "}
                {selectedOrder.user?.name ||
                  selectedOrder.customer?.name ||
                  "Unknown"}
              </p>

              <p>
                <b>Phone:</b>{" "}
                {selectedOrder.user?.phone ||
                  selectedOrder.customer?.phone ||
                  "N/A"}
              </p>


              <p>
                <b>Total:</b> ₹{selectedOrder.totalPrice}
              </p>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <b>Status:</b>

                <select
                  value={getStatusText(selectedOrder.status)}
                  onChange={(e) => {
                    updateMutation.mutate({
                      id: selectedOrder.id,
                      status: e.target.value,
                    });

                    setSelectedOrder({
                      ...selectedOrder,
                      status: e.target.value,
                    });
                  }}
                  className="border rounded px-3 py-2"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>


            {/* ITEMS */}
            <div className="space-y-4">

              {selectedOrder.items?.map((item, i) => (
                <div
                  key={i}
                  className="border rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:gap-4"
                >

                  <img
                    src={item.image || "https://via.placeholder.com/100"}
                    className="w-full sm:w-28 h-40 sm:h-28 object-cover rounded-xl"
                  />

                  <div>
                    <h3 className="font-bold">{item.name}</h3>
                    <p className="text-sm text-gray-600">
                      Qty: {item.qty}
                    </p>
                    <p className="font-bold mt-2">
                      ₹{item.price * item.qty}
                    </p>
                  </div>

                </div>
              ))}

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default Orders;
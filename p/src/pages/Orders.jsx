import { useQuery } from "@tanstack/react-query";
import { fetchOrders } from "../api/ordersApi";

/* ---------------- SAFE STATUS HANDLER ---------------- */

const getStatusText = (status) => {
  if (typeof status === "string") return status;
  if (status && typeof status === "object") return status.status;
  return "Order Placed";
};

function getStatusColor(status) {
  const value = getStatusText(status).toLowerCase();

  switch (value) {
    case "order placed":
      return "bg-purple-100 text-purple-700";
    case "processing":
      return "bg-yellow-100 text-yellow-700";
    case "shipped":
      return "bg-blue-100 text-blue-700";
    case "out for delivery":
      return "bg-indigo-100 text-indigo-700";
    case "delivered":
      return "bg-green-100 text-green-700";
    case "cancelled":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function Orders() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
    staleTime: 0,
  });

  const user = JSON.parse(localStorage.getItem("user"));

  /* ---------------- FIXED: LATEST ORDER FIRST ---------------- */
  const userOrders = (data || [])
    .filter((order) => order.userId === user?.id)
    .sort((a, b) => {
      const timeA = Date.parse(a.createdAt || 0);
      const timeB = Date.parse(b.createdAt || 0);
      return timeB - timeA; // newest first
    });

  if (isLoading) {
    return <div className="p-10 text-lg">Loading orders...</div>;
  }

  if (isError) {
    return (
      <div className="p-10 text-red-500">
        Failed to load orders
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f3ee] p-4 md:p-8">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-3xl font-bold mb-8">
          My Orders
        </h1>

        {userOrders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-8">
            <p className="text-gray-500">No orders found</p>
          </div>
        ) : (
          <div className="space-y-6">

            {userOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden"
              >

                {/* HEADER */}
                <div className="bg-gray-50 border-b px-6 py-4 flex flex-col md:flex-row md:justify-between gap-4">

                  <div className="flex flex-wrap gap-8">

                    <div>
                      <p className="text-xs text-gray-500 uppercase">
                        Order Placed
                      </p>
                      <p className="font-medium">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 uppercase">
                        Total
                      </p>
                      <p className="font-medium">
                        ₹{order.totalPrice || 0}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 uppercase">
                        Payment Method
                      </p>
                      <p className="font-medium text-gray-700">
                        {order.paymentMethod?.toUpperCase() || "N/A"}
                      </p>
                    </div>

                  </div>

                  <div>
                    <p className="text-xs text-gray-500 uppercase">
                      Order ID
                    </p>
                    <p className="font-medium">#{order.id}</p>
                  </div>

                </div>

                {/* ITEMS */}
                <div className="p-6 space-y-6">

                  {order.items?.map((item, index) => (
                    <div
                      key={index}
                      className="flex flex-col md:flex-row gap-5 border-b pb-5 last:border-b-0"
                    >

                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-28 h-28 rounded-xl object-cover border"
                      />

                      <div className="flex-1">

                        <div className="flex flex-col md:flex-row md:justify-between gap-3">

                          <div>
                            <h2 className="text-lg font-semibold text-gray-800">
                              {item.name}
                            </h2>
                            <p className="text-sm text-gray-500">
                              Quantity: {item.qty}
                            </p>
                            <p className="text-sm text-gray-500">
                              Price: ₹{item.price}
                            </p>
                          </div>

                          <div>
                            <span
                              className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                                order.status
                              )}`}
                            >
                              {getStatusText(order.status)}
                            </span>
                          </div>

                        </div>

                      </div>

                    </div>
                  ))}

                </div>

              </div>
            ))}

          </div>
        )}

      </div>
    </div>
  );
}

export default Orders;
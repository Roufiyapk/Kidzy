import { useEffect, useState } from "react";

import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
} from "recharts";

import api from "../../api/api";

function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [productsRes, usersRes, ordersRes] = await Promise.all([
          api.get("/products"),
          api.get("/users"),
          api.get("/orders"),
        ]);

        const productsData = Array.isArray(productsRes.data)
          ? productsRes.data
          : [];

        const usersData = Array.isArray(usersRes.data)
          ? usersRes.data
          : [];

        const ordersData = Array.isArray(ordersRes.data)
          ? ordersRes.data
          : [];

        setProducts(productsData);
        setOrders(ordersData);

        // Only normal users
        const normalUsers = usersData.filter(
          (user) => String(user.role || "").toLowerCase() !== "admin"
        );

        setUsers(normalUsers);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      }
    };

    loadDashboard();
  }, []);

  // SAFE STATUS HANDLER
  const getStatusText = (status) => {
    if (typeof status === "string") {
      return status;
    }

    if (status && typeof status === "object") {
      return status.status || "";
    }

    return "";
  };

  // TOTAL REVENUE
  const totalRevenue = orders.reduce((total, order) => {
    const price = Number(order.totalPrice || 0);
    return total + price;
  }, 0);

  // MONTHS
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // MONTHLY REVENUE
  const monthlyRevenue = months.map((month) => ({
    month,
    revenue: 0,
  }));

  orders.forEach((order) => {
    const date = new Date(order.createdAt);

    if (isNaN(date.getTime())) {
      return;
    }

    const monthIndex = date.getMonth();

    monthlyRevenue[monthIndex].revenue += Number(
      order.totalPrice || 0
    );
  });

  // MONTHLY ORDERS
  const monthlyOrders = months.map((month) => ({
    month,
    orders: 0,
  }));

  orders.forEach((order) => {
    const date = new Date(order.createdAt);

    if (isNaN(date.getTime())) {
      return;
    }

    const monthIndex = date.getMonth();

    monthlyOrders[monthIndex].orders += 1;
  });

  // ORDER STATUS DISTRIBUTION
  const orderDistribution = [
    {
      name: "Order Placed",
      value: orders.filter(
        (order) =>
          getStatusText(order.status).toLowerCase() ===
          "order placed"
      ).length,
    },
    {
      name: "Processing",
      value: orders.filter(
        (order) =>
          getStatusText(order.status).toLowerCase() ===
          "processing"
      ).length,
    },
    {
      name: "Shipped",
      value: orders.filter(
        (order) =>
          getStatusText(order.status).toLowerCase() ===
          "shipped"
      ).length,
    },
    {
      name: "Out for Delivery",
      value: orders.filter(
        (order) =>
          getStatusText(order.status).toLowerCase() ===
          "out for delivery"
      ).length,
    },
    {
      name: "Delivered",
      value: orders.filter(
        (order) =>
          getStatusText(order.status).toLowerCase() ===
          "delivered"
      ).length,
    },
    {
      name: "Cancelled",
      value: orders.filter(
        (order) =>
          getStatusText(order.status).toLowerCase() ===
          "cancelled"
      ).length,
    },
  ];

  const COLORS = [
    "#a855f7",
    "#f59e0b",
    "#3b82f6",
    "#6366f1",
    "#22c55e",
    "#ef4444",
  ];

  return (
    <div className="min-h-screen bg-[#f5f6fa] p-3 sm:p-6">

      {/* HEADER */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Dashboard
        </h1>

        <p className="text-gray-500 mt-1 sm:mt-2 text-sm sm:text-base">
          Ecommerce Admin Panel
        </p>
      </div>

      {/* TOP CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">

        {/* PRODUCTS */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow">
          <p className="text-gray-500 text-sm">
            Products
          </p>

          <h2 className="text-2xl sm:text-4xl font-bold mt-2 sm:mt-3 text-gray-800">
            {products.length}
          </h2>

          <p className="text-xs text-gray-400 mt-2">
            Total products
          </p>
        </div>

        {/* USERS */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow">
          <p className="text-gray-500 text-sm">
            Users
          </p>

          <h2 className="text-2xl sm:text-4xl font-bold mt-2 sm:mt-3 text-gray-800">
            {users.length}
          </h2>

          <p className="text-xs text-gray-400 mt-2">
            Registered customers
          </p>
        </div>

        {/* ORDERS */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow">
          <p className="text-gray-500 text-sm">
            Orders
          </p>

          <h2 className="text-2xl sm:text-4xl font-bold mt-2 sm:mt-3 text-gray-800">
            {orders.length}
          </h2>

          <p className="text-xs text-gray-400 mt-2">
            Total orders
          </p>
        </div>

        {/* REVENUE */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow">
          <p className="text-gray-500 text-sm">
            Revenue
          </p>

          <h2 className="text-2xl sm:text-4xl font-bold mt-2 sm:mt-3 text-gray-800">
            ₹{totalRevenue.toLocaleString("en-IN")}
          </h2>

          <p className="text-xs text-gray-400 mt-2">
            Total order value
          </p>
        </div>

      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-6 sm:mt-10">

        {/* REVENUE ANALYTICS */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow">

          <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-gray-800">
            Revenue Analytics
          </h2>

          <div className="w-full h-[250px] sm:h-[300px] md:h-[350px]">

            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyRevenue}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                />

                <YAxis
                  tick={{ fontSize: 12 }}
                />

                <Tooltip
                  formatter={(value) => [
                    `₹${Number(value).toLocaleString("en-IN")}`,
                    "Revenue",
                  ]}
                />

                <Legend />

                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />

              </LineChart>
            </ResponsiveContainer>

          </div>
        </div>

        {/* ORDER STATUS */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow">

          <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-gray-800">
            Order Status Distribution
          </h2>

          <div className="w-full h-[250px] sm:h-[300px] md:h-[350px]">

            <ResponsiveContainer width="100%" height="100%">
              <PieChart>

                <Pie
                  data={orderDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={50}
                  paddingAngle={5}
                  label
                >
                  {orderDistribution.map((entry, index) => (
                    <Cell
                      key={`${entry.name}-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>

                <Tooltip />

                <Legend />

              </PieChart>
            </ResponsiveContainer>

          </div>
        </div>

      </div>

      {/* MONTHLY ORDER DISTRIBUTION */}
      <div className="mt-6 sm:mt-10 flex justify-center px-2 sm:px-4">

        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow w-full max-w-5xl">

          <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-gray-800">
            Monthly Order Distribution
          </h2>

          <div className="w-full h-[250px] sm:h-[320px] md:h-[380px]">

            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyOrders}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                />

                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12 }}
                />

                <Tooltip />

                <Legend />

                <Bar
                  dataKey="orders"
                  fill="#22c55e"
                  radius={[8, 8, 0, 0]}
                />

              </BarChart>
            </ResponsiveContainer>

          </div>
        </div>

      </div>

    </div>
  );
}

export default Dashboard;
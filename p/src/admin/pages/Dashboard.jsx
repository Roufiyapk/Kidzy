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



function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [productsRes, usersRes, ordersRes] =
          await Promise.all([
            fetch("http://localhost:3001/products"),
            fetch("http://localhost:3001/users"),
            fetch("http://localhost:3001/orders"),
          ]);

        const productsData = await productsRes.json();
        const usersData = await usersRes.json();
        const ordersData = await ordersRes.json();

        setProducts(productsData);
        setOrders(ordersData);

        // REMOVE ADMIN USERS
        const normalUsers = usersData.filter(
          (user) => user.role !== "admin"
        );

        setUsers(normalUsers);

      } catch (err) {
        console.log(err);
      }
    };

    loadDashboard();
  }, []);

  //  SAFE STATUS HANDLER

  const getStatusText = (status) => {



    if (typeof status === "string") return status;

    if (
      status &&
      typeof status === "object"
    ) {
      return status.status || "";
    }

    return "";
  };

  /* 
     TOTAL REVENUE
   */

  const totalRevenue = orders.reduce(
    (total, order) =>
      total + (order.totalPrice || 0),
    0
  );


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

    if (isNaN(date)) return;

    const monthIndex = date.getMonth();

    monthlyRevenue[monthIndex].revenue +=
      order.totalPrice || 0;
  });

  /* 
      MONTHLY ORDER DISTRIBUTION
   */

  const monthlyOrders = months.map((month) => ({
    month,
    orders: 0,
  }));

  orders.forEach((order) => {
    const date = new Date(order.createdAt);

    if (isNaN(date)) return;

    const monthIndex = date.getMonth();

    monthlyOrders[monthIndex].orders += 1;
  });

  /* 
      ORDER STATUS DISTRIBUTION
   */

  const orderDistribution = [
    {
      name: "Order Placed",
      value: orders.filter(
        (o) =>
          getStatusText(o.status).toLowerCase() ===
          "order placed"
      ).length,
    },
    {
      name: "Processing",
      value: orders.filter(
        (o) =>
          getStatusText(o.status).toLowerCase() ===
          "processing"
      ).length,
    },
    {
      name: "Shipped",
      value: orders.filter(
        (o) =>
          getStatusText(o.status).toLowerCase() ===
          "shipped"
      ).length,
    },
    {
      name: "Out for Delivery",
      value: orders.filter(
        (o) =>
          getStatusText(o.status).toLowerCase() ===
          "out for delivery"
      ).length,
    },
    {
      name: "Delivered",
      value: orders.filter(
        (o) =>
          getStatusText(o.status).toLowerCase() ===
          "delivered"
      ).length,
    },
    {
      name: "Cancelled",
      value: orders.filter(
        (o) =>
          getStatusText(o.status).toLowerCase() ===
          "cancelled"
      ).length,
    },
  ];

  const COLORS = [
    "#a855f7", // Order Placed
    "#f59e0b", // Processing
    "#3b82f6", // Shipped
    "#6366f1", // Out for Delivery
    "#22c55e", // Delivered
    "#ef4444", // Cancelled
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

        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow">
          <p className="text-gray-500 text-sm">Products</p>
          <h2 className="text-2xl sm:text-4xl font-bold mt-2 sm:mt-3">
            {products.length}
          </h2>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow">
          <p className="text-gray-500 text-sm">Users</p>
          <h2 className="text-2xl sm:text-4xl font-bold mt-2 sm:mt-3">
            {users.length}
          </h2>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow">
          <p className="text-gray-500 text-sm">Orders</p>
          <h2 className="text-2xl sm:text-4xl font-bold mt-2 sm:mt-3">
            {orders.length}
          </h2>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow">
          <p className="text-gray-500 text-sm">Revenue</p>
          <h2 className="text-2xl sm:text-4xl font-bold mt-2 sm:mt-3">
            ₹{totalRevenue}
          </h2>
        </div>

      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-6 sm:mt-10">

        {/* LINE CHART */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow">
          <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">
            Revenue Analytics
          </h2>

          <div className="w-full h-[250px] sm:h-[300px] md:h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#4f46e5"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PIE CHART */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow">
          <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">
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
                      key={index}
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

      {/* BAR CHART */}
      <div className="mt-6 sm:mt-10 flex justify-center px-2 sm:px-4">

        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow w-full max-w-5xl">

          <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">
            Monthly Order Distribution
          </h2>

          <div className="w-full h-[250px] sm:h-[320px] md:h-[380px]">

            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyOrders}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
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
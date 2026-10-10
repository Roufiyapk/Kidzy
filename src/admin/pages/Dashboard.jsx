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
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const COLORS = [
  "#8B6B4A",
  "#C9A982",
  "#A8876A",
  "#6F5542",
  "#B69A7B",
  "#D8C2A8",
];
const unwrapApiResponse = (response) => {
  let payload = response?.data ?? response;

  for (let i = 0; i < 4; i += 1) {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      break;
    }

    if (payload.data !== undefined && payload.data !== null) {
      payload = payload.data;
      continue;
    }

    if (payload.Data !== undefined && payload.Data !== null) {
      payload = payload.Data;
      continue;
    }

    break;
  }

  return payload;
};

const getValue = (object, pascalName, camelName = pascalName) =>
  object?.[pascalName] ?? object?.[camelName];

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

function Dashboard() {
  const [dashboard, setDashboard] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    orderPlaced: 0,
    processing: 0,
    shipped: 0,
    outForDelivery: 0,
    delivered: 0,
    cancelled: 0,
    monthlyRevenue: [],
    monthlyOrders: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      setLoading(true);

      try {
        const response = await api.get("/admin/dashboard");
        const data = unwrapApiResponse(response);

        if (!data || typeof data !== "object") {
          throw new Error("The dashboard API returned an invalid response.");
        }

        const revenueRows =
          getValue(data, "MonthlyRevenue", "monthlyRevenue") ?? [];
        const orderRows =
          getValue(data, "MonthlyOrders", "monthlyOrders") ?? [];

        const revenueByMonth = new Map(
          (Array.isArray(revenueRows) ? revenueRows : []).map((item) => [
            String(getValue(item, "Month", "month") ?? "").toLowerCase(),
            toNumber(getValue(item, "Revenue", "revenue")),
          ])
        );

        const ordersByMonth = new Map(
          (Array.isArray(orderRows) ? orderRows : []).map((item) => [
            String(getValue(item, "Month", "month") ?? "").toLowerCase(),
            toNumber(getValue(item, "Orders", "orders")),
          ])
        );

        const normalizedDashboard = {
          totalUsers: toNumber(getValue(data, "TotalUsers", "totalUsers")),
          totalProducts: toNumber(
            getValue(data, "TotalProducts", "totalProducts")
          ),
          totalOrders: toNumber(getValue(data, "TotalOrders", "totalOrders")),
          totalRevenue: toNumber(
            getValue(data, "TotalRevenue", "totalRevenue")
          ),
          orderPlaced: toNumber(getValue(data, "OrderPlaced", "orderPlaced")),
          processing: toNumber(getValue(data, "Processing", "processing")),
          shipped: toNumber(getValue(data, "Shipped", "shipped")),
          outForDelivery: toNumber(
            getValue(data, "OutForDelivery", "outForDelivery")
          ),
          delivered: toNumber(getValue(data, "Delivered", "delivered")),
          cancelled: toNumber(getValue(data, "Cancelled", "cancelled")),
          monthlyRevenue: MONTHS.map((month) => ({
            month,
            revenue: revenueByMonth.get(month.toLowerCase()) ?? 0,
          })),
          monthlyOrders: MONTHS.map((month) => ({
            month,
            orders: ordersByMonth.get(month.toLowerCase()) ?? 0,
          })),
        };

        if (isMounted) {
          setDashboard(normalizedDashboard);
        }
      } catch (error) {
        console.error("Failed to load admin dashboard:", error);

        if (isMounted) {
          const message =
            error?.response?.data?.message ||
            error?.response?.data?.Message ||
            error?.message ||
            "Failed to load dashboard data.";

          toast.error(message, {
            position: "bottom-center",
            autoClose: 2500,
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
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const orderDistribution = [
    { name: "Order Placed", value: dashboard.orderPlaced },
    { name: "Processing", value: dashboard.processing },
    { name: "Shipped", value: dashboard.shipped },
    { name: "Out for Delivery", value: dashboard.outForDelivery },
    { name: "Delivered", value: dashboard.delivered },
    { name: "Cancelled", value: dashboard.cancelled },
  ];

  return (
    <div className="min-h-screen bg-[#F1EAE1] p-3 sm:p-6 md:p-8">
      <ToastContainer
        position="bottom-center"
        autoClose={1800}
        hideProgressBar
        closeButton={false}
        icon={false}
        toastStyle={{
          background: "#FFF9F3",
          color: "#5A4030",
          border: "1px solid #E7DED5",
          borderRadius: "12px",
          boxShadow: "0 4px 16px rgba(90, 64, 48, 0.12)",
          fontSize: "14px",
          fontWeight: 500,
        }}
      />

      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#3F3026]">
          Dashboard
        </h1>

        <p className="text-[#817467] mt-1 sm:mt-2 text-sm sm:text-base">
          Ecommerce Admin Panel
        </p>
      </div>

      {loading && (
        <div className="mb-4 rounded-xl border border-[#E7DDD2] bg-[#FFF9F3] p-4 text-sm text-[#6B5A4A] shadow-sm">
          Loading dashboard data...
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">

          <div className="bg-[#FFFDF9] rounded-2xl border border-[#E7DDD2] bg-[#FFFDF9] p-4 sm:p-6 shadow-[0_8px_24px_rgba(73,55,43,0.06)] transition-shadow hover:shadow-[0_12px_30px_rgba(73,55,43,0.10)]">
          <p className="text-[#817467] text-sm">
            Products
          </p>

          <h2 className="text-2xl sm:text-4xl font-bold mt-2 sm:mt-3 text-[#3F3026]">
            {dashboard.totalProducts}
          </h2>

          <p className="text-xs text-[#A99A8B] mt-2">
            Total products
          </p>
        </div>

          <div className="bg-[#FFFDF9] rounded-2xl border border-[#E7DDD2] bg-[#FFFDF9] p-4 sm:p-6 shadow-[0_8px_24px_rgba(73,55,43,0.06)] transition-shadow hover:shadow-[0_12px_30px_rgba(73,55,43,0.10)]">
          <p className="text-[#817467] text-sm">
            Users
          </p>

          <h2 className="text-2xl sm:text-4xl font-bold mt-2 sm:mt-3 text-[#3F3026]">
            {dashboard.totalUsers}
          </h2>

          <p className="text-xs text-[#A99A8B] mt-2">
            Registered customers
          </p>
        </div>

          <div className="bg-[#FFFDF9] rounded-2xl border border-[#E7DDD2] bg-[#FFFDF9] p-4 sm:p-6 shadow-[0_8px_24px_rgba(73,55,43,0.06)] transition-shadow hover:shadow-[0_12px_30px_rgba(73,55,43,0.10)]">
          <p className="text-[#817467] text-sm">
            Orders
          </p>

          <h2 className="text-2xl sm:text-4xl font-bold mt-2 sm:mt-3 text-[#3F3026]">
            {dashboard.totalOrders}
          </h2>

          <p className="text-xs text-[#A99A8B] mt-2">
            Total orders
          </p>
        </div>

          <div className="bg-[#FFFDF9] rounded-2xl border border-[#E7DDD2] bg-[#FFFDF9] p-4 sm:p-6 shadow-[0_8px_24px_rgba(73,55,43,0.06)] transition-shadow hover:shadow-[0_12px_30px_rgba(73,55,43,0.10)]">
          <p className="text-[#817467] text-sm">
            Revenue
          </p>

          <h2 className="text-2xl sm:text-4xl font-bold mt-2 sm:mt-3 text-[#3F3026]">
            ₹{dashboard.totalRevenue.toLocaleString("en-IN")}
          </h2>

          <p className="text-xs text-[#A99A8B] mt-2">
            Total order value
          </p>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-6 sm:mt-10">

          <div className="bg-[#FFFDF9] border border-[#E7DDD2] p-4 sm:p-6 rounded-2xl shadow-[0_8px_24px_rgba(73,55,43,0.06)]">

          <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-[#3F3026]">
            Revenue Analytics
          </h2>

          <div className="w-full h-[250px] sm:h-[300px] md:h-[350px]">

            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboard.monthlyRevenue}>

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
                  stroke="#8B6B4A"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />

              </LineChart>
            </ResponsiveContainer>

          </div>
        </div>

          <div className="bg-[#FFFDF9] border border-[#E7DDD2] p-4 sm:p-6 rounded-2xl shadow-[0_8px_24px_rgba(73,55,43,0.06)]">

          <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-[#3F3026]">
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

      <div className="mt-6 sm:mt-10 flex justify-center px-2 sm:px-4">

        <div className="bg-[#FFFDF9] border border-[#E7DDD2] p-4 sm:p-6 rounded-2xl shadow-[0_8px_24px_rgba(73,55,43,0.06)] w-full max-w-5xl">

          <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-[#3F3026]">
            Monthly Order Distribution
          </h2>

          <div className="w-full h-[250px] sm:h-[320px] md:h-[380px]">

            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboard.monthlyOrders}>

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
                  fill="#8B6B4A"
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
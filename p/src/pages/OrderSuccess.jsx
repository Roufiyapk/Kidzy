import { FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function OrderSuccess() {

  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f3ee] px-4">

      <div className="bg-white shadow-xl rounded-3xl p-8 md:p-12 text-center max-w-md w-full">

        <FaCheckCircle className="text-green-500 text-7xl mx-auto mb-6" />

        <h1 className="text-3xl font-bold text-gray-800">
          Order Successful 🎉
        </h1>

        <p className="text-gray-500 mt-4 leading-7">
          Your order has been placed successfully.
          Thank you for shopping with us.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-8">

          <button
            onClick={() => navigate("/")}
            className="flex-1 bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition"
          >
            Continue Shopping
          </button>

          <button
            onClick={() => navigate("/myorders")}
            className="flex-1 border border-black py-3 rounded-xl hover:bg-black hover:text-white transition"
          >
            View Orders
          </button>

        </div>

      </div>

    </div>
  );
}

export default OrderSuccess;
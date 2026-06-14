import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { clearCart } from "../redux/cartSlice";
import { addOrder } from "../redux/ordersSlice";
import { useNavigate } from "react-router-dom";

function Checkout() {
  const reduxCartItems = useSelector((state) => state.cart.items);

  const buyNowItem = JSON.parse(localStorage.getItem("buyNowItem"));

  const cartItems = buyNowItem ? buyNowItem : reduxCartItems;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    pincode: "",
    payment: "cod",
  });

  useEffect(() => {
    return () => {
      localStorage.removeItem("buyNowItem");
    };
  }, []);

  const total = cartItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      if (/^[0-9]{0,10}$/.test(value)) {
        setForm({ ...form, phone: value });
      }
      return;
    }

    if (name === "pincode") {
      if (/^[0-9]{0,6}$/.test(value)) {
        setForm({ ...form, pincode: value });
      }
      return;
    }

    setForm({ ...form, [name]: value });
  };

  const handleOrder = async () => {
    if (loading) return;

    if (!form.name || !form.address || !form.phone || !form.pincode) {
      toast.error("Fill all fields");
      return;
    }

    if (!/^[0-9]{10}$/.test(form.phone)) {
      toast.error("Phone must be 10 digits");
      return;
    }

    if (!/^[0-9]{6}$/.test(form.pincode)) {
      toast.error("PIN must be 6 digits");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user?.id) {
      toast.error("Login required");
      return;
    }

    setLoading(true);

    try {
      // STOCK CHECK
      for (const item of cartItems) {
        const productRes = await fetch(
          `http://localhost:3001/products/${item.productId || item.id}`
        );

        const product = await productRes.json();

        const sizeIndex = product.sizes.findIndex(
          (s) => s.size === item.selectedSize
        );

        if (sizeIndex === -1) {
          toast.error(`Size not found for ${product.name}`);
          setLoading(false);
          return;
        }

        const currentStock = product.sizes[sizeIndex].stock;

        if (currentStock <= 0) {
          toast.error(
            `${product.name} (${item.selectedSize}) is out of stock`
          );
          setLoading(false);
          return;
        }

        if (item.qty > currentStock) {
          toast.error(
            `Only ${currentStock} items available for ${product.name}`
          );
          setLoading(false);
          return;
        }
      }

      // REDUCE STOCK
      for (const item of cartItems) {
        const productRes = await fetch(
          `http://localhost:3001/products/${item.productId || item.id}`
        );

        const product = await productRes.json();

        const updatedSizes = product.sizes.map((sizeObj) => {
          if (sizeObj.size === item.selectedSize) {
            return {
              ...sizeObj,
              stock: Math.max(0, sizeObj.stock - item.qty),
            };
          }
          return sizeObj;
        });

        await fetch(
          `http://localhost:3001/products/${item.productId || item.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              sizes: updatedSizes,
            }),
          }
        );
      }

      // ORDER OBJECT
      const order = {
        userId: user.id,
        items: cartItems,
        totalPrice: total,
        customer: form,
        paymentMethod: form.payment,
        status: "Order Placed",
        createdAt: new Date().toISOString(),
      };

      const res = await fetch("http://localhost:3001/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });

      if (!res.ok) throw new Error("Order failed");

      const savedOrder = await res.json();

      if (!buyNowItem) {
        for (const item of cartItems) {
          await fetch(`http://localhost:3001/cart/${item.id}`, {
            method: "DELETE",
          });
        }

        dispatch(clearCart());
      }

      localStorage.removeItem("buyNowItem");

      dispatch(addOrder(savedOrder));

      toast.success("Order placed successfully");

      navigate("/order-success", {
        state: { order: savedOrder },
      });
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f3ee] flex items-center justify-center px-4 py-10">

      <div className="w-full max-w-5xl bg-white shadow-xl rounded-2xl overflow-hidden grid md:grid-cols-2">

        {/* LEFT FORM */}
        <div className="p-6 md:p-8 border-r space-y-4">

          <h2 className="text-xl font-semibold mb-2">
            Billing Details
          </h2>

          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Full Name"
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-black outline-none"
          />

          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Address"
            rows={4}
            className="w-full border rounded-lg p-3 resize-none focus:ring-2 focus:ring-black outline-none"
          />

          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone Number"
            maxLength={10}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-black outline-none"
          />

          <input
            name="pincode"
            value={form.pincode}
            onChange={handleChange}
            placeholder="PIN Code"
            maxLength={6}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-black outline-none"
          />

          <select
            name="payment"
            value={form.payment}
            onChange={handleChange}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-black outline-none"
          >
            <option value="cod">Cash on Delivery</option>
            <option value="card">Card Payment</option>
          </select>

        </div>

        {/* RIGHT SUMMARY */}
        <div className="p-6 md:p-8 bg-gray-50">

          <h2 className="text-xl font-semibold mb-4">
            Order Summary
          </h2>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">

            {cartItems.map((item) => (
              <div
                key={item.id || item.productId}
                className="flex justify-between border-b pb-2 text-sm"
              >
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-gray-500">
                    Size: {item.selectedSize}
                  </p>
                  <p className="text-gray-500">
                    Qty: {item.qty}
                  </p>
                </div>

                <p className="font-semibold">
                  ₹{item.price * item.qty}
                </p>
              </div>
            ))}
          </div>

          <div className="flex justify-between mt-6 text-lg font-bold">
            <span>Total</span>
            <span>₹{total}</span>
          </div>

          <button
            onClick={handleOrder}
            disabled={loading}
            className={`w-full mt-6 py-3 rounded-lg text-white font-medium transition ${
              loading
                ? "bg-gray-400"
                : "bg-black hover:bg-gray-800"
            }`}
          >
            {loading ? "Placing Order..." : "Place Order"}
          </button>

        </div>

      </div>
    </div>
  );
}

export default Checkout;
import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { clearCart } from "../redux/cartSlice";
import { addOrder } from "../redux/ordersSlice";
import { useNavigate } from "react-router-dom";
import { FaMapMarkerAlt } from "react-icons/fa";
import api from "../api/api";

function Checkout() {
  
  const normalizePhone = (phone) => {
    const value = String(phone || "").trim();

    if (value.startsWith("+91")) {
      return value.slice(3).replace(/\D/g, "").slice(0, 10);
    }

    if (value.startsWith("91") && value.length > 10) {
      return value.slice(2).replace(/\D/g, "").slice(0, 10);
    }

    return value.replace(/\D/g, "").slice(0, 10);
  };
  const reduxCartItems = useSelector(
    (state) => state.cart.items
  );

  const buyNowItem = JSON.parse(
    localStorage.getItem("buyNowItem") || "null"
  );

  const cartItems = buyNowItem
    ? [buyNowItem]
    : reduxCartItems;

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

  const [savedUser, setSavedUser] = useState(null);
  const [useSavedAddress, setUseSavedAddress] = useState(false);
  const [loadingSavedAddress, setLoadingSavedAddress] =
    useState(true);

  const [showConfirmModal, setShowConfirmModal] =
    useState(false);

  // LOAD SAVED ADDRESS

  useEffect(() => {
    const loadSavedAddress = async () => {
      const currentUser = JSON.parse(
        localStorage.getItem("user") || "null"
      );

      if (!currentUser?.id) {
        setLoadingSavedAddress(false);
        navigate("/login");
        return;
      }

      try {
        const response = await api.get(
          `/users/${currentUser.id}`
        );

        const latestUser = response.data;

        setSavedUser(latestUser);

        const hasAddress =
          Boolean(latestUser.address?.trim());

        setUseSavedAddress(hasAddress);

        setForm((previous) => ({
          ...previous,
          name: latestUser.name || "",
          address: latestUser.address || "",
          phone: normalizePhone(latestUser.phone),
          pincode: latestUser.pincode || "",
        }));
      } catch (error) {
        console.error(
          "Failed to load saved address:",
          error
        );

        // Fallback to localStorage.
        const localUser = JSON.parse(
          localStorage.getItem("user") || "null"
        );

        setSavedUser(localUser);

        const hasAddress =
          Boolean(localUser?.address?.trim());

        setUseSavedAddress(hasAddress);

        setForm((previous) => ({
          ...previous,
          name: localUser?.name || "",
          address: localUser?.address || "",
          phone: normalizePhone(localUser?.phone),
          pincode: localUser?.pincode || "",
        }));
      } finally {
        setLoadingSavedAddress(false);
      }
    };

    loadSavedAddress();
  }, [navigate]);

  // REMOVE BUY NOW ITEM ON UNMOUNT

  useEffect(() => {
    return () => {
      localStorage.removeItem("buyNowItem");
    };
  }, []);

  // SUBTOTAL + DELIVERY FEE + TOTAL

  const subtotal = cartItems.reduce(
    (acc, item) =>
      acc +
      Number(item.price || 0) *
        Number(item.qty || 0),
    0
  );

  // Orders below ₹499 have a ₹100 delivery fee.
  // Orders of ₹499 or above have free delivery.
  const deliveryFee = subtotal < 499 ? 100 : 0;

  const total = subtotal + deliveryFee;

  // HANDLE INPUT

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      if (!/^\d{0,10}$/.test(value)) {
        return;
      }
    }

    if (name === "pincode") {
      if (!/^\d{0,6}$/.test(value)) {
        return;
      }
    }

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    // User manually changed a delivery field.
    // It is still okay to use the changed address for this order.
  };

  // USE SAVED ADDRESS

  const handleUseSavedAddress = (checked) => {
    setUseSavedAddress(checked);

    if (!checked) {
      setForm((previous) => ({
        ...previous,
        address: "",
        pincode: "",
      }));

      return;
    }

    if (!savedUser) {
      toast.info("No saved address found");
      setUseSavedAddress(false);
      return;
    }

    if (!savedUser.address?.trim()) {
      toast.info("No saved address found. Add one in Profile.");
      setUseSavedAddress(false);
      return;
    }

    setForm((previous) => ({
      ...previous,
      name: savedUser.name || "",
      address: savedUser.address || "",
      phone: normalizePhone(savedUser.phone),
      pincode: savedUser.pincode || "",
    }));

    toast.success("Saved address applied");
  };

  // LOAD RAZORPAY

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  };

  // CHECK STOCK

  const checkStock = async () => {
    for (const item of cartItems) {
      const productId =
        item.productId ?? item.id;

      try {
        const response = await api.get(
          `/products/${productId}`
        );

        const product = response.data;

        // Products with size-wise stock.
        if (
          Array.isArray(product.sizes) &&
          product.sizes.length > 0
        ) {
          const sizeData = product.sizes.find(
            (sizeObj) =>
              String(sizeObj.size) ===
              String(item.selectedSize)
          );

          if (!sizeData) {
            toast.error(
              `Size ${
                item.selectedSize || "N/A"
              } not found for ${product.name}`
            );

            return false;
          }

          const currentStock = Number(
            sizeData.stock ?? 0
          );

          if (currentStock <= 0) {
            toast.error(
              `${product.name} - ${item.selectedSize} is out of stock`
            );

            return false;
          }

          if (
            Number(item.qty || 0) >
            currentStock
          ) {
            toast.error(
              `Only ${currentStock} available for ${product.name} (${item.selectedSize})`
            );

            return false;
          }
        } else {
          // Stock-based products.
          const currentStock = Number(
            product.stock ?? 0
          );

          if (currentStock <= 0) {
            toast.error(
              `${product.name} is out of stock`
            );

            return false;
          }

          if (
            Number(item.qty || 0) >
            currentStock
          ) {
            toast.error(
              `Only ${currentStock} available for ${product.name}`
            );

            return false;
          }
        }
      } catch (error) {
        console.error(
          "Stock checking error:",
          error
        );

        toast.error(
          "Unable to check product stock."
        );

        return false;
      }
    }

    return true;
  };

  // REDUCE STOCK

  const reduceStock = async () => {
    for (const item of cartItems) {
      const productId =
        item.productId ?? item.id;

      try {
        const response = await api.get(
          `/products/${productId}`
        );

        const product = response.data;

        if (
          Array.isArray(product.sizes) &&
          product.sizes.length > 0
        ) {
          const updatedSizes =
            product.sizes.map((sizeObj) => {
              if (
                String(sizeObj.size) ===
                String(item.selectedSize)
              ) {
                return {
                  ...sizeObj,
                  stock: Math.max(
                    0,
                    Number(sizeObj.stock ?? 0) -
                      Number(item.qty || 0)
                  ),
                };
              }

              return sizeObj;
            });

          await api.patch(
            `/products/${productId}`,
            {
              sizes: updatedSizes,
            }
          );
        } else {
          const updatedStock = Math.max(
            0,
            Number(product.stock ?? 0) -
              Number(item.qty || 0)
          );

          await api.patch(
            `/products/${productId}`,
            {
              stock: updatedStock,
            }
          );
        }
      } catch (error) {
        console.error(
          "Stock update error:",
          error
        );
      }
    }
  };

  // FINISH ORDER

  const finishOrder = async (
    paymentResponse = null
  ) => {
    try {
      const user = JSON.parse(
        localStorage.getItem("user") || "null"
      );

      if (!user?.id) {
        toast.error("Please login first.");
        setLoading(false);
        navigate("/login");
        return;
      }

      const stockAvailable =
        await checkStock();

      if (!stockAvailable) {
        setLoading(false);
        return;
      }

      const order = {
        userId: user.id,

        items: cartItems,

        subtotal,

        deliveryFee,

        totalPrice: total,

        customer: {
          name: form.name.trim(),
          address: form.address.trim(),
          phone: form.phone.trim(),
          pincode: form.pincode.trim(),
        },

        paymentMethod: form.payment,

        paymentStatus:
          form.payment === "razorpay"
            ? "Paid"
            : "Pending",

        razorpayPaymentId:
          paymentResponse?.razorpay_payment_id ||
          null,

        razorpayOrderId:
          paymentResponse?.razorpay_order_id ||
          null,

        razorpaySignature:
          paymentResponse?.razorpay_signature ||
          null,

        status: "Order Placed",

        createdAt:
          new Date().toISOString(),
      };

      // Reduce stock.
      await reduceStock();

      // Save order.
      const response = await api.post(
        "/orders",
        order
      );

      const savedOrder = response.data;

      // Clear cart only for normal cart checkout.
      if (!buyNowItem) {
        const cartResponse = await api.get(
          `/cart?userId=${user.id}`
        );

        const userCart =
          cartResponse.data;

        await Promise.all(
          userCart.map((cartItem) =>
            api.delete(
              `/cart/${cartItem.id}`
            )
          )
        );

        dispatch(clearCart());
      }

      localStorage.removeItem(
        "buyNowItem"
      );

      dispatch(addOrder(savedOrder));

      if (
        form.payment === "razorpay"
      ) {
        toast.success(
          "Payment successful! Order placed."
        );
      } else {
        toast.success(
          "Order placed successfully."
        );
      }

      navigate("/orders", {
        state: {
          orderSuccess:
            "Your order has been placed successfully. Thank you for shopping with us.",
        },
      });
    } catch (error) {
      console.error(
        "Order error:",
        error
      );

      toast.error(
        "Unable to place order."
      );

      setLoading(false);
    }
  };

  // RAZORPAY

  const handleRazorpayPayment =
    async () => {
      const loaded =
        await loadRazorpay();

      if (!loaded) {
        toast.error(
          "Razorpay failed to load."
        );

        setLoading(false);
        return;
      }

      const razorpayKey =
        import.meta.env
          .VITE_RAZORPAY_KEY_ID;

      if (!razorpayKey) {
        toast.error(
          "Razorpay Key ID is missing. Check your .env file."
        );

        setLoading(false);
        return;
      }

      try {
        const options = {
          key: razorpayKey,

          amount: Math.round(
            total * 100
          ),

          currency: "INR",

          name: "Kidzy",

          description:
            "Kidzy Kids Products Order",

          prefill: {
            name: form.name,
            contact: form.phone,
          },

          notes: {
            address: form.address,
            pincode: form.pincode,
          },

          theme: {
            color: "#000000",
          },

          handler: async (
            response
          ) => {
            await finishOrder(
              response
            );
          },

          modal: {
            ondismiss: () => {
              setLoading(false);

              toast.info(
                "Payment cancelled."
              );
            },
          },
        };

        const razorpay =
          new window.Razorpay(
            options
          );

        razorpay.on(
          "payment.failed",
          (response) => {
            console.error(
              "Razorpay Payment Failed:",
              response
            );

            setLoading(false);

            toast.error(
              response?.error
                ?.description ||
                "Payment failed."
            );
          }
        );

        razorpay.open();
      } catch (error) {
        console.error(
          "Razorpay error:",
          error
        );

        toast.error(
          "Unable to start Razorpay."
        );

        setLoading(false);
      }
    };

  // VALIDATE DELIVERY DETAILS

  const validateDeliveryDetails = () => {
    if (!form.name.trim() || !form.address.trim()) {
      toast.error("Please fill all delivery fields.");
      return false;
    }

    if (!/^\d{10}$/.test(form.phone.trim())) {
      toast.error("Phone number must be exactly 10 digits.");
      return false;
    }

    if (!/^\d{6}$/.test(form.pincode.trim())) {
      toast.error("PIN code must be exactly 6 digits.");
      return false;
    }

    return true;
  };

  // REVIEW & CONFIRM ORDER

  const handleReviewOrder = () => {
    if (loading) {
      return;
    }

    // Validate immediately when clicking
    // "Review & Confirm Order".
    // The confirmation modal opens only when
    // phone and PIN are valid.
    if (!validateDeliveryDetails()) {
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Cart is empty.");
      return;
    }

    const user = JSON.parse(
      localStorage.getItem("user") || "null"
    );

    if (!user?.id) {
      toast.error("Please login first.");
      navigate("/login");
      return;
    }

    setShowConfirmModal(true);
  };

  // PLACE ORDER

  const handleOrder = async () => {
    if (loading) {
      return;
    }

    // Validate again before actually placing the order.
    // This protects the order even if the user changes
    // the fields while the confirmation modal is open.
    if (!validateDeliveryDetails()) {
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Cart is empty.");
      setShowConfirmModal(false);
      return;
    }

    const user = JSON.parse(
      localStorage.getItem("user") || "null"
    );

    if (!user?.id) {
      toast.error("Please login first.");
      setShowConfirmModal(false);
      navigate("/login");
      return;
    }

    // Validation passed, so close the modal and continue.
    setShowConfirmModal(false);
    setLoading(true);

    try {
      const stockAvailable = await checkStock();

      if (!stockAvailable) {
        setLoading(false);
        return;
      }

      if (form.payment === "razorpay") {
        await handleRazorpayPayment();
        return;
      }

      await finishOrder();
    } catch (error) {
      console.error(error);

      toast.error("Something went wrong.");
      setLoading(false);
    }
  };

  // LOADING SAVED ADDRESS

  if (loadingSavedAddress) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-stone-600">
          Loading checkout...
        </p>
      </div>
    );
  }

  // UI

  return (
    <div className="min-h-screen bg-white px-4 py-8 md:py-10">

      <div className="w-full max-w-5xl mx-auto bg-white border border-[#e7ded5] rounded-3xl overflow-hidden shadow-sm">

        <div className="grid md:grid-cols-2">

          {/* DELIVERY DETAILS */}

          <div className="p-6 md:p-8">

            <div className="mb-6">
              <p className="text-xs uppercase tracking-[0.18em] text-stone-400 font-semibold">
                Checkout
              </p>

              <h2 className="text-2xl font-semibold text-stone-900 mt-1">
                Delivery Details
              </h2>

              <p className="text-sm text-stone-500 mt-1">
                Confirm your delivery information.
              </p>
            </div>

            {/* SAVED ADDRESS */}
            {savedUser?.address && (
              <div className="border border-[#e7ded5] rounded-2xl p-4 bg-[#fffaf5] mb-5">

                <div className="flex items-start justify-between gap-4">

                  <div className="flex items-start gap-3">

                    <div className="w-9 h-9 rounded-full bg-white border border-[#e7ded5] flex items-center justify-center flex-shrink-0">
                      <FaMapMarkerAlt className="text-[#F47B20] text-sm" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-stone-900">
                        Saved Address
                      </p>

                      <p className="text-sm text-stone-600 mt-1 leading-6">
                        {savedUser.address}
                      </p>

                      {savedUser.pincode && (
                        <p className="text-xs text-stone-500 mt-1">
                          PIN: {savedUser.pincode}
                        </p>
                      )}
                    </div>

                  </div>

                  <span className="text-xs text-green-600 font-medium whitespace-nowrap">
                    Saved
                  </span>

                </div>

                <label className="flex items-center gap-2 mt-4 text-sm font-medium text-stone-700 cursor-pointer">

                  <input
                    type="checkbox"
                    checked={useSavedAddress}
                    onChange={(e) =>
                      handleUseSavedAddress(
                        e.target.checked
                      )
                    }
                    className="w-4 h-4 accent-[#F47B20]"
                  />

                  Use Saved Address

                </label>
              </div>
            )}

            {!savedUser?.address && (
              <div className="border border-dashed border-[#d9cec4] rounded-2xl px-4 py-3 mb-5 bg-[#fcfbf9]">

                <p className="text-sm text-stone-600">
                  No saved address found.
                </p>

                <p className="text-xs text-stone-400 mt-1">
                  Add an address from Profile to use it automatically here.
                </p>

              </div>
            )}

            {/* NAME */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Full Name
              </label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Full Name"
                className="w-full border border-[#dcd3cb] rounded-xl px-4 py-3 outline-none focus:border-stone-700"
              />
            </div>

            {/* ADDRESS */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Address
              </label>

              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Delivery Address"
                rows={4}
                className="w-full border border-[#dcd3cb] rounded-xl px-4 py-3 outline-none resize-none focus:border-stone-700"
              />
            </div>

            {/* PHONE */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Phone Number
              </label>

              <div className="flex w-full border border-[#dcd3cb] rounded-xl overflow-hidden focus-within:border-stone-700">
                <span className="flex items-center px-4 bg-gray-50 text-gray-600 border-r border-[#dcd3cb] text-sm font-medium">
                  +91
                </span>

                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="10 digit phone number"
                  maxLength={10}
                  inputMode="numeric"
                  autoComplete="tel-national"
                  className="flex-1 px-4 py-3 outline-none"
                />
              </div>

              <p className="text-xs text-gray-400 mt-1">
                Enter 10 digit mobile number
              </p>
            </div>

            {/* PIN */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-stone-700 mb-2">
                PIN Code
              </label>

              <input
                type="text"
                name="pincode"
                value={form.pincode}
                onChange={handleChange}
                placeholder="6 digit PIN code"
                maxLength={6}
                inputMode="numeric"
                className="w-full border border-[#dcd3cb] rounded-xl px-4 py-3 outline-none focus:border-stone-700"
              />
            </div>

            {/* PAYMENT */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Payment Method
              </label>

              <select
                name="payment"
                value={form.payment}
                onChange={handleChange}
                className="w-full border border-[#dcd3cb] rounded-xl px-4 py-3 outline-none focus:border-stone-700 bg-white"
              >
                <option value="cod">
                  Cash on Delivery
                </option>

                <option value="razorpay">
                  Online Payment - Razorpay
                </option>
              </select>
            </div>

          </div>

          {/* ================================================= */}
          {/* ORDER SUMMARY */}
          {/* ================================================= */}

          <div className="p-6 md:p-8 bg-[#fcfaf7] border-t md:border-t-0 md:border-l border-[#e7ded5]">

            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-stone-900">
                Order Summary
              </h2>

              <p className="text-sm text-stone-500 mt-1">
                {cartItems.length}{" "}
                {cartItems.length === 1
                  ? "item"
                  : "items"}
              </p>
            </div>

            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">

              {cartItems.map(
                (item, index) => (
                  <div
                    key={
                      item.id ||
                      item.productId ||
                      index
                    }
                    className="flex gap-3 border-b border-[#e7ded5] pb-4"
                  >
                    <img
                      src={item.image}
                      alt={
                        item.name ||
                        "Product"
                      }
                      className="w-20 h-20 rounded-xl object-cover bg-white border border-[#e7ded5]"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-stone-900 line-clamp-2">
                        {item.name}
                      </p>

                      <p className="text-xs text-stone-500 mt-1">
                        Size:{" "}
                        {item.selectedSize ||
                          "N/A"}
                      </p>

                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-stone-500">
                          Qty: {item.qty}
                        </span>

                        <span className="text-sm font-semibold text-stone-900">
                          ₹
                          {(
                            Number(
                              item.price || 0
                            ) *
                            Number(
                              item.qty || 0
                            )
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              )}

            </div>

            {/* PRICE SUMMARY */}
            <div className="border-t border-[#ddd3ca] mt-6 pt-5 space-y-3">

              <div className="flex justify-between items-center">
                <span className="text-sm text-stone-600">
                  Subtotal
                </span>

                <span className="text-sm font-medium text-stone-900">
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-stone-600">
                  Delivery Fee
                </span>

                <span className="text-sm font-medium text-stone-900">
                  {deliveryFee === 0
                    ? "Free"
                    : `₹${deliveryFee.toLocaleString("en-IN")}`}
                </span>
              </div>

              <div className="pt-3 border-t border-[#e7ded5] flex justify-between items-center">
                <span className="text-base font-semibold text-stone-700">
                  Total
                </span>

                <span className="text-2xl font-bold text-stone-900">
                  ₹{total.toLocaleString("en-IN")}
                </span>
              </div>

              {subtotal < 499 && (
                <p className="text-xs text-stone-500">
                  Add ₹{(499 - subtotal).toLocaleString("en-IN")} more
                  to get free delivery.
                </p>
              )}

            </div>

            {/* CONFIRM ORDER */}
            <button
              type="button"
              onClick={handleReviewOrder}
              disabled={loading}
              className="w-full mt-6 py-3.5 rounded-full bg-stone-900 text-white font-semibold hover:bg-[#F47B20] hover:text-stone-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {form.payment === "razorpay"
                ? "Review & Confirm"
                : "Review & Confirm Order"}
            </button>

          </div>

        </div>
      </div>

      {/* CONFIRM ORDER MODAL */}

      {showConfirmModal && (
        <div
          className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center px-4"
          onClick={() => {
            if (!loading) {
              setShowConfirmModal(false);
            }
          }}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="mb-5">
              <h2 className="text-xl font-bold text-stone-900">
                Confirm Your Order
              </h2>

              <p className="text-sm text-stone-500 mt-1">
                Please check your delivery details before placing the order.
              </p>
            </div>

            <div className="space-y-4 bg-stone-50 rounded-xl p-4">
              <div>
                <p className="text-xs text-stone-400 uppercase tracking-wide">
                  Name
                </p>
                <p className="text-sm font-medium text-stone-900 mt-1">
                  {form.name || "Not entered"}
                </p>
              </div>

              <div>
                <p className="text-xs text-stone-400 uppercase tracking-wide">
                  Phone
                </p>
                <p className="text-sm font-medium text-stone-900 mt-1">
                  +91 {form.phone || "Not entered"}
                </p>
              </div>

              <div>
                <p className="text-xs text-stone-400 uppercase tracking-wide">
                  Address
                </p>
                <p className="text-sm font-medium text-stone-900 mt-1 leading-6">
                  {form.address || "Not entered"}
                </p>
              </div>

              <div>
                <p className="text-xs text-stone-400 uppercase tracking-wide">
                  PIN Code
                </p>
                <p className="text-sm font-medium text-stone-900 mt-1">
                  {form.pincode || "Not entered"}
                </p>
              </div>

              <div className="pt-3 border-t border-stone-200 space-y-2">

                <div className="flex justify-between gap-4">
                  <span className="text-sm text-stone-500">
                    Subtotal
                  </span>
                  <span className="text-sm font-medium text-stone-900">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-sm text-stone-500">
                    Delivery Fee
                  </span>
                  <span className="text-sm font-medium text-stone-900">
                    {deliveryFee === 0
                      ? "Free"
                      : `₹${deliveryFee.toLocaleString("en-IN")}`}
                  </span>
                </div>

                <div className="pt-2 border-t border-stone-200 flex justify-between gap-4">
                  <span className="text-sm text-stone-500">
                    Total
                  </span>
                  <span className="text-lg font-bold text-stone-900">
                    ₹{total.toLocaleString("en-IN")}
                  </span>
                </div>

              </div>

              <div className="flex justify-between gap-4">
                <span className="text-sm text-stone-500">
                  Payment
                </span>
                <span className="text-sm font-semibold text-stone-900 capitalize">
                  {form.payment === "razorpay"
                    ? "Razorpay"
                    : "Cash on Delivery"}
                </span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() =>
                  setShowConfirmModal(false)
                }
                disabled={loading}
                className="flex-1 py-3 rounded-xl border border-stone-300 text-stone-700 font-semibold hover:bg-stone-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleOrder}
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-stone-900 text-white font-semibold hover:bg-[#F47B20] hover:text-stone-900 disabled:opacity-50"
              >
                {loading
                  ? "Processing..."
                  : "Confirm Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Checkout;

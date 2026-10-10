import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  clearCart,
  setCart,
} from "../redux/cartSlice";
import { addOrder } from "../redux/ordersSlice";
import { useNavigate } from "react-router-dom";
import { FaMapMarkerAlt } from "react-icons/fa";
import api from "../api/api";

const toastOptions = {
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
    boxShadow: "0 4px 14px rgba(90, 64, 48, 0.12)",
    fontSize: "14px",
    fontWeight: 500,
  },
};

const showToast = {
  success: (message) => toast.success(message, toastOptions),
  error: (message) => toast.error(message, toastOptions),
  info: (message) => toast.info(message, toastOptions),
  warning: (message) => toast.warning(message, toastOptions),
};

function Checkout() {
  const reduxCartItems = useSelector(
    (state) => state.cart?.items || []
  );

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const buyNowItem = JSON.parse(
    localStorage.getItem("buyNowItem") || "null"
  );

  const cartItems = buyNowItem
    ? [buyNowItem]
    : reduxCartItems;

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    address: "",
    place: "",
    state: "",
    phone: "",
    pincode: "",
    payment: "cod",
  });

  const [savedUser, setSavedUser] =
    useState(null);

  const [useSavedAddress, setUseSavedAddress] =
    useState(false);

  const [loadingSavedAddress, setLoadingSavedAddress] =
    useState(true);

  const [showConfirmModal, setShowConfirmModal] =
    useState(false);

  const getResponseData = (response) => {
    return (
      response?.data?.data ??
      response?.data?.Data ??
      response?.data ??
      null
    );
  };

  const getApiErrorMessage = (
    error,
    fallback = "Something went wrong."
  ) => {
    const data =
      error?.response?.data;

    if (
      typeof data?.message === "string" &&
      data.message.trim()
    ) {
      return data.message;
    }

    if (
      typeof data?.Message === "string" &&
      data.Message.trim()
    ) {
      return data.Message;
    }

    if (
      Array.isArray(data?.errors) &&
      data.errors.length
    ) {
      return data.errors.join(", ");
    }

    if (
      Array.isArray(data?.Errors) &&
      data.Errors.length
    ) {
      return data.Errors.join(", ");
    }

    if (
      data?.errors &&
      typeof data.errors === "object"
    ) {
      const messages = Object.values(
        data.errors
      ).flat();

      if (messages.length) {
        return messages.join(", ");
      }
    }

    if (
      data?.Errors &&
      typeof data.Errors === "object"
    ) {
      const messages = Object.values(
        data.Errors
      ).flat();

      if (messages.length) {
        return messages.join(", ");
      }
    }

    if (
      typeof error?.message === "string" &&
      error.message.trim()
    ) {
      return error.message;
    }

    return fallback;
  };

  const normalizePhone = (phone) => {
    return String(phone || "")
      .replace(/\D/g, "")
      .slice(0, 10);
  };

  const getProductId = (item) => {
    return (
      item?.productId ??
      item?.ProductId ??
      item?.product?.id ??
      item?.product?.Id ??
      item?.id ??
      item?.Id ??
      null
    );
  };

  const getProductVariantId = (item) => {
    // First use an explicit variant ID if the item already has one.
    const directVariantId =
      item?.productVariantId ??
      item?.ProductVariantId ??
      item?.productVariant?.id ??
      item?.productVariant?.Id ??
      item?.variantId ??
      item?.VariantId ??
      item?.selectedVariantId ??
      item?.SelectedVariantId;

    if (directVariantId !== undefined && directVariantId !== null && directVariantId !== "") {
      return directVariantId;
    }

    // Buy Now stores the full product. Resolve the parent variant by the
    // selected age and size when a direct variant ID was not stored.
    const variants = Array.isArray(item?.variants)
      ? item.variants
      : Array.isArray(item?.Variants)
      ? item.Variants
      : [];

    const selectedSize = item?.selectedSize ?? item?.size ?? item?.Size ?? null;
    const selectedAge = item?.selectedAge ?? item?.ageGroup ?? item?.AgeGroup ?? null;

    const matchingVariant = variants.find((variant) => {
      const ageGroup = variant?.ageGroup ?? variant?.AgeGroup ?? null;
      const sizes = Array.isArray(variant?.sizes)
        ? variant.sizes
        : Array.isArray(variant?.Sizes)
        ? variant.Sizes
        : [];

      const hasMatchingSize = selectedSize
        ? sizes.some((size) => {
            const sizeValue = typeof size === "string"
              ? size
              : size?.size ?? size?.Size ?? "";
            return String(sizeValue) === String(selectedSize);
          })
        : true;

      const hasMatchingAge = selectedAge
        ? String(ageGroup ?? "") === String(selectedAge)
        : true;

      return hasMatchingSize && hasMatchingAge;
    });

    return matchingVariant?.id ?? matchingVariant?.Id ?? null;
  };

  const getQuantity = (item) => {
    const quantity = Number(
      item?.qty ??
        item?.quantity ??
        item?.Quantity ??
        1
    );

    return quantity > 0
      ? quantity
      : 1;
  };

  const getProductName = (item) => {
    return (
      item?.name ??
      item?.Name ??
      item?.productName ??
      item?.ProductName ??
      item?.product?.name ??
      item?.product?.Name ??
      "Product"
    );
  };

  const getProductPrice = (item) => {
    return Number(
      item?.price ??
        item?.Price ??
        item?.product?.price ??
        item?.product?.Price ??
        0
    );
  };

  const getProductImage = (item) => {
    return (
      item?.imageUrl ??
      item?.ImageUrl ??
      item?.image ??
      item?.Image ??
      item?.product?.imageUrl ??
      item?.product?.ImageUrl ??
      item?.product?.image ??
      item?.product?.Image ??
      ""
    );
  };

  const getSelectedSize = (item) => {
    return (
      item?.selectedSize ??
      item?.size ??
      item?.Size ??
      item?.productVariant?.size ??
      item?.productVariant?.Size ??
      null
    );
  };

  const getSelectedAge = (item) => {
    return (
      item?.selectedAge ??
      item?.ageGroup ??
      item?.AgeGroup ??
      item?.productVariant?.ageGroup ??
      item?.productVariant?.AgeGroup ??
      null
    );
  };

  const subtotal = cartItems.reduce(
    (sum, item) =>
      sum +
      getProductPrice(item) *
        getQuantity(item),
    0
  );

  const deliveryFee =
    subtotal < 499
      ? 100
      : 0;

  const total =
    subtotal + deliveryFee;

  useEffect(() => {
    const loadUser = async () => {
      const currentUser =
        JSON.parse(
          localStorage.getItem(
            "user"
          ) || "null"
        );

      if (!currentUser?.id) {
        setLoadingSavedAddress(
          false
        );

        navigate("/login");
        return;
      }

      try {
        const response =
          await api.get(
            "/users/profile"
          );

        const data =
          getResponseData(
            response
          );

        const user =
          data?.user ??
          data?.User ??
          data;

        setSavedUser(user);

        const address =
          user?.address ??
          user?.Address ??
          "";

        const place =
          user?.place ??
          user?.Place ??
          "";

        const state =
          user?.state ??
          user?.State ??
          "";

        const pincode =
          user?.pincode ??
          user?.Pincode ??
          user?.pinCode ??
          user?.PinCode ??
          "";

        const phone =
          user?.phone ??
          user?.Phone ??
          "";

        const name =
          user?.name ??
          user?.Name ??
          "";

        const hasAddress =
          Boolean(
            String(
              address
            ).trim()
          );

        setUseSavedAddress(
          hasAddress
        );

        setForm({
          name,
          address,
          place,
          state,
          phone:
            normalizePhone(
              phone
            ),
          pincode:
            String(
              pincode
            ),
          payment: "cod",
        });
      } catch (error) {
        console.error(
          "Load user error:",
          error
        );

        setSavedUser(
          currentUser
        );

        setForm({
          name:
            currentUser?.name ||
            currentUser?.Name ||
            "",
          address:
            currentUser?.address ||
            currentUser?.Address ||
            "",
          place:
            currentUser?.place ||
            currentUser?.Place ||
            "",
          state:
            currentUser?.state ||
            currentUser?.State ||
            "",
          phone:
            normalizePhone(
              currentUser?.phone ||
                currentUser?.Phone ||
                ""
            ),
          pincode:
            currentUser?.pincode ||
            currentUser?.Pincode ||
            currentUser?.pinCode ||
            currentUser?.PinCode ||
            "",
          payment: "cod",
        });
      } finally {
        setLoadingSavedAddress(
          false
        );
      }
    };

    loadUser();
  }, [navigate]);

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    if (
      name === "phone" &&
      !/^\d{0,10}$/.test(
        value
      )
    ) {
      return;
    }

    if (
      name === "pincode" &&
      !/^\d{0,6}$/.test(
        value
      )
    ) {
      return;
    }

    setForm(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );
  };

  const handleUseSavedAddress = (
    checked
  ) => {
    setUseSavedAddress(
      checked
    );

    if (!checked) {
      setForm(
        (previous) => ({
          ...previous,
          address: "",
          place: "",
          state: "",
          pincode: "",
        })
      );

      return;
    }

    if (!savedUser) {
      showToast.info(
        "No saved address found."
      );

      setUseSavedAddress(
        false
      );

      return;
    }

    const address =
      savedUser?.address ??
      savedUser?.Address ??
      "";

    const place =
      savedUser?.place ??
      savedUser?.Place ??
      "";

    const state =
      savedUser?.state ??
      savedUser?.State ??
      "";

    const pincode =
      savedUser?.pincode ??
      savedUser?.Pincode ??
      savedUser?.pinCode ??
      savedUser?.PinCode ??
      "";

    const phone =
      savedUser?.phone ??
      savedUser?.Phone ??
      "";

    const name =
      savedUser?.name ??
      savedUser?.Name ??
      "";

    if (
      !String(
        address
      ).trim()
    ) {
      showToast.info(
        "No saved address found."
      );

      setUseSavedAddress(
        false
      );

      return;
    }

    setForm(
      (previous) => ({
        ...previous,
        name,
        address,
        place,
        state,
        phone:
          normalizePhone(
            phone
          ),
        pincode:
          String(pincode),
      })
    );

    showToast.success(
      "Saved address applied."
    );
  };

  const loadRazorpay = () => {
    return new Promise(
      (resolve) => {
        if (
          window.Razorpay
        ) {
          resolve(true);
          return;
        }

        const existingScript =
          document.querySelector(
            'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
          );

        if (
          existingScript
        ) {
          existingScript.addEventListener(
            "load",
            () => resolve(true),
            {
              once: true,
            }
          );

          existingScript.addEventListener(
            "error",
            () => resolve(false),
            {
              once: true,
            }
          );

          return;
        }

        const script =
          document.createElement(
            "script"
          );

        script.src =
          "https://checkout.razorpay.com/v1/checkout.js";

        script.onload =
          () => resolve(true);

        script.onerror =
          () => resolve(false);

        document.body.appendChild(
          script
        );
      }
    );
  };

  const validateCheckoutItems =
    () => {
      if (
        !cartItems.length
      ) {
        showToast.error(
          "Your cart is empty."
        );

        return false;
      }

      if (
        buyNowItem
      ) {
        const productId =
          getProductId(
            buyNowItem
          );

        if (!productId) {
          showToast.error(
            "Product information is missing."
          );

          return false;
        }

        const variantId =
          getProductVariantId(
            buyNowItem
          );

        const selectedSize =
          getSelectedSize(
            buyNowItem
          );

        const selectedAge =
          getSelectedAge(
            buyNowItem
          );

        if (
          (
            selectedSize ||
            selectedAge
          ) &&
          !variantId
        ) {
          showToast.error(
            "Selected product variant is missing."
          );

          return false;
        }
      }

      return true;
    };

  const validateForm = () => {
    if (
      !validateCheckoutItems()
    ) {
      return false;
    }

    if (
      !form.name.trim()
    ) {
      showToast.error(
        "Name is required."
      );

      return false;
    }

    if (
      !form.address.trim()
    ) {
      showToast.error(
        "Address is required."
      );

      return false;
    }

    if (
      !form.place.trim()
    ) {
      showToast.error(
        "Place is required."
      );

      return false;
    }

    if (
      !form.state.trim()
    ) {
      showToast.error(
        "State is required."
      );

      return false;
    }

    if (
      !/^\d{10}$/.test(
        form.phone
      )
    ) {
      showToast.error(
        "Phone number must be exactly 10 digits."
      );

      return false;
    }

    if (
      !/^\d{6}$/.test(
        form.pincode
      )
    ) {
      showToast.error(
        "Pincode must be exactly 6 digits."
      );

      return false;
    }

    return true;
  };

  const createRazorpayOrder =
    async () => {
      const checkoutType =
        buyNowItem
          ? "buy-now"
          : "cart";

      const payload =
        buyNowItem
          ? {
              checkoutType,

              productId:
                Number(
                  getProductId(
                    buyNowItem
                  )
                ),

              productVariantId:
                getProductVariantId(
                  buyNowItem
                ) == null
                  ? null
                  : Number(
                      getProductVariantId(
                        buyNowItem
                      )
                    ),

              quantity:
                getQuantity(
                  buyNowItem
                ),
            }
          : {
              checkoutType,
              quantity: 1,
            };

      const response =
        await api.post(
          "/payments/create-order",
          payload
        );

      const data =
        getResponseData(
          response
        ) || {};

      const paymentId =
        data?.paymentId ??
        data?.PaymentId;

      const keyId =
        data?.keyId ??
        data?.KeyId;

      const razorpayOrder =
        data?.razorpayOrder ??
        data?.RazorpayOrder;

      const razorpayOrderId =
        razorpayOrder?.id ??
        razorpayOrder?.Id;

      const amount =
        Number(
          razorpayOrder?.amount ??
            razorpayOrder?.Amount ??
            0
        );

      const currency =
        razorpayOrder?.currency ??
        razorpayOrder?.Currency ??
        "INR";

      if (!paymentId) {
        throw new Error(
          "Payment ID was not returned by the backend."
        );
      }

      if (!keyId) {
        throw new Error(
          "Razorpay Key ID was not returned by the backend."
        );
      }

      if (!razorpayOrderId) {
        throw new Error(
          "Razorpay order was not returned by the backend."
        );
      }

      if (
        amount <= 0
      ) {
        throw new Error(
          "Invalid payment amount returned by the backend."
        );
      }

      return {
        paymentId,
        keyId,
        razorpayOrderId,
        amount,
        currency,
      };
    };

  const verifyPayment =
    async (
      paymentId,
      paymentResponse
    ) => {
      if (
        !paymentResponse?.razorpay_order_id ||
        !paymentResponse?.razorpay_payment_id ||
        !paymentResponse?.razorpay_signature
      ) {
        throw new Error(
          "Razorpay verification details are incomplete."
        );
      }

      const response =
        await api.post(
          "/payments/verify",
          {
            razorpayOrderId:
              paymentResponse.razorpay_order_id,

            razorpayPaymentId:
              paymentResponse.razorpay_payment_id,

            razorpaySignature:
              paymentResponse.razorpay_signature,
          }
        );

      const data =
        getResponseData(
          response
        ) || {};

      const success =
        data?.success ??
        data?.Success ??
        false;

      const verifiedPaymentId =
        data?.paymentId ??
        data?.PaymentId ??
        paymentId;

      if (!success) {
        throw new Error(
          data?.message ??
            data?.Message ??
            "Payment verification failed."
        );
      }

      return Number(
        verifiedPaymentId
      );
    };

  const createBackendOrder =
    async (
      paymentId = null
    ) => {
      const commonData = {
        name:
          form.name.trim(),

        address:
          form.address.trim(),

        place:
          form.place.trim(),

        state:
          form.state.trim(),

        phone:
          form.phone.trim(),

        pincode:
          form.pincode.trim(),

        paymentMethod:
          form.payment,

        paymentId:
          paymentId == null
            ? null
            : Number(
                paymentId
              ),
      };

      const payload =
        buyNowItem
          ? {
              ...commonData,

              productId:
                Number(
                  getProductId(
                    buyNowItem
                  )
                ),

              productVariantId:
                getProductVariantId(
                  buyNowItem
                ) == null
                  ? null
                  : Number(
                      getProductVariantId(
                        buyNowItem
                      )
                    ),

              quantity:
                getQuantity(
                  buyNowItem
                ),
            }
          : commonData;

      const endpoint =
        buyNowItem
          ? "/orders/buy-now"
          : "/orders/cart";

      const response =
        await api.post(
          endpoint,
          payload
        );

      const data =
        getResponseData(
          response
        ) || {};

      const order =
        data?.order ??
        data?.Order ??
        data;

      const orderId =
        order?.id ??
        order?.Id;

      if (!orderId) {
        throw new Error(
          "Order was not returned by the backend."
        );
      }

      return order;
    };

  const openRazorpay =
    async () => {
      const loaded =
        await loadRazorpay();

      if (!loaded) {
        throw new Error(
          "Razorpay failed to load."
        );
      }

      const paymentData =
        await createRazorpayOrder();

      const {
        paymentId,
        keyId,
        razorpayOrderId,
        amount,
        currency,
      } = paymentData;

      const options = {
        key: keyId,

        amount,

        currency,

        order_id:
          razorpayOrderId,

        name:
          "Kidzy",

        description:
          "Kidzy Kids Products Order",

        prefill: {
          name:
            form.name.trim(),

          contact:
            form.phone.trim(),
        },

        notes: {
          address:
            form.address.trim(),

          place:
            form.place.trim(),

          state:
            form.state.trim(),

          pincode:
            form.pincode.trim(),
        },

        theme: {
          color:
            "#5A4030",
        },

        handler:
          async (
            paymentResponse
          ) => {
            try {
              const verifiedPaymentId =
                await verifyPayment(
                  paymentId,
                  paymentResponse
                );

              const order =
                await createBackendOrder(
                  verifiedPaymentId
                );

              if (
                !buyNowItem
              ) {
                dispatch(
                  clearCart()
                );

                dispatch(
                  setCart([])
                );
              }

              localStorage.removeItem(
                "buyNowItem"
              );

              dispatch(
                addOrder(
                  order
                )
              );

              setLoading(
                false
              );

              showToast.success(
                "Payment successful! Order placed."
              );

              navigate(
                "/orders"
              );
            } catch (
              error
            ) {
              console.error(
                "Payment/order error:",
                error
              );

              showToast.error(
                getApiErrorMessage(
                  error,
                  "Payment verification failed."
                )
              );

              setLoading(
                false
              );
            }
          },

        modal: {
          ondismiss:
            () => {
              setLoading(
                false
              );

              showToast.info(
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
            "Razorpay payment failed:",
            response
          );

          setLoading(
            false
          );

          showToast.error(
            response?.error
              ?.description ||
              "Payment failed."
          );
        }
      );

      razorpay.open();
    };

  const handleRazorpay =
    async () => {
      if (
        loading
      ) {
        return;
      }

      if (
        !validateForm()
      ) {
        return;
      }

      const user =
        JSON.parse(
          localStorage.getItem(
            "user"
          ) || "null"
        );

      if (!user?.id) {
        showToast.error(
          "Please login first."
        );

        navigate(
          "/login"
        );

        return;
      }

      setLoading(
        true
      );

      try {
        await openRazorpay();
      } catch (
        error
      ) {
        console.error(
          "Razorpay error:",
          error
        );

        showToast.error(
          getApiErrorMessage(
            error,
            "Unable to open Razorpay."
          )
        );

        setLoading(
          false
        );
      }
    };

  const handleReviewOrder =
    () => {
      if (
        loading
      ) {
        return;
      }

      if (
        !validateForm()
      ) {
        return;
      }

      const user =
        JSON.parse(
          localStorage.getItem(
            "user"
          ) || "null"
        );

      if (!user?.id) {
        showToast.error(
          "Please login first."
        );

        navigate(
          "/login"
        );

        return;
      }

      setShowConfirmModal(
        true
      );
    };

  const handleCodOrder =
    async () => {
      if (
        loading
      ) {
        return;
      }

      if (
        !validateForm()
      ) {
        return;
      }

      const user =
        JSON.parse(
          localStorage.getItem(
            "user"
          ) || "null"
        );

      if (!user?.id) {
        showToast.error(
          "Please login first."
        );

        navigate(
          "/login"
        );

        return;
      }

      setLoading(
        true
      );

      try {
        const order =
          await createBackendOrder(
            null
          );

        if (
          !buyNowItem
        ) {
          dispatch(
            clearCart()
          );

          dispatch(
            setCart([])
          );
        }

        localStorage.removeItem(
          "buyNowItem"
        );

        dispatch(
          addOrder(
            order
          )
        );

        setShowConfirmModal(
          false
        );

        setLoading(
          false
        );

        showToast.success(
          "Order placed successfully."
        );

        navigate(
          "/orders"
        );
      } catch (
        error
      ) {
        console.error(
          "COD order error:",
          error
        );

        showToast.error(
          getApiErrorMessage(
            error,
            "Unable to place order."
          )
        );

        setLoading(
          false
        );
      }
    };

  if (
    loadingSavedAddress
  ) {
    return (
      <div className="min-h-screen bg-[#F7F3EE] flex items-center justify-center">
        <p className="text-stone-600">
          Loading checkout...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F3EE] px-4 py-8 md:py-10">
      <div className="w-full max-w-5xl mx-auto bg-white border border-[#e7ded5] rounded-2xl overflow-hidden shadow-sm">
        <div className="grid md:grid-cols-2">
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

            {savedUser?.address && (
              <div className="border border-[#e7ded5] rounded-xl p-4 bg-[#fffaf5] mb-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-white border border-[#e7ded5] flex items-center justify-center flex-shrink-0">
                    <FaMapMarkerAlt className="text-[#6B4F3A] text-sm" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-stone-900">
                      Saved Address
                    </p>

                    <p className="text-sm text-stone-600 mt-1 leading-6">
                      {savedUser?.address ??
                        savedUser?.Address}
                    </p>

                    {(savedUser?.place ||
                      savedUser?.Place) && (
                      <p className="text-xs text-stone-500 mt-1">
                        {savedUser?.place ??
                          savedUser?.Place}
                      </p>
                    )}

                    {(savedUser?.state ||
                      savedUser?.State) && (
                      <p className="text-xs text-stone-500 mt-1">
                        {savedUser?.state ??
                          savedUser?.State}
                      </p>
                    )}

                    {(savedUser?.pincode ||
                      savedUser?.Pincode ||
                      savedUser?.pinCode ||
                      savedUser?.PinCode) && (
                      <p className="text-xs text-stone-500 mt-1">
                        PIN:{" "}
                        {savedUser?.pincode ??
                          savedUser?.Pincode ??
                          savedUser?.pinCode ??
                          savedUser?.PinCode}
                      </p>
                    )}
                  </div>
                </div>

                <label className="flex items-center gap-2 mt-4 text-sm font-medium text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={
                      useSavedAddress
                    }
                    onChange={(e) =>
                      handleUseSavedAddress(
                        e.target.checked
                      )
                    }
                    className="w-4 h-4 accent-[#6B4F3A]"
                  />

                  Use Saved Address
                </label>
              </div>
            )}

            {!savedUser?.address && (
              <div className="border border-dashed border-[#e7ded5] rounded-2xl px-4 py-3 mb-5 bg-[#fcfaf7]">
                <p className="text-sm text-stone-600">
                  No saved address
                  found.
                </p>

                <p className="text-xs text-stone-400 mt-1">
                  Add an address from
                  Profile to use it
                  automatically here.
                </p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Full Name
              </label>

              <input
                type="text"
                name="name"
                value={
                  form.name
                }
                onChange={
                  handleChange
                }
                placeholder="Full Name"
                className="w-full border border-[#e7ded5] rounded-xl px-4 py-3 outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Address
              </label>

              <textarea
                name="address"
                value={
                  form.address
                }
                onChange={
                  handleChange
                }
                placeholder="Delivery Address"
                rows={4}
                className="w-full border border-[#e7ded5] rounded-xl px-4 py-3 outline-none resize-none focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Place
              </label>

              <input
                type="text"
                name="place"
                value={
                  form.place
                }
                onChange={
                  handleChange
                }
                placeholder="Place"
                className="w-full border border-[#e7ded5] rounded-xl px-4 py-3 outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-stone-700 mb-2">
                State
              </label>

              <input
                type="text"
                name="state"
                value={
                  form.state
                }
                onChange={
                  handleChange
                }
                placeholder="State"
                className="w-full border border-[#e7ded5] rounded-xl px-4 py-3 outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Phone Number
              </label>

              <div className="flex w-full border border-[#e7ded5] rounded-xl overflow-hidden focus-within:border-stone-700">
                <span className="flex items-center px-4 bg-gray-50 text-gray-600 border-r border-[#e7ded5] text-sm font-medium">
                  +91
                </span>

                <input
                  type="text"
                  name="phone"
                  value={
                    form.phone
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="10 digit phone number"
                  maxLength={10}
                  inputMode="numeric"
                  autoComplete="tel-national"
                  className="flex-1 px-4 py-3 outline-none"
                />
              </div>

              <p className="text-xs text-gray-400 mt-1">
                Enter 10 digit
                mobile number
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-stone-700 mb-2">
                PIN Code
              </label>

              <input
                type="text"
                name="pincode"
                value={
                  form.pincode
                }
                onChange={
                  handleChange
                }
                placeholder="6 digit PIN code"
                maxLength={6}
                inputMode="numeric"
                className="w-full border border-[#e7ded5] rounded-xl px-4 py-3 outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Payment Method
              </label>

              <select
                name="payment"
                value={
                  form.payment
                }
                onChange={
                  handleChange
                }
                className="w-full border border-[#e7ded5] rounded-xl px-4 py-3 outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-200 bg-white"
              >
                <option value="cod">
                  Cash on Delivery
                </option>

                <option value="razorpay">
                  Online Payment -
                  Razorpay
                </option>
              </select>
            </div>
          </div>

          <div className="p-6 md:p-8 bg-[#fcfaf7] border-t md:border-t-0 md:border-l border-[#e7ded5]">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-stone-900">
                Order Summary
              </h2>

              <p className="text-sm text-stone-500 mt-1">
                {cartItems.length}{" "}
                {cartItems.length ===
                1
                  ? "item"
                  : "items"}
              </p>
            </div>

            {cartItems.length ===
            0 ? (
              <div className="bg-white border border-[#e7ded5] rounded-2xl p-5">
                <p className="text-sm text-stone-600">
                  Your cart is
                  empty.
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                {cartItems.map(
                  (
                    item,
                    index
                  ) => {
                    const image =
                      getProductImage(
                        item
                      );

                    const name =
                      getProductName(
                        item
                      );

                    const size =
                      getSelectedSize(
                        item
                      );

                    const age =
                      getSelectedAge(
                        item
                      );

                    const quantity =
                      getQuantity(
                        item
                      );

                    const price =
                      getProductPrice(
                        item
                      );

                    return (
                      <div
                        key={
                          item?.id ??
                          `${getProductId(
                            item
                          )}-${getProductVariantId(
                            item
                          )}-${index}`
                        }
                        className="flex gap-3 border-b border-[#e7ded5] pb-4"
                      >
                        {image ? (
                          <img
                            src={
                              image
                            }
                            alt={
                              name
                            }
                            className="w-20 h-20 rounded-xl object-cover bg-white border border-[#e7ded5]"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-xl bg-white border border-[#e7ded5] flex items-center justify-center text-xs text-stone-400">
                            No image
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-stone-900 line-clamp-2">
                            {
                              name
                            }
                          </p>

                          {age && (
                            <p className="text-xs text-stone-500 mt-1">
                              Age:{" "}
                              {
                                age
                              }
                            </p>
                          )}

                          {size && (
                            <p className="text-xs text-stone-500 mt-1">
                              Size:{" "}
                              {
                                size
                              }
                            </p>
                          )}

                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-stone-500">
                              Qty:{" "}
                              {
                                quantity
                              }
                            </span>

                            <span className="text-sm font-semibold text-stone-900">
                              ₹
                              {(
                                price *
                                quantity
                              ).toLocaleString(
                                "en-IN"
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}

            <div className="border-t border-[#e7ded5] mt-6 pt-5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-stone-600">
                  Subtotal
                </span>

                <span className="text-sm font-medium text-stone-900">
                  ₹
                  {subtotal.toLocaleString(
                    "en-IN"
                  )}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-stone-600">
                  Delivery Fee
                </span>

                <span className="text-sm font-medium text-stone-900">
                  {deliveryFee ===
                  0
                    ? "Free"
                    : `₹${deliveryFee.toLocaleString(
                        "en-IN"
                      )}`}
                </span>
              </div>

              <div className="pt-3 border-t border-[#e7ded5] flex justify-between items-center">
                <span className="text-base font-semibold text-stone-700">
                  Total
                </span>

                <span className="text-2xl font-bold text-stone-900">
                  ₹
                  {total.toLocaleString(
                    "en-IN"
                  )}
                </span>
              </div>

              {subtotal > 0 &&
                subtotal <
                  499 && (
                  <p className="text-xs text-stone-500">
                    Add ₹
                    {(
                      499 -
                      subtotal
                    ).toLocaleString(
                      "en-IN"
                    )}{" "}
                    more to get
                    free delivery.
                  </p>
                )}
            </div>

            <button
              type="button"
              onClick={
                form.payment ===
                "razorpay"
                  ? handleRazorpay
                  : handleReviewOrder
              }
              disabled={
                loading ||
                cartItems.length ===
                  0
              }
              className="w-full mt-6 py-3.5 rounded-xl bg-[#5A4030] text-white font-medium hover:bg-[#6B4F3A] hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {form.payment ===
              "razorpay"
                ? loading
                  ? "Opening Payment..."
                  : "Pay Now"
                : "Review & Confirm"}
            </button>
          </div>
        </div>
      </div>

      {showConfirmModal && (
        <div
          className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center px-4"
          onClick={() => {
            if (!loading) {
              setShowConfirmModal(
                false
              );
            }
          }}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="mb-5">
              <h2 className="text-xl font-bold text-stone-900">
                Confirm Your
                Order
              </h2>

              <p className="text-sm text-stone-500 mt-1">
                Please check your
                delivery details
                before placing the
                order.
              </p>
            </div>

            <div className="space-y-4 bg-stone-50 rounded-xl p-4">
              <div>
                <p className="text-xs text-stone-400 uppercase tracking-wide">
                  Name
                </p>

                <p className="text-sm font-medium text-stone-900 mt-1">
                  {
                    form.name
                  }
                </p>
              </div>

              <div>
                <p className="text-xs text-stone-400 uppercase tracking-wide">
                  Phone
                </p>

                <p className="text-sm font-medium text-stone-900 mt-1">
                  +91{" "}
                  {
                    form.phone
                  }
                </p>
              </div>

              <div>
                <p className="text-xs text-stone-400 uppercase tracking-wide">
                  Address
                </p>

                <p className="text-sm font-medium text-stone-900 mt-1 leading-6">
                  {
                    form.address
                  }
                </p>
              </div>

              <div>
                <p className="text-xs text-stone-400 uppercase tracking-wide">
                  Place
                </p>

                <p className="text-sm font-medium text-stone-900 mt-1">
                  {
                    form.place
                  }
                </p>
              </div>

              <div>
                <p className="text-xs text-stone-400 uppercase tracking-wide">
                  State
                </p>

                <p className="text-sm font-medium text-stone-900 mt-1">
                  {
                    form.state
                  }
                </p>
              </div>

              <div>
                <p className="text-xs text-stone-400 uppercase tracking-wide">
                  Pincode
                </p>

                <p className="text-sm font-medium text-stone-900 mt-1">
                  {
                    form.pincode
                  }
                </p>
              </div>

              <div className="pt-3 border-t border-stone-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-stone-500">
                    Subtotal
                  </span>

                  <span className="text-sm font-medium text-stone-900">
                    ₹
                    {subtotal.toLocaleString(
                      "en-IN"
                    )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-stone-500">
                    Delivery Fee
                  </span>

                  <span className="text-sm font-medium text-stone-900">
                    {deliveryFee ===
                    0
                      ? "Free"
                      : `₹${deliveryFee.toLocaleString(
                          "en-IN"
                        )}`}
                  </span>
                </div>

                <div className="pt-2 border-t border-stone-200 flex justify-between">
                  <span className="font-semibold">
                    Total
                  </span>

                  <span className="font-bold">
                    ₹
                    {total.toLocaleString(
                      "en-IN"
                    )}
                  </span>
                </div>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-stone-500">
                  Payment
                </span>

                <span className="text-sm font-semibold text-stone-900">
                  Cash on Delivery
                </span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() =>
                  setShowConfirmModal(
                    false
                  )
                }
                disabled={
                  loading
                }
                className="flex-1 py-3 rounded-xl border border-stone-300 text-stone-700 font-semibold hover:bg-stone-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleCodOrder
                }
                disabled={
                  loading
                }
                className="flex-1 py-3 rounded-xl bg-[#5A4030] text-white font-semibold hover:bg-[#6B4F3A] hover:text-white disabled:opacity-50"
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
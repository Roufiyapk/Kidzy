import { useDispatch, useSelector } from "react-redux";

import {
  removeFromCart,
  updateQty,
  clearCart,
  setCart,
} from "../redux/cartSlice";

import { useNavigate } from "react-router-dom";

import { useEffect, useState } from "react";

import { toast } from "react-toastify";

import api from "../api/api";

function Cart() {
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
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items, totalPrice } = useSelector(
    (state) => state.cart
  );

  const token = localStorage.getItem("token");

  const [stockInfo, setStockInfo] = useState({});
  const [updatingItems, setUpdatingItems] = useState({});

  const getStockKey = (item) => {
    return `${item.id}_${item.productVariantId ?? item.selectedSize ?? ""}`;
  };

  const getAvailableStock = (item) => {
    const key = getStockKey(item);

    const stockFromState = stockInfo[key];

    if (stockFromState !== undefined) {
      return Number(stockFromState);
    }

    const stock =
      item.availableStock ??
      item.stock ??
      item.Stock;

    if (stock === undefined || stock === null) {
      return undefined;
    }

    return Number(stock);
  };

  useEffect(() => {
    const loadCart = async () => {
      if (!token) {
        dispatch(setCart([]));
        return;
      }

      try {
        const response = await api.get("/cart");

        const cart =
          response?.data?.data ??
          response?.data;

        const cartItems = Array.isArray(cart?.items)
          ? cart.items
          : [];

        const normalizedItems = cartItems.map((item) => {
          const normalized = {
            ...item,

            id: item.id ?? item.Id,

            productId: item.productId ?? item.ProductId,

            productVariantId:
              item.productVariantId ??
              item.ProductVariantId ??
              null,

            name:
              item.name ??
              item.productName ??
              item.ProductName ??
              "",

            image:
              item.image ??
              item.imageUrl ??
              item.ImageUrl ??
              "",

            price:
              Number(item.price ?? item.Price ?? 0),

            qty:
              Number(
                item.qty ??
                item.quantity ??
                item.Quantity ??
                1
              ),

            selectedSize:
              item.selectedSize ??
              item.size ??
              item.Size ??
              "",

            availableStock:
              item.availableStock ??
              item.stock ??
              item.Stock,
          };

          return normalized;
        });

        const newStockInfo = {};

        normalizedItems.forEach((item) => {
          const stock = item.availableStock;

          if (stock !== undefined && stock !== null) {
            newStockInfo[getStockKey(item)] = Number(stock);
          }
        });

        setStockInfo(newStockInfo);

        dispatch(setCart(normalizedItems));
      } catch (error) {
        console.error("Load cart error:", error);

        const message =
          error?.response?.data?.errors?.[0] ||
          error?.response?.data?.message ||
          "Failed to load cart.";

        notify("error", message);
      }
    };

    loadCart();
  }, [dispatch, token]);

  const handleRemove = async (item) => {
    if (!token) {
      notify("error", "Please login first");
      navigate("/login");
      return;
    }

    try {
      await api.delete(`/cart/${item.id}`);

      dispatch(
        removeFromCart({
          id: item.id,
          selectedSize: item.selectedSize,
          productVariantId: item.productVariantId,
        })
      );

      notify("success", "Removed from cart");
    } catch (error) {
      console.error("Remove cart error:", error);

      const message =
        error?.response?.data?.errors?.[0] ||
        error?.response?.data?.message ||
        "Failed to remove item.";

      notify("error", message);
    }
  };

  const handleQtyChange = async (item, newQty) => {
    if (!token) {
      notify("error", "Please login first");
      navigate("/login");
      return;
    }

    if (newQty <= 0) {
      return;
    }

    const availableStock = getAvailableStock(item);

    if (
      availableStock !== undefined &&
      newQty > availableStock
    ) {
      notify("warning", 
        `Only ${availableStock} items are available.`
      );

      return;
    }

    if (updatingItems[item.id]) {
      return;
    }

    setUpdatingItems((previous) => ({
      ...previous,
      [item.id]: true,
    }));

    try {
      const response = await api.put(
        `/cart/${item.id}`,
        {
          quantity: Number(newQty),
        }
      );

      const updatedItem =
        response?.data?.data ??
        response?.data;

      dispatch(
        updateQty({
          id: item.id,
          selectedSize: item.selectedSize,
          productVariantId: item.productVariantId,
          qty: Number(
            updatedItem?.quantity ??
            updatedItem?.Quantity ??
            newQty
          ),
        })
      );

      const returnedStock =
        updatedItem?.availableStock ??
        updatedItem?.stock ??
        updatedItem?.Stock;

      if (
        returnedStock !== undefined &&
        returnedStock !== null
      ) {
        setStockInfo((previous) => ({
          ...previous,
          [getStockKey(item)]: Number(returnedStock),
        }));
      }
    } catch (error) {
      console.error("Update cart error:", error);

      const message =
        error?.response?.data?.errors?.[0] ||
        error?.response?.data?.message ||
        "Failed to update quantity.";

      notify("error", message);
    } finally {
      setUpdatingItems((previous) => ({
        ...previous,
        [item.id]: false,
      }));
    }
  };

  const handleClear = async () => {
    if (!token) {
      notify("error", "Please login first");
      navigate("/login");
      return;
    }

    try {
      await api.delete("/cart");

      dispatch(clearCart());

      setStockInfo({});

      notify("success", "Cart cleared");
    } catch (error) {
      console.error("Clear cart error:", error);

      const message =
        error?.response?.data?.errors?.[0] ||
        error?.response?.data?.message ||
        "Failed to clear cart.";

      notify("error", message);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#faf8f5] px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <h1 className="mb-4 text-center text-3xl font-semibold tracking-tight text-[#382d27]">
            Your Shopping Cart
          </h1>

          <p className="text-center text-sm text-[#8b7b70]">
            Your cart is waiting for something lovely.
          </p>

          <div className="mt-12 rounded-2xl border border-[#e9e1d9] bg-white px-6 py-16 text-center">
            <p className="text-lg font-medium text-[#57473c]">
              Your cart is empty
            </p>

            <p className="mt-2 text-sm text-[#948579]">
              Explore our collection and find something special.
            </p>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="mt-6 rounded-full bg-[#594438] px-8 py-3 text-sm font-medium text-white transition hover:bg-[#443329]"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
<div className="mb-10 border-b border-[#e9e1d9] pb-6">
          <p className="mb-2 text-center text-xs font-medium uppercase tracking-[0.25em] text-[#9a8575]">
            KIDZY COLLECTION
          </p>

          <h1 className="text-center text-3xl font-semibold tracking-tight text-[#382d27] sm:text-4xl">
            Your Shopping Cart
          </h1>

          <p className="mt-3 text-center text-sm text-[#8b7b70]">
            Review your little one's favourites.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_340px]">
<div className="space-y-4">
            {items.map((item) => {
              const availableStock = getAvailableStock(item);

              const isUpdating = Boolean(
                updatingItems[item.id]
              );

              const isAtStockLimit =
                availableStock !== undefined &&
                Number(item.qty) >= availableStock;

              return (
                <div
                  key={`${item.id}_${item.productVariantId ?? item.selectedSize ?? ""}`}
                  className="rounded-2xl border border-[#e9e1d9] bg-white p-4 sm:p-5"
                >
                  <div className="flex gap-4 sm:gap-6">
<div className="h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-[#f4eee8] sm:h-36 sm:w-32">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
<div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="break-words text-base font-medium text-[#382d27] sm:text-lg">
                            {item.name}
                          </h2>

                          <p className="mt-2 text-sm font-medium text-[#796253]">
                            ₹{Number(item.price).toLocaleString("en-IN")}
                          </p>

                          {item.selectedSize && (
                            <p className="mt-1 text-sm text-[#8b7b70]">
                              Size: {item.selectedSize}
                            </p>
                          )}
                        </div>
<button
                          type="button"
                          onClick={() => handleRemove(item)}
                          className="shrink-0 text-xs font-medium text-[#907b6b] underline underline-offset-4 transition hover:text-[#49372c]"
                        >
                          Remove
                        </button>
                      </div>
{availableStock !== undefined && (
                        <p
                          className={`mt-3 text-xs ${
                            availableStock <= 0
                              ? "text-[#9b3e36]"
                              : availableStock <= 3
                                ? "text-[#94713d]"
                                : "text-[#658064]"
                          }`}
                        >
                          {availableStock <= 0
                            ? "Out of stock"
                            : `${availableStock} available`}
                        </p>
                      )}
<div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
                        <div className="inline-flex items-center overflow-hidden rounded-full border border-[#e5dcd3]">
                          <button
                            type="button"
                            onClick={() =>
                              handleQtyChange(
                                item,
                                Number(item.qty) - 1
                              )
                            }
                            disabled={
                              Number(item.qty) <= 1 ||
                              isUpdating
                            }
                            aria-label="Decrease quantity"
                            className="flex h-9 w-10 items-center justify-center text-lg text-[#594438] transition hover:bg-[#f5efe9] disabled:cursor-not-allowed disabled:opacity-35"
                          >
                            −
                          </button>

                          <span className="flex h-9 min-w-10 items-center justify-center border-x border-[#e5dcd3] px-2 text-sm font-medium text-[#382d27]">
                            {item.qty}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              handleQtyChange(
                                item,
                                Number(item.qty) + 1
                              )
                            }
                            disabled={
                              isUpdating ||
                              availableStock === 0 ||
                              isAtStockLimit
                            }
                            aria-label="Increase quantity"
                            className="flex h-9 w-10 items-center justify-center text-lg text-[#594438] transition hover:bg-[#f5efe9] disabled:cursor-not-allowed disabled:opacity-35"
                          >
                            +
                          </button>
                        </div>

                        <p className="text-sm font-semibold text-[#382d27]">
                          ₹
                          {(
                            Number(item.price) *
                            Number(item.qty)
                          ).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
<aside className="rounded-2xl border border-[#e9e1d9] bg-white p-6 lg:sticky lg:top-24">
            <h2 className="text-lg font-semibold text-[#382d27]">
              Order Summary
            </h2>

            <div className="mt-6 space-y-4">
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-[#8b7b70]">
                  Subtotal
                </span>

                <span className="font-medium text-[#382d27]">
                  ₹{Number(totalPrice || 0).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-between gap-4 text-sm">
                <span className="text-[#8b7b70]">
                  Delivery
                </span>

                <span className="font-medium text-[#658064]">
                  Calculated at checkout
                </span>
              </div>

              <div className="border-t border-[#e9e1d9] pt-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-semibold text-[#382d27]">
                    Subtotal
                  </span>

                  <span className="text-xl font-semibold text-[#382d27]">
                    ₹{Number(totalPrice || 0).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                localStorage.removeItem("buyNowItem");
                navigate("/checkout");
              }}
              className="mt-7 w-full rounded-full bg-[#594438] px-6 py-3.5 text-sm font-medium text-white transition hover:bg-[#443329]"
            >
              Proceed to Checkout
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="mt-3 w-full rounded-full border border-[#e5dcd3] px-6 py-3 text-sm font-medium text-[#796253] transition hover:bg-[#f8f4ef]"
            >
              Clear Cart
            </button>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="mt-4 w-full text-center text-xs text-[#8b7b70] underline underline-offset-4 transition hover:text-[#49372c]"
            >
              Continue Shopping
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default Cart;
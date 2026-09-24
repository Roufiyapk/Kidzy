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
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    items,
    totalPrice,
  } = useSelector(
    (state) => state.cart
  );

  const [stockInfo, setStockInfo] =
    useState({});

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  // LOAD CART FROM DATABASE

  useEffect(() => {
    const loadCart = async () => {
      if (!user?.id) return;

      try {
        const response = await api.get(
          `/cart?userId=${user.id}`
        );

        dispatch(
          setCart(response.data)
        );
      } catch (error) {
        console.error(
          "Load cart error:",
          error
        );
      }
    };

    loadCart();
  }, [dispatch, user?.id]);

  // LOAD CURRENT STOCK

  useEffect(() => {
    const loadStock = async () => {
      if (
        !items ||
        items.length === 0
      ) {
        setStockInfo({});
        return;
      }

      const stockMap = {};

      for (const item of items) {
        try {
          const productId =
            item.productId ?? item.id;

          const response =
            await api.get(
              `/products/${productId}`
            );

          const product =
            response.data;

          // SIZE BASED PRODUCT

          if (
            Array.isArray(
              product.sizes
            ) &&
            product.sizes.length > 0
          ) {
            const sizeData =
              product.sizes.find(
                (sizeObj) =>
                  String(
                    sizeObj.size
                  ) ===
                  String(
                    item.selectedSize
                  )
              );

            stockMap[
              `${item.id}_${item.selectedSize || ""}`
            ] = Number(
              sizeData?.stock ?? 0
            );
          }

          // NORMAL PRODUCT

          else {
            stockMap[
              `${item.id}_`
            ] = Number(
              product.stock ?? 0
            );
          }

        } catch (error) {
          console.error(
            "Stock fetch error:",
            error
          );

          stockMap[
            `${item.id}_${item.selectedSize || ""}`
          ] = 0;
        }
      }

      setStockInfo(stockMap);
    };

    loadStock();
  }, [items]);

  // GET STOCK FOR CURRENT ITEM

  const getStockKey = (item) => {
    return `${item.id}_${
      item.selectedSize || ""
    }`;
  };

  // REMOVE ITEM

  const handleRemove = async (
    item
  ) => {
    try {
      // Delete from database
      await api.delete(
        `/cart/${item.id}`
      );

      // Delete from Redux
      dispatch(
        removeFromCart({
          id: item.id,
          selectedSize:
            item.selectedSize,
        })
      );

      toast.success(
        "Removed from cart"
      );

    } catch (error) {
      console.error(
        "Remove cart error:",
        error
      );

      toast.error(
        "Failed to remove"
      );
    }
  };

  // UPDATE QUANTITY

  const handleQtyChange = async (
    item,
    newQty
  ) => {
    if (newQty <= 0) {
      return;
    }

    try {
      const productId =
        item.productId ?? item.id;

      // Get latest product
      const response =
        await api.get(
          `/products/${productId}`
        );

      const product =
        response.data;

      let availableStock = 0;

      // SIZE BASED PRODUCT

      if (
        Array.isArray(
          product.sizes
        ) &&
        product.sizes.length > 0
      ) {
        const sizeData =
          product.sizes.find(
            (sizeObj) =>
              String(
                sizeObj.size
              ) ===
              String(
                item.selectedSize
              )
          );

        availableStock =
          Number(
            sizeData?.stock ?? 0
          );
      }

      // NORMAL PRODUCT

      else {
        availableStock =
          Number(
            product.stock ?? 0
          );
      }

      // CHECK STOCK

      if (availableStock <= 0) {
        toast.error(
          item.selectedSize
            ? "This size is out of stock"
            : "This product is out of stock"
        );

        return;
      }

      if (
        newQty >
        availableStock
      ) {
        toast.error(
          `Only ${availableStock} available`
        );

        return;
      }

      // UPDATE DATABASE

      await api.patch(
        `/cart/${item.id}`,
        {
          qty: newQty,
        }
      );

      // UPDATE REDUX

      dispatch(
        updateQty({
          id: item.id,
          selectedSize:
            item.selectedSize,
          qty: newQty,
        })
      );

      // UPDATE STOCK

      setStockInfo(
        (previous) => ({
          ...previous,

          [getStockKey(item)]:
            availableStock,
        })
      );

    } catch (error) {
      console.error(
        "Update cart error:",
        error
      );

      toast.error(
        "Failed to update"
      );
    }
  };

  // CLEAR CART

  const handleClear = async () => {
    if (!user?.id) {
      toast.error(
        "Please login first"
      );

      navigate("/login");

      return;
    }

    try {
      const response =
        await api.get(
          `/cart?userId=${user.id}`
        );

      const cartItems =
        response.data;

      await Promise.all(
        cartItems.map(
          (cartItem) =>
            api.delete(
              `/cart/${cartItem.id}`
            )
        )
      );

      dispatch(clearCart());

      setStockInfo({});

      toast.success(
        "Cart cleared"
      );

    } catch (error) {
      console.error(
        "Clear cart error:",
        error
      );

      toast.error(
        "Failed"
      );
    }
  };

  // EMPTY CART

  if (items.length === 0) {
    return (
      <div className="min-h-screen px-4 py-8 bg-[#f7f3ee]">

        <h1 className="text-2xl font-bold text-center mb-8">
          Cart
        </h1>

        <div className="text-center text-gray-500 mt-20">
          Cart is empty
        </div>

      </div>
    );
  }

  // RETURN

  return (
    <div className="min-h-screen px-4 py-8 bg-white">

      {/* TITLE */}

      <h1 className="text-2xl font-bold text-center mb-8">
        Cart
      </h1>

      {/* CART ITEMS */}

      <div className="max-w-3xl mx-auto space-y-4">

        {items.map((item) => {

          const stockKey =
            getStockKey(item);

          const availableStock =
            stockInfo[stockKey];

          const hasSize =
            Boolean(
              item.selectedSize
            );

          return (
            <div
              key={`${item.id}_${item.selectedSize || ""}`}
              className="border rounded-xl p-4 flex gap-4 items-center bg-white"
            >

              {/* IMAGE */}

              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 object-cover rounded"
              />

              {/* DETAILS */}

              <div className="flex-1">

                {/* PRODUCT NAME */}

                <h2 className="font-medium">
                  {item.name}
                </h2>

                {/* PRICE */}

                <p className="text-sm text-gray-500">
                  ₹{item.price}
                </p>

                {/* SELECTED SIZE */}

                {hasSize && (
                  <p className="text-sm text-gray-400 mt-1">
                    Size:{" "}
                    {item.selectedSize}
                  </p>
                )}

                {/* STOCK */}

                {availableStock !==
                  undefined && (
                  <p
                    className={`text-sm mt-1 ${
                      availableStock <=
                      0
                        ? "text-red-500"
                        : availableStock <=
                          3
                        ? "text-orange-500"
                        : "text-green-600"
                    }`}
                  >
                    {availableStock <=
                    0
                      ? "Out of Stock"
                      : `Stock: ${availableStock}`}
                  </p>
                )}

                {/* QUANTITY */}

                <div className="flex items-center gap-3 mt-3">

                  {/* MINUS */}

                  <button
                    type="button"
                    onClick={() =>
                      handleQtyChange(
                        item,
                        Number(
                          item.qty
                        ) - 1
                      )
                    }
                    disabled={
                      Number(
                        item.qty
                      ) <= 1
                    }
                    className="px-3 py-1 border rounded disabled:opacity-40"
                  >
                    -
                  </button>

                  {/* QUANTITY */}

                  <span className="font-medium">
                    {item.qty}
                  </span>

                  {/* PLUS */}

                  <button
                    type="button"
                    onClick={() =>
                      handleQtyChange(
                        item,
                        Number(
                          item.qty
                        ) + 1
                      )
                    }
                    disabled={
                      availableStock !==
                        undefined &&
                      Number(
                        item.qty
                      ) >=
                        Number(
                          availableStock
                        )
                    }
                    className="px-3 py-1 border rounded disabled:opacity-40"
                  >
                    +
                  </button>

                </div>

              </div>

              {/* REMOVE */}

              <button
                type="button"
                onClick={() =>
                  handleRemove(item)
                }
                className="text-red-500 text-sm"
              >
                Remove
              </button>

            </div>
          );
        })}

      </div>

      {/* TOTAL */}

      <div className="max-w-3xl mx-auto mt-8 flex justify-between items-center border-t pt-5">

        <h2 className="font-bold text-xl">
          Total: ₹{totalPrice}
        </h2>

        <div className="flex gap-4">

          {/* CLEAR */}

          <button
            type="button"
            onClick={
              handleClear
            }
            className="px-4 py-2 border rounded"
          >
            Clear
          </button>

          {/* CHECKOUT */}

          <button
            type="button"
            onClick={() => {
              // Remove any old Buy Now item
              localStorage.removeItem(
                "buyNowItem"
              );

              // Go to checkout
              navigate("/checkout");
            }}
            className="bg-black text-white px-5 py-2 rounded"
          >
            Checkout
          </button>

        </div>

      </div>

    </div>
  );
}

export default Cart;
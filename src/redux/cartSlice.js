import { createSlice } from "@reduxjs/toolkit";

// CALCULATE TOTAL

const calculateTotal = (items) => {
  return items.reduce(
    (total, item) =>
      total +
      Number(item.price || 0) *
        Number(item.qty || 0),
    0
  );
};

// INITIAL STATE

const initialState = {
  items: [],
  totalPrice: 0,
};

// CART SLICE

const cartSlice = createSlice({
  name: "cart",

  initialState,

  reducers: {
    // SET CART

    setCart: (state, action) => {
      state.items = action.payload || [];

      state.totalPrice =
        calculateTotal(state.items);
    },

    // ADD TO CART

    addToCart: (state, action) => {
      const item = action.payload;

      const productId =
        item.productId ?? item.id;

      const selectedSize =
        item.selectedSize || "";

      const existingItem =
        state.items.find((cartItem) => {
          const existingProductId =
            cartItem.productId ??
            cartItem.id;

          const existingSize =
            cartItem.selectedSize || "";

          return (
            String(existingProductId) ===
              String(productId) &&
            String(existingSize) ===
              String(selectedSize)
          );
        });

      if (existingItem) {
        existingItem.qty =
          Number(existingItem.qty || 0) +
          Number(item.qty || 1);
      } else {
        state.items.push({
          ...item,
          productId: productId,
          selectedSize:
            item.selectedSize || null,
          qty: Number(item.qty || 1),
        });
      }

      state.totalPrice =
        calculateTotal(state.items);
    },

    // REMOVE FROM CART

    removeFromCart: (state, action) => {
      const {
        id,
        selectedSize,
      } = action.payload;

      state.items = state.items.filter(
        (item) =>
          !(
            String(item.id) ===
              String(id) &&
            String(
              item.selectedSize || ""
            ) ===
              String(
                selectedSize || ""
              )
          )
      );

      state.totalPrice =
        calculateTotal(state.items);
    },

    // UPDATE QUANTITY

    updateQty: (state, action) => {
      const {
        id,
        qty,
        selectedSize,
      } = action.payload;

      const item =
        state.items.find(
          (cartItem) =>
            String(cartItem.id) ===
              String(id) &&
            String(
              cartItem.selectedSize || ""
            ) ===
              String(
                selectedSize || ""
              )
        );

      if (!item) return;

      item.qty = Number(qty);

      if (item.qty <= 0) {
        state.items =
          state.items.filter(
            (cartItem) =>
              cartItem !== item
          );
      }

      state.totalPrice =
        calculateTotal(state.items);
    },

    // CLEAR CART

    clearCart: (state) => {
      state.items = [];
      state.totalPrice = 0;
    },
  },
});

// EXPORT ACTIONS

export const {
  setCart,
  addToCart,
  removeFromCart,
  updateQty,
  clearCart,
} = cartSlice.actions;

// EXPORT REDUCER

export default cartSlice.reducer;
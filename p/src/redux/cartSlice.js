import { createSlice } from "@reduxjs/toolkit";

const calculateTotal = (items) => {

  return items.reduce(

    (acc, item) =>
      acc + item.price * item.qty,

    0
  );
};

const initialState = {

  items: [],

  totalPrice: 0,
};

const cartSlice = createSlice({

  name: "cart",

  initialState,

  reducers: {

    // SET CART FROM DB

    setCart: (
      state,
      action
    ) => {

      state.items =
        action.payload;

      state.totalPrice =
        calculateTotal(
          state.items
        );
    },

    // ADD

    addToCart: (
      state,
      action
    ) => {

      const item =
        action.payload;

      const existing =
        state.items.find(
          (i) =>
            i.id === item.id
        );

      if (existing) {

        existing.qty += 1;

      } else {

        state.items.push(item);
      }

      state.totalPrice =
        calculateTotal(
          state.items
        );
    },

    // REMOVE

    removeFromCart: (
      state,
      action
    ) => {

      state.items =
        state.items.filter(
          (item) =>
            item.id !==
            action.payload
        );

      state.totalPrice =
        calculateTotal(
          state.items
        );
    },

    // UPDATE QTY

    updateQty: (
      state,
      action
    ) => {

      const { id, qty } =
        action.payload;

      const item =
        state.items.find(
          (i) =>
            i.id === id
        );

      if (!item) return;

      item.qty = qty;

      state.totalPrice =
        calculateTotal(
          state.items
        );
    },

    // CLEAR

    clearCart: (
      state
    ) => {

      state.items = [];

      state.totalPrice = 0;
    },
  },
});

export const {

  setCart,

  addToCart,

  removeFromCart,

  updateQty,

  clearCart,

} = cartSlice.actions;

export default cartSlice.reducer;
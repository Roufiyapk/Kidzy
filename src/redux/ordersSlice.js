import { createSlice } from "@reduxjs/toolkit";

const ordersSlice = createSlice({
  name: "orders",
  initialState: {
    list: [],
  },
  reducers: {
    addOrder: (state, action) => {
      state.list.unshift(action.payload);
    },

    setOrders: (state, action) => {
      state.list = action.payload;
    },

    clearOrders: (state) => {
      state.list = [];
    },
  },
});

export const {
  addOrder,
  setOrders,
  clearOrders,
} = ordersSlice.actions;

export default ordersSlice.reducer;
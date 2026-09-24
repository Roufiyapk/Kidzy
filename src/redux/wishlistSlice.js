import { createSlice } from "@reduxjs/toolkit";

// LOAD WISHLIST FROM LOCAL STORAGE

const loadWishlistFromStorage = () => {
  try {
    const user =
      JSON.parse(localStorage.getItem("user")) || null;

    const key = user
      ? `wishlist_${user.id}`
      : "wishlist_guest";

    const stored = localStorage.getItem(key);

    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.error(
      "Error loading wishlist:",
      err
    );

    return [];
  }
};

// SAVE WISHLIST TO LOCAL STORAGE

const saveWishlistToStorage = (items) => {
  try {
    const user =
      JSON.parse(localStorage.getItem("user")) || null;

    const key = user
      ? `wishlist_${user.id}`
      : "wishlist_guest";

    localStorage.setItem(
      key,
      JSON.stringify(items)
    );
  } catch (err) {
    console.error(
      "Error saving wishlist:",
      err
    );
  }
};

// WISHLIST SLICE

const wishlistSlice = createSlice({
  name: "wishlist",

  initialState: {
    items: loadWishlistFromStorage(),
  },

  reducers: {
    // SET WISHLIST

    setWishlist: (state, action) => {
      state.items = action.payload;

      saveWishlistToStorage(
        state.items
      );
    },

    // ADD TO WISHLIST

    addToWishlist: (state, action) => {
      const product = action.payload;

      const productId =
        product.productId ?? product.id;

      // Check duplicate product
      const exists = state.items.some(
        (item) => {
          const existingProductId =
            item.productId ?? item.id;

          return (
            String(existingProductId) ===
            String(productId)
          );
        }
      );

      // If already exists, do nothing
      if (exists) {
        return;
      }

      // Add product
      state.items.push({
        ...product,
        productId,
      });

      saveWishlistToStorage(
        state.items
      );
    },

    // REMOVE FROM WISHLIST

    removeFromWishlist: (
      state,
      action
    ) => {
      state.items =
        state.items.filter(
          (item) =>
            String(item.id) !==
              String(action.payload) &&
            String(
              item.productId ?? item.id
            ) !==
              String(action.payload)
        );

      saveWishlistToStorage(
        state.items
      );
    },

    // CLEAR WISHLIST

    clearWishlist: (state) => {
      const user = JSON.parse(
        localStorage.getItem("user")
      );

      if (user) {
        localStorage.removeItem(
          `wishlist_${user.id}`
        );
      } else {
        localStorage.removeItem(
          "wishlist_guest"
        );
      }

      state.items = [];
    },
  },
});

// EXPORT ACTIONS

export const {
  setWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
} = wishlistSlice.actions;

// EXPORT REDUCER

export default wishlistSlice.reducer;
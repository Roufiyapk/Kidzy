import { createSlice } from "@reduxjs/toolkit";

// LOAD WISHLIST

const loadWishlistFromStorage = () => {

  try {

    const user = JSON.parse(
      localStorage.getItem("user")
    ) || null;

    const key = user
      ? `wishlist_${user.id}`
      : "wishlist_guest";

    const stored =
      localStorage.getItem(key);

    return stored
      ? JSON.parse(stored)
      : [];

  } catch (err) {

    console.error(
      "Error loading wishlist:",
      err
    );

    return [];
  }
};

// SAVE WISHLIST

const saveWishlistToStorage = (
  items
) => {

  try {

    const user = JSON.parse(
      localStorage.getItem("user")
    ) || null;

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

const wishlistSlice = createSlice({

  name: "wishlist",

  initialState: {

    items: loadWishlistFromStorage(),
  },

  reducers: {

    // SET WISHLIST

    setWishlist: (
      state,
      action
    ) => {

      state.items =
        action.payload;

      saveWishlistToStorage(
        state.items
      );
    },

    // ADD

    addToWishlist: (
      state,
      action
    ) => {

      const exists =
        state.items.find(
          (i) =>
            String(i.id) ===
            String(
              action.payload.id
            )
        );

      if (!exists) {

        state.items.push(
          action.payload
        );

        saveWishlistToStorage(
          state.items
        );
      }
    },

    // REMOVE

    removeFromWishlist: (
      state,
      action
    ) => {

      state.items =
        state.items.filter(
          (i) =>

            String(i.id) !==
              String(
                action.payload
              ) &&

            String(
              i.productId ??
                i.id
            ) !==
              String(
                action.payload
              )
        );

      saveWishlistToStorage(
        state.items
      );
    },

    // CLEAR

    clearWishlist: (state) => {

      const user =
        JSON.parse(
          localStorage.getItem(
            "user"
          )
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

export const {

  setWishlist,

  addToWishlist,

  removeFromWishlist,

  clearWishlist,

} = wishlistSlice.actions;

export default wishlistSlice.reducer;
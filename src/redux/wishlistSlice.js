import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import api from "../api/api";

const getResponseData = (response) => {
  return (
    response?.data?.data ??
    response?.data?.Data ??
    response?.data ??
    null
  );
};

const getProductId = (item) => {
  if (!item) {
    return null;
  }

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

const normalizeWishlistItem = (item) => {
  if (!item) {
    return null;
  }

  const product = 
    item?.product ??
    item?.Product ??
    null;

  return {
    id:
      item?.id ??
      item?.Id ??
      null,

    productId:
      item?.productId ??
      item?.ProductId ??
      product?.id ??
      product?.Id ??
      null,

    productName:
      item?.productName ??
      item?.ProductName ??
      item?.name ??
      item?.Name ??
      product?.name ??
      product?.Name ??
      "",

    name:
      item?.productName ??
      item?.ProductName ??
      item?.name ??
      item?.Name ??
      product?.name ??
      product?.Name ??
      "",

    price: Number(
      item?.price ??
      item?.Price ??
      product?.price ??
      product?.Price ??
      0
    ),

    imageUrl:
      item?.imageUrl ??
      item?.ImageUrl ??
      item?.image ??
      item?.Image ??
      product?.imageUrl ??
      product?.ImageUrl ??
      product?.image ??
      product?.Image ??
      "",

    image:
      item?.imageUrl ??
      item?.ImageUrl ??
      item?.image ??
      item?.Image ??
      product?.imageUrl ??
      product?.ImageUrl ??
      product?.image ??
      product?.Image ??
      "",

    bestSeller:
      item?.bestSeller ??
      item?.BestSeller ??
      product?.bestSeller ??
      product?.BestSeller ??
      false,

    newArrival:
      item?.newArrival ??
      item?.NewArrival ??
      product?.newArrival ??
      product?.NewArrival ??
      false,
  };
};

const extractWishlistItems = (payload) => {
  const data = getResponseData(
    payload
  );

  if (Array.isArray(data)) {
    return data;
  }

  if (
    Array.isArray(data?.items)
  ) {
    return data.items;
  }

  if (
    Array.isArray(data?.Items)
  ) {
    return data.Items;
  }

  if (
    Array.isArray(payload?.items)
  ) {
    return payload.items;
  }

  if (
    Array.isArray(payload?.Items)
  ) {
    return payload.Items;
  }

  return [];
};

export const fetchWishlist =
  createAsyncThunk(
    "wishlist/fetchWishlist",
    async (_, { rejectWithValue }) => {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        if (!token) {
          return [];
        }

        const response =
          await api.get(
            "/wishlist"
          );

        const items =
          extractWishlistItems(
            response
          );

        return items
          .map(
            normalizeWishlistItem
          )
          .filter(Boolean);
      } catch (error) {
        console.error(
          "Fetch wishlist error:",
          error
        );

        if (
          error?.response
            ?.status === 401
        ) {
          localStorage.removeItem(
            "token"
          );
        }

        return rejectWithValue(
          error?.response?.data
            ?.message ||
            error?.response?.data
              ?.Message ||
            "Failed to retrieve wishlist."
        );
      }
    }
  );

export const addToWishlist =
  createAsyncThunk(
    "wishlist/addToWishlist",
    async (
      product,
      { rejectWithValue }
    ) => {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        if (!token) {
          return rejectWithValue(
            "Please login first."
          );
        }

        const productId =
          getProductId(
            product
          );

        if (!productId) {
          return rejectWithValue(
            "Product ID is required."
          );
        }

        const response =
          await api.post(
            "/wishlist",
            {
              productId: Number(
                productId
              ),
            }
          );

        const data =
          getResponseData(
            response
          );

        const item =
          normalizeWishlistItem(
            data
          );

        if (!item) {
          return rejectWithValue(
            "Invalid wishlist response."
          );
        }

        return item;
      } catch (error) {
        console.error(
          "Add wishlist error:",
          error
        );

        if (
          error?.response
            ?.status === 401
        ) {
          return rejectWithValue(
            "Please login first."
          );
        }

        return rejectWithValue(
          error?.response?.data
            ?.message ||
            error?.response?.data
              ?.Message ||
            "Failed to add product to wishlist."
        );
      }
    }
  );

export const removeFromWishlist =
  createAsyncThunk(
    "wishlist/removeFromWishlist",
    async (
      productId,
      { rejectWithValue }
    ) => {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        if (!token) {
          return rejectWithValue(
            "Please login first."
          );
        }

        if (!productId) {
          return rejectWithValue(
            "Product ID is required."
          );
        }

        await api.delete(
          `/wishlist/${Number(
            productId
          )}`
        );

        return Number(
          productId
        );
      } catch (error) {
        console.error(
          "Remove wishlist error:",
          error
        );

        if (
          error?.response
            ?.status === 401
        ) {
          return rejectWithValue(
            "Please login first."
          );
        }

        return rejectWithValue(
          error?.response?.data
            ?.message ||
            error?.response?.data
              ?.Message ||
            "Failed to remove product from wishlist."
        );
      }
    }
  );

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const wishlistSlice =
  createSlice({
    name: "wishlist",

    initialState,

    reducers: {
      clearWishlist: (
        state
      ) => {
        state.items = [];
        state.error = null;
      },

      setWishlist: (
        state,
        action
      ) => {
        const items =
          Array.isArray(
            action.payload
          )
            ? action.payload
            : extractWishlistItems(
                action.payload
              );

        state.items = items
          .map(
            normalizeWishlistItem
          )
          .filter(Boolean);

        state.error = null;
      },
    },

    extraReducers: (
      builder
    ) => {
      builder

        .addCase(
          fetchWishlist.pending,
          (state) => {
            state.loading = true;
            state.error = null;
          }
        )

        .addCase(
          fetchWishlist.fulfilled,
          (
            state,
            action
          ) => {
            state.loading = false;

            state.items =
              Array.isArray(
                action.payload
              )
                ? action.payload
                : [];

            state.error = null;
          }
        )

        .addCase(
          fetchWishlist.rejected,
          (
            state,
            action
          ) => {
            state.loading = false;

            state.error =
              action.payload ||
              "Failed to retrieve wishlist.";
          }
        )

        .addCase(
          addToWishlist.pending,
          (state) => {
            state.loading = true;
            state.error = null;
          }
        )

        .addCase(
          addToWishlist.fulfilled,
          (
            state,
            action
          ) => {
            state.loading = false;

            const newItem =
              normalizeWishlistItem(
                action.payload
              );

            if (!newItem) {
              return;
            }

            const newProductId =
              getProductId(
                newItem
              );

            const exists =
              state.items.some(
                (item) =>
                  String(
                    getProductId(
                      item
                    )
                  ) ===
                  String(
                    newProductId
                  )
              );

            if (!exists) {
              state.items.push(
                newItem
              );
            }

            state.error = null;
          }
        )

        .addCase(
          addToWishlist.rejected,
          (
            state,
            action
          ) => {
            state.loading = false;

            state.error =
              action.payload ||
              "Failed to add product to wishlist.";
          }
        )

        .addCase(
          removeFromWishlist.pending,
          (state) => {
            state.loading = true;
            state.error = null;
          }
        )

        .addCase(
          removeFromWishlist.fulfilled,
          (
            state,
            action
          ) => {
            state.loading = false;

            const productId =
              action.payload;

            state.items =
              state.items.filter(
                (item) =>
                  String(
                    getProductId(
                      item
                    )
                  ) !==
                  String(
                    productId
                  )
              );

            state.error = null;
          }
        )

        .addCase(
          removeFromWishlist.rejected,
          (
            state,
            action
          ) => {
            state.loading = false;

            state.error =
              action.payload ||
              "Failed to remove product from wishlist.";
          }
        );
    },
  });

export const {
  setWishlist,
  clearWishlist,
} =
  wishlistSlice.actions;

export default wishlistSlice.reducer;
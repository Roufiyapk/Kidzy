import { createSlice } from "@reduxjs/toolkit";

const calculateTotal = (items) => {
  return items.reduce(
    (total, item) =>
      total +
      Number(item?.price ?? 0) *
        Number(item?.qty ?? item?.quantity ?? 0),
    0
  );
};

const getValue = (object, ...keys) => {
  if (!object) {
    return null;
  }

  for (const key of keys) {
    if (
      object[key] !== undefined &&
      object[key] !== null
    ) {
      return object[key];
    }
  }

  return null;
};

const mapCartItem = (item) => {
  if (!item) {
    return null;
  }

  const product =
    item.product ??
    item.Product ??
    null;

  const productVariant =
    item.productVariant ??
    item.ProductVariant ??
    null;

  const cartItemId = getValue(
    item,
    "id",
    "Id"
  );

  const productId =
    getValue(
      item,
      "productId",
      "ProductId"
    ) ??
    getValue(
      product,
      "id",
      "Id"
    );

  const productVariantId =
    getValue(
      item,
      "productVariantId",
      "ProductVariantId"
    ) ??
    getValue(
      productVariant,
      "id",
      "Id"
    ) ??
    null;

  const productName =
    getValue(
      item,
      "productName",
      "ProductName",
      "name",
      "Name"
    ) ??
    getValue(
      product,
      "name",
      "Name"
    ) ??
    "";

  const price = Number(
    getValue(
      item,
      "price",
      "Price"
    ) ??
      getValue(
        product,
        "price",
        "Price"
      ) ??
      0
  );

  const imageUrl =
    getValue(
      item,
      "imageUrl",
      "ImageUrl",
      "image",
      "Image"
    ) ??
    getValue(
      product,
      "imageUrl",
      "ImageUrl",
      "image",
      "Image"
    ) ??
    "";

  const ageGroup =
    getValue(
      item,
      "ageGroup",
      "AgeGroup"
    ) ??
    getValue(
      productVariant,
      "ageGroup",
      "AgeGroup"
    ) ??
    "";

  const size =
    getValue(
      item,
      "size",
      "Size",
      "selectedSize"
    ) ??
    getValue(
      productVariant,
      "size",
      "Size"
    ) ??
    null;

  const quantity = Number(
    getValue(
      item,
      "quantity",
      "Quantity",
      "qty"
    ) ?? 1
  );

  return {
    id: cartItemId,

    productId:
      productId == null
        ? null
        : Number(productId),

    productVariantId:
      productVariantId == null
        ? null
        : Number(productVariantId),

    name: productName,

    price,

    image: imageUrl,

    imageUrl,

    ageGroup,

    selectedAge: ageGroup || null,

    selectedSize: size,

    size,

    qty:
      quantity > 0
        ? quantity
        : 1,

    quantity:
      quantity > 0
        ? quantity
        : 1,
  };
};

const normalizeCartResponse = (
  payload
) => {
  if (!payload) {
    return [];
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload.items)) {
    return payload.items;
  }

  if (Array.isArray(payload.Items)) {
    return payload.Items;
  }

  if (
    payload.data &&
    Array.isArray(payload.data)
  ) {
    return payload.data;
  }

  if (
    payload.data &&
    Array.isArray(payload.data.items)
  ) {
    return payload.data.items;
  }

  if (
    payload.data &&
    Array.isArray(payload.data.Items)
  ) {
    return payload.data.Items;
  }

  if (
    payload.Data &&
    Array.isArray(payload.Data)
  ) {
    return payload.Data;
  }

  if (
    payload.Data &&
    Array.isArray(payload.Data.items)
  ) {
    return payload.Data.items;
  }

  if (
    payload.Data &&
    Array.isArray(payload.Data.Items)
  ) {
    return payload.Data.Items;
  }

  return [];
};

const findSameCartItem = (
  items,
  newItem
) => {
  return items.find(
    (cartItem) => {
      const sameProduct =
        String(
          cartItem?.productId ?? ""
        ) ===
        String(
          newItem?.productId ?? ""
        );

      const existingVariant =
        cartItem?.productVariantId;

      const newVariant =
        newItem?.productVariantId;

      if (
        newVariant == null &&
        existingVariant == null
      ) {
        return sameProduct;
      }

      return (
        sameProduct &&
        String(
          existingVariant ?? ""
        ) ===
          String(
            newVariant ?? ""
          )
      );
    }
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
    setCart: (
      state,
      action
    ) => {
      const backendItems =
        normalizeCartResponse(
          action.payload
        );

      state.items =
        backendItems
          .map(mapCartItem)
          .filter(Boolean);

      state.totalPrice =
        calculateTotal(
          state.items
        );
    },

    addToCart: (
      state,
      action
    ) => {
      const item =
        mapCartItem(
          action.payload
        );

      if (!item) {
        return;
      }

      const existingItem =
        findSameCartItem(
          state.items,
          item
        );

      if (existingItem) {
        existingItem.qty =
          Number(
            existingItem.qty ?? 0
          ) +
          Number(
            item.qty ?? 1
          );

        existingItem.quantity =
          existingItem.qty;
      } else {
        state.items.push(
          item
        );
      }

      state.totalPrice =
        calculateTotal(
          state.items
        );
    },

    removeFromCart: (
      state,
      action
    ) => {
      const {
        id,
        productVariantId,
      } =
        action.payload || {};

      state.items =
        state.items.filter(
          (item) => {
            const sameCartItem =
              String(
                item?.id ?? ""
              ) ===
              String(
                id ?? ""
              );

            if (
              !sameCartItem
            ) {
              return true;
            }

            if (
              productVariantId ==
              null
            ) {
              return false;
            }

            return (
              String(
                item?.productVariantId ??
                  ""
              ) !==
              String(
                productVariantId
              )
            );
          }
        );

      state.totalPrice =
        calculateTotal(
          state.items
        );
    },

    updateQty: (
      state,
      action
    ) => {
      const {
        id,
        qty,
        productVariantId,
      } =
        action.payload || {};

      const item =
        state.items.find(
          (cartItem) => {
            const sameId =
              String(
                cartItem?.id ?? ""
              ) ===
              String(
                id ?? ""
              );

            if (!sameId) {
              return false;
            }

            if (
              productVariantId ==
              null
            ) {
              return true;
            }

            return (
              String(
                cartItem?.productVariantId ??
                  ""
              ) ===
              String(
                productVariantId
              )
            );
          }
        );

      if (!item) {
        return;
      }

      const newQuantity =
        Number(qty);

      if (
        newQuantity <= 0
      ) {
        state.items =
          state.items.filter(
            (cartItem) =>
              cartItem !== item
          );
      } else {
        item.qty =
          newQuantity;

        item.quantity =
          newQuantity;
      }

      state.totalPrice =
        calculateTotal(
          state.items
        );
    },

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
} =
  cartSlice.actions;

export default cartSlice.reducer;
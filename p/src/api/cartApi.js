const BASE_URL =
  "http://localhost:3001/cart";

// FETCH CART

export const fetchCartItems =
  async (userId) => {

    const res = await fetch(
      `${BASE_URL}?userId=${userId}`
    );

    if (!res.ok) {
      throw new Error(
        "Failed to fetch cart"
      );
    }

    return res.json();
  };

// REMOVE ITEM

export const removeCartItem =
  async (id) => {

    const res = await fetch(
      `${BASE_URL}/${id}`,
      {
        method: "DELETE",
      }
    );

    if (!res.ok) {
      throw new Error(
        "Failed to remove"
      );
    }
  };

// UPDATE QTY

export const updateCartItem =
  async (id, qty) => {

    const res = await fetch(
      `${BASE_URL}/${id}`,
      {
        method: "PATCH",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          qty,
        }),
      }
    );

    if (!res.ok) {

      throw new Error(
        "Failed to update"
      );
    }

    return res.json();
  };

// CLEAR CART

export const clearCartItems =
  async (userId) => {

    const items =
      await fetchCartItems(userId);

    await Promise.all(

      items.map((item) =>
        fetch(
          `${BASE_URL}/${item.id}`,
          {
            method: "DELETE",
          }
        )
      )
    );
  };

const BASE_URL =
  "http://localhost:3001/orders";


// FETCH ALL ORDERS

export const fetchOrders =
  async () => {

    const res = await fetch(BASE_URL);

    if (!res.ok) {
      throw new Error(
        "Failed to fetch orders"
      );
    }

    return res.json();
  };


// DELETE ORDER

export const deleteOrder =
  async (id) => {

    const res = await fetch(
      `${BASE_URL}/${id}`,
      {
        method: "DELETE",
      }
    );

    if (!res.ok) {
      throw new Error(
        "Failed to delete order"
      );
    }

    return true;
  };


// UPDATE ORDER STATUS

export const updateOrderStatus =
  async (id, status) => {

    const res = await fetch(
      `${BASE_URL}/${id}`,
      {
        method: "PATCH",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          status,
        }),
      }
    );

    if (!res.ok) {
      throw new Error(
        "Failed to update status"
      );
    }

    return res.json();
  };
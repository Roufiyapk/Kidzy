const BASE_URL = "http://localhost:3001/orders";

export const fetchOrders = async () => {
  const res = await fetch(BASE_URL);
  return res.json();
};

export const addOrder = async (order) => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(order),
  });

  return res.json();
};
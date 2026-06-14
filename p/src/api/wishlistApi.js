const BASE_URL = "http://localhost:3001/wishlist";

export const fetchWishlist = async (userId) => {
  const res = await fetch(BASE_URL);
  const data = await res.json();
  return data.filter(item => item.userId === userId);
};

export const addWishlistItem = async (item) => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...item,
      productId: item.productId ?? item.id,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to add item to wishlist");
  }

  return res.json();
};

export const removeWishlistItem = async (id, userId) => {
  const wishlistItems = await fetchWishlist(userId);
  const wishlistItem = wishlistItems.find(
    (item) => String(item.productId) === String(id) || String(item.id) === String(id)
  );

  if (!wishlistItem) {
    throw new Error("Wishlist item not found");
  }

  const res = await fetch(`${BASE_URL}/${wishlistItem.id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to remove wishlist item");
  }

  return res.json();
};
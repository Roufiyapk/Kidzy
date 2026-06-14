const BASE_URL = "http://localhost:3001/products";



export const fetchProducts = async () => {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error("Fetch failed");
  return res.json();
};

// ADD
export const addProductApi = async (product) => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...product, deleted: false }),
  });

  if (!res.ok) throw new Error("Add failed");
  return res.json();
};

// UPDATE
export const updateProductApi = async (id, data) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Update failed");
  return res.json();
};

// SOFT DELETE 
export const softDeleteProductApi = async (id) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ deleted: true }),
  });

  if (!res.ok) throw new Error("Delete failed");
  return res.json();
};

// RESTORE
export const restoreProductApi = async (id) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ deleted: false }),
  });

  if (!res.ok) throw new Error("Restore failed");
  return res.json();
};




import React, { useEffect, useState } from "react";
import axios from "axios";

function UserTask() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:3001/users");
        setProducts(res.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchProducts();
  }, []);

  // ✅ correct filtering (derived data)
  const filteredUsers = products.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <input
        type="text"
        value={search}
        placeholder="search"
        onChange={(e) => setSearch(e.target.value)}
      />

      <ul>
        {filteredUsers.map((u) => (
          <li key={u.id}>{u.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default UserTask;
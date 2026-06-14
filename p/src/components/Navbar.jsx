import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { fetchOrders } from "../api/ordersApi";
import {
  useSelector,
  useDispatch,
} from "react-redux";
import { setCart } from "../redux/cartSlice";

import {
  FaHeart,
  FaShoppingCart,
  FaSearch,
  FaUser,
  FaBoxOpen,
} from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";

function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null);
  const [openAuth, setOpenAuth] = useState(false);
  const [activeSection, setActiveSection] = useState("menu");

  const [userOrders, setUserOrders] = useState([]);

  // REDUX
  const wishlistItems = useSelector(
    (state) => state.wishlist.items || []
  );

  const cartItems = useSelector(
    (state) => state.cart.items || []
  );

  const fetchProducts = async () => {
    const res = await fetch("http://localhost:3001/products");

    if (!res.ok) {
      throw new Error("Failed to fetch products");
    }

    return res.json();
  };

  const {
    data: products = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));

    if (!userData) return;

    fetchOrders()
      .then((data) => {
        const filtered = data.filter(
          (order) => order.userId === userData.id
        );

        setUserOrders(filtered);
      })
      .catch((err) =>
        console.error("Error loading user orders:", err)
      );
  }, []);
  useEffect(() => {

    const userData = JSON.parse(
      localStorage.getItem("user")
    );

    if (!userData) return;

    fetch(
      `http://localhost:3001/cart?userId=${userData.id}`
    )
      .then((res) => res.json())

      .then((data) => {

        dispatch(setCart(data));

      })

      .catch((err) =>
        console.error(
          "Cart load error:",
          err
        )
      );

  }, [dispatch]);




  const suggestions = products.filter((item) => {
    const text = search.toLowerCase();

    return (
      item.name.toLowerCase().includes(text) ||
      item.category.toLowerCase().includes(text) ||
      item.description?.toLowerCase().includes(text)
    );
  });

  const handleSearch = (e) => {
    if (e.key === "Enter" && search.trim()) {
      navigate(`/search/${search}`);
      setSearch("");
    }
  };





  useEffect(() => {
    const loadUser = () => {
      const savedUser = localStorage.getItem("user");

      setUser(savedUser ? JSON.parse(savedUser) : null);
    };

    loadUser();
    window.addEventListener("userUpdated", loadUser);


    return () =>
      window.removeEventListener("userUpdated", loadUser);
  }, []);



  const handleLogout = () => {

    // REMOVE USER
    localStorage.removeItem("user");

    // CLEAR USER CART STORAGE
    Object.keys(localStorage).forEach((key) => {

      if (
        key.startsWith("wishlist_") ||
        key.startsWith("cart_")
      ) {
        localStorage.removeItem(key);
      }

    });

    // UPDATE UI
    window.dispatchEvent(
      new Event("userUpdated")
    );

    setUser(null);

    setOpenAuth(false);

    setActiveSection("menu");

    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="text-center py-10">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-500">
        Error loading products
      </div>
    );
  }

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-30 bg-[#f7f3ee] border-b border-gray-300 shadow-sm">
        <div className="px-6 md:px-14 py-2">

          <div className="flex items-center justify-between gap-4">

            <div
              onClick={() => navigate("/")}
              className="cursor-pointer flex flex-col"
            >
              <h1 className="text-2xl md:text-3xl font-black tracking-[6px] text-black leading-none">
                KIDZY
              </h1>

              <span className="text-[9px] tracking-[3px] text-gray-500 mt-0 uppercase">
                Kids Fashion
              </span>
            </div>

            <div className="relative w-full max-w-[360px] hidden sm:block lg:block">
              <div className="flex items-center bg-white border border-[#e5ddd4] rounded-full px-4 py-2 shadow-sm">

                <FaSearch className="text-gray-400 mr-2 text-xs" />

                <input
                  type="text"
                  placeholder="Search trendy outfits..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleSearch}
                  className="bg-transparent outline-none w-full text-sm"
                />
              </div>

              {search && suggestions.length > 0 && (
                <div className="absolute top-[60px] left-0 w-full bg-white rounded-2xl shadow-xl overflow-hidden z-40 border border-[#ece4db]">

                  {suggestions.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        navigate(`/search/${item.name}`);
                        setSearch("");
                      }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-[#f8f4ef] cursor-pointer transition"
                    >
                      <img
                        src={item.image}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover"
                      />

                      <div>
                        <p className="font-semibold text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.category}</p>
                      </div>
                    </div>
                  ))}

                </div>
              )}
            </div>

            <div className="flex items-center gap-3">

              <div
                onClick={() => navigate("/wishlist")}
                className="relative w-9 h-9 rounded-full bg-white border border-[#e5ddd4] flex items-center justify-center cursor-pointer hover:bg-black hover:text-white transition"
              >
                <FaHeart className="text-sm" />

                {user && wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </div>

              <div
                onClick={() => navigate("/cart")}
                className="relative w-9 h-9 rounded-full bg-white border border-[#e5ddd4] flex items-center justify-center cursor-pointer hover:bg-black hover:text-white transition"
              >
                <FaShoppingCart className="text-sm" />

                {user && cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </div>

              <div
                onClick={() => {
                  setOpenAuth(true);
                  setActiveSection("menu");
                }}
                className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center cursor-pointer hover:scale-105 transition"
              >
                <FaUser className="text-sm" />
              </div>

            </div>
          </div>

          <div className="flex items-center justify-center gap-6 pt-2 text-xs font-medium tracking-wide">

            <p
              onClick={() => navigate("/products/Boys")}
              className="cursor-pointer hover:text-gray-500"
            >
              Boys
            </p>

            <p
              onClick={() => navigate("/products/Girls")}
              className="cursor-pointer hover:text-gray-500"
            >
              Girls
            </p>

            <p
              onClick={() => navigate("/products/Baby")}
              className="cursor-pointer hover:text-gray-500"
            >
              Baby
            </p>

            <p
              onClick={() => navigate("/new")}
              className="cursor-pointer hover:text-gray-500"
            >
              New Arrivals
            </p>

          </div>
        </div>
      </nav>

      <div className="h-[90px]"></div>

      {openAuth && (
        <>
          <div
            onClick={() => setOpenAuth(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />

          <div className="fixed top-0 right-0 h-full w-[370px] bg-white z-50 shadow-2xl overflow-y-auto">

            <div className="p-7">

              <button
                onClick={() => setOpenAuth(false)}
                className="text-3xl float-right"
              >
                ×
              </button>

              <div className="text-center mt-10">

                <div className="w-20 h-20 rounded-full bg-black text-white flex items-center justify-center mx-auto">
                  <FaUser className="text-3xl" />
                </div>

                {user ? (
                  <>
                    <p className="font-bold text-lg mt-4">
                      {user.name}
                    </p>

                    <p className="text-sm text-gray-500">
                      {user.email}
                    </p>
                  </>
                ) : (
                  <p className="mt-4 text-gray-500">
                    Guest User
                  </p>
                )}

              </div>

              {activeSection === "menu" && (

                <div className="mt-8 space-y-4">





                  {/* PROFILE BUTTON */}

                  {user && (

                    <div
                      onClick={() => {

                        setOpenAuth(false);

                        navigate("/profile");

                      }}
                      className="
          flex items-center gap-3
          p-4 rounded-xl
          bg-white border
          cursor-pointer
          hover:bg-black
          hover:text-white
          transition
        "
                    >

                      <FaUser />

                      <span className="font-medium">
                        Profile
                      </span>

                    </div>

                  )}

                  {/* ORDERS BUTTON */}

                  {user && (

                    <div
                      onClick={() => {

                        setOpenAuth(false);

                        navigate("/myorders");

                      }}
                      className="
          flex items-center gap-3
          p-4 rounded-xl
          bg-white border
          cursor-pointer
          hover:bg-black
          hover:text-white
          transition
        "
                    >

                      <FaBoxOpen />

                      <span className="font-medium">
                        My Orders
                      </span>

                    </div>

                  )}

                  {/* LOGIN */}

                  {!user ? (

                    <div
                      onClick={() => {

                        setOpenAuth(false);

                        navigate("/login");

                      }}
                      className="
          bg-black text-white
          p-4 rounded-xl
          text-center
          cursor-pointer
          hover:bg-gray-800
          transition
        "
                    >

                      Login

                    </div>

                  ) : (

                    /* LOGOUT */
                    <div
                      onClick={handleLogout}
                      className="
    flex items-center justify-center gap-2
    p-4 rounded-xl
    cursor-pointer
    text-red-500
    border border-red-200
    hover:bg-red-50
    transition
  "
                    >

                      <FiLogOut className="text-lg" />

                      <span className="font-medium">
                        Logout
                      </span>

                    </div>



                  )}

                </div>

              )}

            </div>
          </div>
        </>
      )}
    </>
  );
}

export default Navbar;
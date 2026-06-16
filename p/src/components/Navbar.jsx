import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useSelector, useDispatch } from "react-redux";

import { fetchOrders } from "../api/ordersApi";
import { setCart } from "../redux/cartSlice";

import {
  FaHeart,
  FaShoppingCart,
  FaSearch,
  FaUser,
  FaBoxOpen,
  FaTimes,
  FaBars,
} from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";

const fetchProducts = async () => {
  const res = await fetch("http://localhost:3001/products");
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
};

function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [search, setSearch] = useState("");
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [openAuth, setOpenAuth] = useState(false);
  const [activeSection, setActiveSection] = useState("menu");
  const [userOrders, setUserOrders] = useState([]);

  // MOBILE UI STATES
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // SEARCH UI STATES
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef(null);

  // REDUX STATES
  const wishlistItems = useSelector((state) => state.wishlist?.items || []);
  const cartItems = useSelector((state) => state.cart?.items || []);

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
        setSearch(""); 
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!user?.id) {
      setUserOrders([]);
      return;
    }

    fetchOrders()
      .then((data) => {
        const filtered = data.filter((order) => order.userId === user.id);
        setUserOrders(filtered);
      })
      .catch((err) => console.error("Error loading user orders:", err));

    fetch(`http://localhost:3001/cart?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => dispatch(setCart(data)))
      .catch((err) => console.error("Cart load error:", err));
  }, [user?.id, dispatch]);

  useEffect(() => {
    const loadUser = () => {
      const savedUser = localStorage.getItem("user");
      setUser(savedUser ? JSON.parse(savedUser) : null);
    };

    window.addEventListener("userUpdated", loadUser);
    return () => window.removeEventListener("userUpdated", loadUser);
  }, []);

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
      navigate(`/search/${encodeURIComponent(search.trim())}`);
      setSearch("");
      setIsSearchOpen(false);
      setIsMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("wishlist_") || key.startsWith("cart_")) {
        localStorage.removeItem(key);
      }
    });
    window.dispatchEvent(new Event("userUpdated"));
    setUser(null);
    setOpenAuth(false);
    setActiveSection("menu");
    navigate("/");
  };

  const navLinks = [
    { name: "Boys", path: "/products/Boys" },
    { name: "Girls", path: "/products/Girls" },
    { name: "Baby", path: "/products/Baby" },
    { name: "New Arrivals", path: "/new" },
    { name: "Best Sellers", path: "/bestsellers" },
    { name: "About Us", path: "/about" },
  ];

  const hoverUnderlineClass = "relative cursor-pointer text-stone-800 transition-colors duration-300 after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-[2px] after:bg-amber-500 after:scale-x-0 after:origin-center hover:after:scale-x-100 after:transition-transform after:duration-300 whitespace-nowrap";

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-30 bg-[#f7f3ee] border-b border-gray-300 shadow-sm">
        <div className="px-4 md:px-14 py-2">
          <div className="flex items-center justify-between gap-2 md:gap-4">
            
            <div className="flex md:hidden items-center">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                className="p-2 text-stone-900 text-lg focus:outline-none"
              >
                {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
              </button>
            </div>

            {/* Brand Logo */}
            <div onClick={() => { navigate("/"); setIsMobileMenuOpen(false); }} className="cursor-pointer flex flex-col items-center group select-none">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black italic tracking-wide text-stone-900 leading-none">
                Kid<span className="text-amber-500 font-sans not-italic">z</span>y
              </h1>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center justify-center gap-6 text-xs font-medium tracking-wide">
              {navLinks.map((link) => (
                <p 
                  key={link.name} 
                  onClick={() => navigate(link.path)} 
                  className={hoverUnderlineClass}
                >
                  {link.name}
                </p>
              ))}
            </div>

            <div className="flex items-center gap-1.5 sm:gap-3 relative">
              
              <div ref={searchRef} className={`absolute right-10 sm:right-12 top-1/2 -translate-y-1/2 z-40 transition-all duration-300 origin-right ${isSearchOpen ? "w-[180px] xs:w-[240px] sm:w-[320px] opacity-100 scale-x-100" : "w-0 opacity-0 scale-x-0 pointer-events-none"}`}>
                <div className="flex items-center bg-white border border-[#e5ddd4] rounded-full px-3 py-1 sm:py-1.5 shadow-md">
                  <FaSearch className="text-gray-400 mr-2 text-xs flex-shrink-0" />
                  <input type="text" placeholder="Search outfits..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={handleSearch} className="bg-transparent outline-none w-full text-xs sm:text-sm text-stone-900" autoFocus={isSearchOpen} />
                  {search && <button onClick={() => setSearch("")}><FaTimes className="text-gray-400 text-xs hover:text-black" /></button>}
                </div>

                {search.trim() && suggestions.length > 0 && (
                  <div className="absolute top-[38px] sm:top-[45px] left-0 w-full bg-white rounded-2xl shadow-2xl overflow-hidden z-50 border border-[#ece4db] max-h-[250px] overflow-y-auto">
                    {suggestions.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          navigate(`/search/${encodeURIComponent(item.name)}`);
                          setSearch("");
                          setIsSearchOpen(false);
                        }}
                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-[#f8f4ef] cursor-pointer transition border-b border-stone-100 last:border-b-0"
                      >
                        {item.image && (
                          <img
                            src={item.image}
                            alt=""
                            className="w-9 h-9 rounded-lg object-cover flex-shrink-0 bg-stone-50"
                          />
                        )}
                        <div className="text-left overflow-hidden">
                          <p className="font-semibold text-xs sm:text-sm text-stone-900 truncate">{item.name}</p>
                          <p className="text-[10px] sm:text-xs text-amber-600 font-medium">{item.category}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div onClick={() => setIsSearchOpen(!isSearchOpen)} className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-[#e5ddd4] flex items-center justify-center cursor-pointer transition-all ${isSearchOpen ? "bg-amber-500 text-white border-amber-500" : "bg-white hover:bg-black hover:text-white"}`}><FaSearch className="text-xs sm:text-sm" /></div>
              
              <div onClick={() => navigate("/wishlist")} className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border border-[#e5ddd4] flex items-center justify-center cursor-pointer hover:bg-black hover:text-white transition">
                <FaHeart className="text-xs sm:text-sm" />
                {wishlistItems.length > 0 && <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center">{wishlistItems.length}</span>}
              </div>
              
              <div onClick={() => navigate("/cart")} className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border border-[#e5ddd4] flex items-center justify-center cursor-pointer hover:bg-black hover:text-white transition">
                <FaShoppingCart className="text-xs sm:text-sm" />
                {cartItems.length > 0 && <span className="absolute -top-1 -right-1 bg-black text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center">{cartItems.length}</span>}
              </div>
              
              <div onClick={() => { setOpenAuth(true); setActiveSection("menu"); }} className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black text-white flex items-center justify-center cursor-pointer hover:scale-105 transition"><FaUser className="text-xs sm:text-sm" /></div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#f7f3ee] border-t border-gray-200 px-6 py-4 flex flex-col items-start space-y-4 shadow-inner animate-fadeIn">
            {navLinks.map((link) => (
              <p 
                key={link.name} 
                onClick={() => { navigate(link.path); setIsMobileMenuOpen(false); }} 
                className={`${hoverUnderlineClass} text-sm font-medium`}
              >
                {link.name}
              </p>
            ))}
          </div>
        )}
      </nav>
      <div className="h-[60px] sm:h-[70px]"></div>

      {/* Auth Sidebar Drawer */}
      {openAuth && (
        <>
          <div onClick={() => setOpenAuth(false)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
          <div className="fixed top-0 right-0 h-full w-full max-w-[370px] bg-white z-50 shadow-2xl overflow-y-auto transition-transform">
            <div className="p-6 sm:p-7">
              <button onClick={() => setOpenAuth(false)} className="text-3xl float-right">×</button>
              <div className="text-center mt-10">
                <div className="w-20 h-20 rounded-full bg-black text-white flex items-center justify-center mx-auto">
                  <FaUser className="text-3xl" />
                </div>
                {user ? (
                  <>
                    <p className="font-bold text-lg mt-4">{user.name}</p>
                    <p className="text-sm text-gray-500 break-all">{user.email}</p>
                  </>
                ) : (
                  <p className="mt-4 text-gray-500">Guest User</p>
                )}
              </div>
              {activeSection === "menu" && (
                <div className="mt-8 space-y-4">
                  {user && (
                    <>
                      <div onClick={() => { setOpenAuth(false); navigate("/profile"); }} className="flex items-center gap-3 p-4 rounded-xl bg-white border cursor-pointer hover:bg-black hover:text-white transition">
                        <FaUser /><span className="font-medium">Profile</span>
                      </div>
                      <div onClick={() => { setOpenAuth(false); navigate("/myorders"); }} className="flex items-center gap-3 p-4 rounded-xl bg-white border cursor-pointer hover:bg-black hover:text-white transition">
                        <FaBoxOpen /><span className="font-medium">My Orders ({userOrders.length})</span>
                      </div>
                    </>
                  )}
                  {!user ? (
                    <div onClick={() => { setOpenAuth(false); navigate("/login"); }} className="bg-black text-white p-4 rounded-xl text-center cursor-pointer hover:bg-gray-800 transition">
                      <div className="font-medium">Login</div>
                    </div>
                  ) : (
                    <div onClick={handleLogout} className="flex items-center justify-center gap-2 p-4 rounded-xl cursor-pointer text-red-500 border border-red-200 hover:bg-red-50 transition">
                      <FiLogOut className="text-lg" /><span className="font-medium">Logout</span>
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
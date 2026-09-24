import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useSelector, useDispatch } from "react-redux";

import api from "../api/api";
import { setCart, clearCart } from "../redux/cartSlice";
import { setWishlist } from "../redux/wishlistSlice";

import {
  FaHeart,
  FaShoppingCart,
  FaSearch,
  FaUser,
  FaBoxOpen,
  FaTimes,
  FaBars,
  FaChevronDown,
} from "react-icons/fa";

import { FiLogOut } from "react-icons/fi";
import { toast } from "react-toastify";
import { categories } from "../data/categories";

const fetchProducts = async () => {
  const res = await api.get("/products");
  return res.data;
};

function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // STATES

  const [search, setSearch] = useState("");

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [openAuth, setOpenAuth] = useState(false);
  const [activeSection, setActiveSection] = useState("menu");
  const [userOrders, setUserOrders] = useState([]);

  const [isMobileMenuOpen, setIsMobileMenuOpen] =
    useState(false);

  const [isSearchOpen, setIsSearchOpen] =
    useState(false);

  const [openCategory, setOpenCategory] =
    useState(null);

  const [dropdownPosition, setDropdownPosition] =
    useState({
      top: 0,
      left: 0,
    });

  const searchRef = useRef(null);
  const categoryRefs = useRef({});
  const dropdownCloseTimer = useRef(null);

  // REDUX

  const wishlistItems = useSelector(
    (state) => state.wishlist?.items || []
  );

  const cartItems = useSelector(
    (state) => state.cart?.items || []
  );

  // PRODUCTS

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5,
  });

  // CLOSE SEARCH OUTSIDE

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // LOAD CART + ORDERS

  useEffect(() => {
    if (!user?.id) {
      setUserOrders([]);
      dispatch(setCart([]));
      return;
    }

    api
      .get("/orders")
      .then((res) => {
        const filteredOrders = res.data.filter(
          (order) =>
            String(order.userId) === String(user.id)
        );

        setUserOrders(filteredOrders);
      })
      .catch((error) => {
        console.error(
          "Error loading orders:",
          error
        );
      });

    api
      .get(`/cart?userId=${user.id}`)
      .then((res) => {
        dispatch(setCart(res.data));
      })
      .catch((error) => {
        console.error(
          "Cart load error:",
          error
        );
      });
  }, [user?.id, dispatch]);

  // USER UPDATE

  useEffect(() => {
    const loadUser = () => {
      const savedUser =
        localStorage.getItem("user");

      setUser(
        savedUser
          ? JSON.parse(savedUser)
          : null
      );
    };

    window.addEventListener(
      "userUpdated",
      loadUser
    );

    return () => {
      window.removeEventListener(
        "userUpdated",
        loadUser
      );
    };
  }, []);

  // NORMALIZE SEARCH

  const normalize = (value) =>
    String(value || "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ");

  // SEARCH SUGGESTIONS
  //
  // MAIN CATEGORY
  // SUB CATEGORY
  // PRODUCT NAME
  // DESCRIPTION
  // GENDER
  // AGE
  //
  // Examples:
  //
  // School Supplies
  // -> all School Supplies products
  //
  // Footwear
  // -> all Footwear products
  //
  // Girls
  // -> all Girls products
  //
  // Girls Dresses
  // -> Girls + Dresses

  const suggestions = products.filter((item) => {
    const searchText = normalize(search);

    if (!searchText) {
      return false;
    }

    const category = normalize(
      item.category
    );

    const subCategory = normalize(
      item.subCategory
    );

    const productName = normalize(
      item.name
    );

    const description = normalize(
      item.description
    );

    const gender = normalize(
      item.gender
    );

    const age = normalize(
      item.age
    );

    // EXACT MAIN CATEGORY

    if (category === searchText) {
      return true;
    }

    // EXACT SUB CATEGORY

    if (subCategory === searchText) {
      return true;
    }

    // MULTI WORD SEARCH

    const searchableText = [
      productName,
      category,
      subCategory,
      description,
      gender,
      age,
    ]
      .filter(Boolean)
      .join(" ");

    const searchWords = searchText
      .split(/\s+/)
      .filter(Boolean);

    return searchWords.every((word) =>
      searchableText.includes(word)
    );
  });

  // SEARCH

  const handleSearch = (e) => {
    if (
      e.key === "Enter" &&
      search.trim()
    ) {
      navigate(
        `/search/${encodeURIComponent(
          search.trim()
        )}`
      );

      setSearch("");
      setIsSearchOpen(false);
      setIsMobileMenuOpen(false);
    }
  };

  // LOGOUT

  const handleLogout = () => {
    localStorage.removeItem("user");

    dispatch(clearCart());
    dispatch(setWishlist([]));

    localStorage.removeItem("wishlist");

    setUserOrders([]);
    setUser(null);

    setOpenAuth(false);
    setActiveSection("menu");

    window.dispatchEvent(
      new Event("userUpdated")
    );

    toast.success(
      "Logged out successfully"
    );

    navigate("/");
  };

  // CATEGORY CLICK

  const handleCategoryClick = (category) => {
    navigate(
      `/products/${encodeURIComponent(
        category
      )}`
    );

    setOpenCategory(null);
    setIsMobileMenuOpen(false);
  };

  // SUB CATEGORY CLICK

  const handleSubCategoryClick = (
    category,
    subCategory
  ) => {
    navigate(
      `/products/${encodeURIComponent(
        category
      )}?subCategory=${encodeURIComponent(
        subCategory
      )}`
    );

    setOpenCategory(null);
    setIsMobileMenuOpen(false);
  };

  // OPEN CATEGORY DROPDOWN

  const handleCategoryMouseEnter = (
    categoryName
  ) => {
    if (dropdownCloseTimer.current) {
      clearTimeout(
        dropdownCloseTimer.current
      );
    }

    const element =
      categoryRefs.current[categoryName];

    if (!element) return;

    const rect =
      element.getBoundingClientRect();

    const dropdownWidth = Math.min(
      580,
      window.innerWidth * 0.9
    );

    const halfWidth =
      dropdownWidth / 2;

    const padding = 12;

    const minLeft =
      halfWidth + padding;

    const maxLeft =
      window.innerWidth -
      halfWidth -
      padding;

    const categoryCenter =
      rect.left +
      rect.width / 2;

    const safeLeft = Math.min(
      Math.max(
        categoryCenter,
        minLeft
      ),
      maxLeft
    );

    setDropdownPosition({
      top: rect.bottom,
      left: safeLeft,
    });

    setOpenCategory(categoryName);
  };

  // CLOSE CATEGORY

  const handleCategoryMouseLeave = () => {
    dropdownCloseTimer.current =
      setTimeout(() => {
        setOpenCategory(null);
      }, 150);
  };

  const handleDropdownMouseEnter = () => {
    if (dropdownCloseTimer.current) {
      clearTimeout(
        dropdownCloseTimer.current
      );
    }
  };

  const handleDropdownMouseLeave = () => {
    dropdownCloseTimer.current =
      setTimeout(() => {
        setOpenCategory(null);
      }, 150);
  };

  // RENDER

  return (
    <>
      {/* NAVBAR */}

      <nav className="fixed top-0 left-0 w-full z-50 bg-white border-b border-[#eadfd5] shadow-sm">

        {/* DECORATIONS */}

        <div className="absolute inset-0 overflow-hidden pointer-events-none">

          <div className="absolute -left-8 top-8 w-20 h-16 bg-[#FFD9A8] rounded-full opacity-60" />

          <div className="absolute left-[16%] -top-5 w-20 h-12 bg-[#F7C8C0] rounded-b-full opacity-70" />

          <div className="absolute right-[-25px] -top-5 w-20 h-20 bg-[#F7C8C0] rounded-full opacity-60" />

          <div className="absolute right-[10%] bottom-[-35px] w-20 h-16 bg-[#9EDCDF] rounded-t-full rotate-[-12deg] opacity-70" />

        </div>

        <div className="relative z-10">

          {/* TOP ROW */}

          <div className="px-4 sm:px-6 md:px-8 lg:px-12">

            <div className="min-h-[72px] md:min-h-[78px] flex items-center gap-3 sm:gap-5 lg:gap-8">

              {/* MOBILE MENU */}

              <button
                onClick={() =>
                  setIsMobileMenuOpen(
                    !isMobileMenuOpen
                  )
                }
                className="md:hidden flex-shrink-0 text-[#212121] text-xl"
              >
                {isMobileMenuOpen ? (
                  <FaTimes />
                ) : (
                  <FaBars />
                )}
              </button>

              {/* LOGO */}

              <div
                onClick={() => {
                  navigate("/");
                  setIsMobileMenuOpen(false);
                }}
                className="cursor-pointer flex-shrink-0"
              >

                <div className="flex items-center leading-none">

                  <h1
                    className="
                      text-[30px]
                      sm:text-[34px]
                      md:text-[36px]
                      lg:text-[40px]
                      font-black
                      tracking-[-1.5px]
                      text-[#212121]
                    "
                  >
                    Kid
                    <span className="text-[#F47B20]">
                      z
                    </span>
                    y
                  </h1>

                </div>

              </div>

              {/* SEARCH */}

              <div
                ref={searchRef}
                className="flex-1 relative min-w-0 max-w-[650px] mx-auto"
              >

                <div className="h-[42px] sm:h-[44px] md:h-[46px] flex items-center bg-white border border-[#eadfd5] rounded-full px-4 sm:px-5">

                  <FaSearch className="text-[#596777] text-sm sm:text-base mr-3 flex-shrink-0" />

                  <input
                    type="text"
                    value={search}
                    placeholder="Search for Dresses, Toys, Footwear..."
                    onChange={(e) => {
                      setSearch(
                        e.target.value
                      );

                      setIsSearchOpen(true);
                    }}
                    onFocus={() =>
                      setIsSearchOpen(true)
                    }
                    onKeyDown={
                      handleSearch
                    }
                    className="w-full bg-transparent outline-none text-[12px] sm:text-[13px] md:text-[14px] text-[#212121] placeholder:text-[#8c8178]"
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearch("");
                        setIsSearchOpen(false);
                      }}
                      className="text-[#8c8178] ml-2"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                  )}

                </div>

                {/* SEARCH SUGGESTIONS */}

                {isSearchOpen &&
                  search.trim() &&
                  suggestions.length > 0 && (

                    <div className="absolute top-[50px] left-0 w-full bg-white rounded-xl shadow-xl border border-[#eadfd5] overflow-hidden max-h-[300px] overflow-y-auto">

                      {suggestions
                        .slice(0, 10)
                        .map((item) => (

                          <div
                            key={item.id}
                            onClick={() => {
                              navigate(
                                `/search/${encodeURIComponent(
                                  search.trim()
                                )}`
                              );

                              setSearch("");
                              setIsSearchOpen(
                                false
                              );
                            }}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-[#FEF5ED] cursor-pointer border-b border-[#f0e7df] last:border-0"
                          >

                            {/* PRODUCT IMAGE */}

                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                              />
                            )}

                            <div className="min-w-0">

                              {/* PRODUCT NAME */}

                              <p className="text-sm font-medium text-[#212121] truncate">
                                {item.name}
                              </p>

                              {/* MAIN CATEGORY */}

                              <p className="text-[10px] text-[#F47B20]">

                                {item.category}

                                {/* SUB CATEGORY */}

                                {item.subCategory &&
                                  ` • ${item.subCategory}`}

                              </p>

                            </div>

                          </div>

                        ))}

                    </div>

                  )}

                {/* NO SUGGESTIONS */}

                {isSearchOpen &&
                  search.trim() &&
                  suggestions.length === 0 && (

                    <div className="absolute top-[50px] left-0 w-full bg-white rounded-xl shadow-xl border border-[#eadfd5] overflow-hidden">

                      <div className="px-4 py-4 text-sm text-[#777] text-center">
                        No products found
                      </div>

                      <button
                        onClick={() => {
                          navigate(
                            `/search/${encodeURIComponent(
                              search.trim()
                            )}`
                          );

                          setSearch("");
                          setIsSearchOpen(
                            false
                          );
                        }}
                        className="
                          w-full
                          border-t
                          border-[#eadfd5]
                          py-3
                          text-xs
                          font-medium
                          text-[#F47B20]
                          hover:bg-[#FEF5ED]
                        "
                      >
                        Search Anyway
                      </button>

                    </div>

                  )}

              </div>

              {/* RIGHT ICONS */}

              <div className="flex items-center gap-3 sm:gap-5 md:gap-6 flex-shrink-0">

                {/* WISHLIST */}

                <div
                  onClick={() =>
                    navigate(
                      "/wishlist"
                    )
                  }
                  className="flex flex-col items-center cursor-pointer text-[#212121] relative"
                >

                  <div className="relative">

                    <FaHeart className="text-[16px] sm:text-[17px] md:text-[18px]" />

                    {wishlistItems.length >
                      0 && (

                      <span className="absolute -top-2 -right-2 bg-[#D93636] text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center">
                        {
                          wishlistItems.length
                        }
                      </span>

                    )}

                  </div>

                  <span className="hidden sm:block text-[9px] md:text-[10px] mt-1">
                    Wishlist
                  </span>

                </div>

                {/* CART */}

                <div
                  onClick={() =>
                    navigate("/cart")
                  }
                  className="flex flex-col items-center cursor-pointer text-[#212121] relative"
                >

                  <div className="relative">

                    <FaShoppingCart className="text-[16px] sm:text-[17px] md:text-[18px]" />

                    {cartItems.length >
                      0 && (

                      <span className="absolute -top-2 -right-2 bg-[#D93636] text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center">
                        {
                          cartItems.length
                        }
                      </span>

                    )}

                  </div>

                  <span className="hidden sm:block text-[9px] md:text-[10px] mt-1">
                    Cart
                  </span>

                </div>

                {/* ACCOUNT */}

                <div
                  onClick={() => {
                    setOpenAuth(true);
                    setActiveSection(
                      "menu"
                    );
                  }}
                  className="flex flex-col items-center cursor-pointer text-[#212121]"
                >

                  <FaUser className="text-[16px] sm:text-[17px] md:text-[18px]" />

                  <span className="hidden sm:block text-[9px] md:text-[10px] mt-1">
                    {user
                      ? "Account"
                      : "Sign In"}
                  </span>

                </div>

              </div>

            </div>

          </div>

          {/* DESKTOP CATEGORY NAVIGATION */}

          <div className="hidden md:block border-t border-[#eadfd5]">

            <div className="px-4 lg:px-10">

              <div
                className="overflow-x-auto overflow-y-hidden"
                onScroll={() =>
                  setOpenCategory(null)
                }
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle:
                    "none",
                }}
              >

                <div
                  className="
                    h-[40px]
                    min-w-full
                    w-max
                    flex
                    items-center
                    justify-center
                    gap-5
                    lg:gap-7
                    px-2
                    whitespace-nowrap
                  "
                >

                  {categories.map(
                    (category) => (

                      <div
                        key={
                          category.name
                        }
                        ref={(element) => {
                          categoryRefs.current[
                            category.name
                          ] = element;
                        }}
                        className="
                          relative
                          h-full
                          flex
                          items-center
                          flex-shrink-0
                        "
                        onMouseEnter={() =>
                          handleCategoryMouseEnter(
                            category.name
                          )
                        }
                        onMouseLeave={
                          handleCategoryMouseLeave
                        }
                      >

                        <div
                          onClick={() =>
                            handleCategoryClick(
                              category.name
                            )
                          }
                          className="
                            flex
                            items-center
                            gap-1
                            text-[11px]
                            lg:text-[12px]
                            font-medium
                            text-[#212121]
                            cursor-pointer
                            whitespace-nowrap
                          "
                        >

                          {category.name}

                          <FaChevronDown className="text-[7px]" />

                        </div>

                      </div>

                    )
                  )}

                  {/* NEW ARRIVALS */}

                  <div
                    onClick={() =>
                      navigate("/new")
                    }
                    className="
                      flex-shrink-0
                      text-[11px]
                      lg:text-[12px]
                      font-medium
                      text-[#212121]
                      cursor-pointer
                      whitespace-nowrap
                    "
                  >
                    New Arrivals
                  </div>

                  {/* BEST SELLERS */}

                  <div
                    onClick={() =>
                      navigate(
                        "/bestsellers"
                      )
                    }
                    className="
                      flex-shrink-0
                      text-[11px]
                      lg:text-[12px]
                      font-medium
                      text-[#212121]
                      cursor-pointer
                      whitespace-nowrap
                    "
                  >
                    Best Sellers
                  </div>

                  {/* ABOUT US */}

                  <div
                    onClick={() =>
                      navigate("/about")
                    }
                    className="
                      flex-shrink-0
                      text-[11px]
                      lg:text-[12px]
                      font-medium
                      text-[#212121]
                      cursor-pointer
                      whitespace-nowrap
                    "
                  >
                    About Us
                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* CATEGORY DROPDOWN */}

          {openCategory && (

            <div
              className="
                hidden md:block
                fixed
                w-[580px]
                max-w-[90vw]
                max-h-[calc(100vh-150px)]
                overflow-y-auto
                bg-white
                rounded-xl
                shadow-2xl
                border
                border-[#eadfd5]
                py-6
                px-7
                z-[9999]
              "
              style={{
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                transform:
                  "translateX(-50%)",
              }}
              onMouseEnter={
                handleDropdownMouseEnter
              }
              onMouseLeave={
                handleDropdownMouseLeave
              }
            >

              {(() => {

                const category =
                  categories.find(
                    (item) =>
                      item.name ===
                      openCategory
                  );

                if (!category) {
                  return null;
                }

                return (

                  <div className="grid grid-cols-1">

                    <div>

                      <h3
                        className="
                          text-[12px]
                          font-semibold
                          uppercase
                          tracking-wide
                          text-[#212121]
                          mb-4
                        "
                      >
                        Shop By Category
                      </h3>

                      <div
                        className="
                          grid
                          grid-cols-2
                          gap-x-7
                          gap-y-2
                        "
                      >

                        {category.subCategories?.map(
                          (
                            subCategory
                          ) => (

                            <div
                              key={
                                subCategory
                              }
                              onClick={() =>
                                handleSubCategoryClick(
                                  category.name,
                                  subCategory
                                )
                              }
                              className="
                                text-[12px]
                                text-[#5d554f]
                                hover:text-[#F47B20]
                                cursor-pointer
                                py-1
                              "
                            >
                              {
                                subCategory
                              }
                            </div>

                          )
                        )}

                        {/* SHOP ALL */}

                        <div
                          onClick={() =>
                            handleCategoryClick(
                              category.name
                            )
                          }
                          className="
                            text-[12px]
                            font-medium
                            text-[#4a443f]
                            hover:text-[#F47B20]
                            cursor-pointer
                            py-1
                          "
                        >
                          Shop All
                        </div>

                      </div>

                    </div>

                  </div>

                );

              })()}

            </div>

          )}

          {/* MOBILE MENU */}

          {isMobileMenuOpen && (

            <div
              className="
                md:hidden
                bg-white
                border-t
                border-[#eadfd5]
                px-5
                py-4
                shadow-lg
                max-h-[75vh]
                overflow-y-auto
              "
            >

              {categories.map(
                (category) => (

                  <div
                    key={
                      category.name
                    }
                    className="
                      border-b
                      border-[#eadfd5]
                      last:border-0
                    "
                  >

                    <div
                      onClick={() =>
                        setOpenCategory(
                          openCategory ===
                            category.name
                            ? null
                            : category.name
                        )
                      }
                      className="
                        flex
                        items-center
                        justify-between
                        py-3
                        text-base
                        font-medium
                        text-[#212121]
                        cursor-pointer
                      "
                    >

                      <span>
                        {
                          category.name
                        }
                      </span>

                      <FaChevronDown
                        className={`text-xs transition-transform ${
                          openCategory ===
                          category.name
                            ? "rotate-180"
                            : ""
                        }`}
                      />

                    </div>

                    {openCategory ===
                      category.name && (

                      <div className="pl-4 pb-3">

                        <p
                          className="
                            text-[10px]
                            uppercase
                            tracking-wide
                            font-semibold
                            text-[#80766e]
                            mb-2
                          "
                        >
                          Shop By Category
                        </p>

                        {category.subCategories?.map(
                          (
                            subCategory
                          ) => (

                            <p
                              key={
                                subCategory
                              }
                              onClick={() =>
                                handleSubCategoryClick(
                                  category.name,
                                  subCategory
                                )
                              }
                              className="
                                text-sm
                                text-[#5d554f]
                                py-1.5
                                cursor-pointer
                                hover:text-[#F47B20]
                              "
                            >
                              {
                                subCategory
                              }
                            </p>

                          )
                        )}

                        {/* SHOP ALL */}

                        <p
                          onClick={() =>
                            handleCategoryClick(
                              category.name
                            )
                          }
                          className="
                            text-sm
                            font-medium
                            text-[#212121]
                            py-2
                            cursor-pointer
                            hover:text-[#F47B20]
                          "
                        >
                          Shop All
                        </p>

                      </div>

                    )}

                  </div>

                )
              )}

              {/* NEW ARRIVALS */}

              <p
                onClick={() => {
                  navigate("/new");
                  setIsMobileMenuOpen(
                    false
                  );
                }}
                className="
                  text-base
                  font-medium
                  text-[#212121]
                  py-3
                  border-b
                  border-[#eadfd5]
                "
              >
                New Arrivals
              </p>

              {/* BEST SELLERS */}

              <p
                onClick={() => {
                  navigate(
                    "/bestsellers"
                  );
                  setIsMobileMenuOpen(
                    false
                  );
                }}
                className="
                  text-base
                  font-medium
                  text-[#212121]
                  py-3
                  border-b
                  border-[#eadfd5]
                "
              >
                Best Sellers
              </p>

              {/* ABOUT */}

              <p
                onClick={() => {
                  navigate("/about");
                  setIsMobileMenuOpen(
                    false
                  );
                }}
                className="
                  text-base
                  font-medium
                  text-[#212121]
                  py-3
                "
              >
                About Us
              </p>

            </div>

          )}

        </div>

      </nav>

      {/* NAVBAR SPACE */}

      <div className="h-[118px] md:h-[118px]" />

      {/* USER DRAWER */}

      {openAuth && (
        <>

          {/* OVERLAY */}

          <div
            onClick={() =>
              setOpenAuth(false)
            }
            className="
              fixed
              inset-0
              bg-black/40
              backdrop-blur-sm
              z-[200]
            "
          />

          {/* DRAWER */}

          <div
            className="
              fixed
              top-0
              right-0
              h-full
              w-full
              max-w-[370px]
              bg-white
              z-[210]
              shadow-2xl
              overflow-y-auto
            "
          >

            <div className="p-6 sm:p-7">

              {/* CLOSE */}

              <button
                type="button"
                onClick={() =>
                  setOpenAuth(false)
                }
                className="
                  text-3xl
                  float-right
                  text-stone-800
                "
              >
                ×
              </button>

              {/* USER INFO */}

              <div className="text-center mt-10">

                <div
                  className="
                    w-20
                    h-20
                    rounded-full
                    bg-black
                    text-white
                    flex
                    items-center
                    justify-center
                    mx-auto
                  "
                >
                  <FaUser className="text-3xl" />
                </div>

                {user ? (
                  <>

                    <p
                      className="
                        font-bold
                        text-lg
                        mt-4
                      "
                    >
                      {user.name}
                    </p>

                    <p
                      className="
                        text-sm
                        text-gray-500
                        break-all
                      "
                    >
                      {user.email}
                    </p>

                  </>
                ) : (

                  <p
                    className="
                      mt-4
                      text-gray-500
                    "
                  >
                    Guest User
                  </p>

                )}

              </div>

              {/* MENU */}

              {activeSection ===
                "menu" && (

                <div
                  className="
                    mt-8
                    space-y-4
                  "
                >

                  {user && (
                    <>

                      {/* PROFILE */}

                      <div
                        onClick={() => {
                          setOpenAuth(
                            false
                          );

                          navigate(
                            "/profile"
                          );
                        }}
                        className="
                          flex
                          items-center
                          gap-3
                          p-4
                          rounded-xl
                          bg-white
                          border
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

                      {/* ORDERS */}

                      <div
                        onClick={() => {
                          setOpenAuth(
                            false
                          );

                          navigate(
                            "/myorders"
                          );
                        }}
                        className="
                          flex
                          items-center
                          gap-3
                          p-4
                          rounded-xl
                          bg-white
                          border
                          cursor-pointer
                          hover:bg-black
                          hover:text-white
                          transition
                        "
                      >

                        <FaBoxOpen />

                        <span className="font-medium">
                          My Orders (
                          {
                            userOrders.length
                          }
                          )
                        </span>

                      </div>

                    </>
                  )}

                  {/* LOGIN */}

                  {!user ? (

                    <div
                      onClick={() => {
                        setOpenAuth(
                          false
                        );

                        navigate(
                          "/login"
                        );
                      }}
                      className="
                        bg-black
                        text-white
                        p-4
                        rounded-xl
                        text-center
                        cursor-pointer
                        hover:bg-gray-800
                        transition
                      "
                    >
                      <span className="font-medium">
                        Login
                      </span>
                    </div>

                  ) : (

                    /* LOGOUT */

                    <div
                      onClick={
                        handleLogout
                      }
                      className="
                        flex
                        items-center
                        justify-center
                        gap-2
                        p-4
                        rounded-xl
                        cursor-pointer
                        text-red-500
                        border
                        border-red-200
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
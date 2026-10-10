import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useSelector, useDispatch } from "react-redux";

import api from "../api/api";
import { setCart, clearCart } from "../redux/cartSlice";
import {
  fetchWishlist,
  clearWishlist,
} from "../redux/wishlistSlice";

import {
  FaHeart,
  FaShoppingBag,
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

const normalizeProducts = (responseData) => {
  const payload = responseData?.data ?? responseData;

  const products = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.items)
    ? payload.items
    : Array.isArray(payload?.Items)
    ? payload.Items
    : Array.isArray(payload?.products)
    ? payload.products
    : Array.isArray(payload?.Products)
    ? payload.Products
    : [];

  return products
    .map((product) => ({
      ...product,
      id: product.id ?? product.Id,
      name: product.name ?? product.Name ?? "",
      category:
        product.categoryName ??
        product.CategoryName ??
        product.category?.name ??
        product.Category?.Name ??
        product.category ??
        product.Category ??
        "",
      subCategory:
        product.subCategoryName ??
        product.SubCategoryName ??
        product.subCategory?.name ??
        product.SubCategory?.Name ??
        product.subCategory ??
        product.SubCategory ??
        "",
      price: Number(product.price ?? product.Price ?? 0),
      stock: Number(product.stock ?? product.Stock ?? 0),
      gender: product.gender ?? product.Gender ?? null,
      age: product.age ?? product.Age ?? null,
      image:
        product.imageUrl ??
        product.ImageUrl ??
        product.image ??
        product.Image ??
        "",
      images: Array.isArray(product.images)
        ? product.images
        : Array.isArray(product.Images)
        ? product.Images
        : [],
      description: product.description ?? product.Description ?? "",
      bestSeller: product.bestSeller ?? product.BestSeller ?? false,
      newArrival: product.newArrival ?? product.NewArrival ?? false,
      deleted: product.deleted ?? product.Deleted ?? false,
      sizes: Array.isArray(product.variants)
        ? product.variants.map((variant) => ({
            id: variant.id ?? variant.Id,
            size:
              variant.size ??
              variant.Size ??
              variant.name ??
              variant.Name ??
              variant.value ??
              variant.Value ??
              "",
            stock: Number(variant.stock ?? variant.Stock ?? 0),
          }))
        : Array.isArray(product.Variants)
        ? product.Variants.map((variant) => ({
            id: variant.id ?? variant.Id,
            size:
              variant.size ??
              variant.Size ??
              variant.name ??
              variant.Name ??
              variant.value ??
              variant.Value ??
              "",
            stock: Number(variant.stock ?? variant.Stock ?? 0),
          }))
        : Array.isArray(product.sizes)
        ? product.sizes
        : Array.isArray(product.Sizes)
        ? product.Sizes
        : [],
    }))
    .filter((product) => product.id != null && !product.deleted);
};

const fetchSearchSuggestions = async ({ queryKey }) => {
  const [, searchText] = queryKey;
  const trimmedQuery = searchText?.trim();

  if (!trimmedQuery) {
    return [];
  }

  const response = await api.get("/products/search", {
    params: { query: trimmedQuery },
  });

  return normalizeProducts(response.data);
};

function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [search, setSearch] = useState("");

  const [user, setUser] = useState(() => {
    const savedUser =
      localStorage.getItem("user");

    return savedUser
      ? JSON.parse(savedUser)
      : null;
  });

  useEffect(() => {
    const updateUser = () => {
      try {
        const savedUser = localStorage.getItem("user");
        const nextUser = savedUser ? JSON.parse(savedUser) : null;

        setUser((currentUser) => {
          const currentValue = currentUser ? JSON.stringify(currentUser) : null;
          const nextValue = nextUser ? JSON.stringify(nextUser) : null;
          return currentValue === nextValue ? currentUser : nextUser;
        });
      } catch (error) {
        console.error("Unable to read saved user:", error);
        setUser(null);
      }
    };

    updateUser();

    window.addEventListener("authChanged", updateUser);
    window.addEventListener("userUpdated", updateUser);
    window.addEventListener("storage", updateUser);
    window.addEventListener("focus", updateUser);
    document.addEventListener("visibilitychange", updateUser);

    const syncInterval = window.setInterval(updateUser, 400);

    return () => {
      window.removeEventListener("authChanged", updateUser);
      window.removeEventListener("userUpdated", updateUser);
      window.removeEventListener("storage", updateUser);
      window.removeEventListener("focus", updateUser);
      document.removeEventListener("visibilitychange", updateUser);
      window.clearInterval(syncInterval);
    };
  }, []);

  const [openAuth, setOpenAuth] =
    useState(false);

  const [activeSection, setActiveSection] =
    useState("menu");

  const [userOrders, setUserOrders] =
    useState([]);

  const [
    isMobileMenuOpen,
    setIsMobileMenuOpen,
  ] = useState(false);

  const [
    isSearchOpen,
    setIsSearchOpen,
  ] = useState(false);

  const [
    openCategory,
    setOpenCategory,
  ] = useState(null);

  const [
    dropdownPosition,
    setDropdownPosition,
  ] = useState({
    top: 0,
    left: 0,
  });

  const categoryRefs = useRef({});

  const dropdownCloseTimer =
    useRef(null);

  const searchRef = useRef(null);

  const {
    data: suggestions = [],
    isFetching: isFetchingSuggestions,
    isError: searchSuggestionsError,
  } = useQuery({
    queryKey: ["searchSuggestions", search.trim()],
    queryFn: fetchSearchSuggestions,
    enabled: isSearchOpen && search.trim().length > 0,
  });

  const cartItems = useSelector(
    (state) =>
      state.cart?.items || []
  );

  const cartItemCount = cartItems.reduce((total, item) => {
    const quantity = Number(
      item?.quantity ??
      item?.Quantity ??
      item?.qty ??
      item?.Qty ??
      1
    );

    return total + (Number.isFinite(quantity) && quantity > 0 ? quantity : 0);
  }, 0);

  const notify = (type, message) => {
    toast[type](message, {
      position: "bottom-center",
      autoClose: 1800,
      hideProgressBar: true,
      closeButton: false,
      icon: false,
      style: {
        background: "#FFF9F3",
        color: "#5A4030",
        border: "1px solid #E7DED5",
        borderRadius: "12px",
        boxShadow: "0 4px 16px rgba(90, 64, 48, 0.12)",
        fontSize: "14px",
        fontWeight: 500,
      },
    });
  };

  const wishlistItems = useSelector(
    (state) =>
      state.wishlist?.items || []
  );

  useEffect(() => {
    const token =
      localStorage.getItem("token");

    if (token) {
      dispatch(fetchWishlist());
    } else {
      dispatch(clearWishlist());
    }
  }, [dispatch]);

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    dispatch(clearCart());
    dispatch(clearWishlist());

    localStorage.removeItem("wishlist");

    setUserOrders([]);
    setUser(null);
    setOpenAuth(false);
    setActiveSection("menu");

    window.dispatchEvent(
      new Event("authChanged")
    );

    window.dispatchEvent(
      new Event("userUpdated")
    );

    window.dispatchEvent(
      new Event("wishlistUpdated")
    );

    notify("success", "Logged out successfully");

    navigate("/");
  };

  const handleCategoryClick = (
    category
  ) => {
    navigate(
      `/products/${encodeURIComponent(
        category
      )}`
    );

    setOpenCategory(null);
    setIsMobileMenuOpen(false);
  };

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

  const ageGroups = [
    "0–2 Years",
    "2–4 Years",
    "4–6 Years",
    "6–8 Years",
    "8–10 Years",
  ];

  const getCategoryItems = (
    category
  ) => {
    const allItems =
      category.subCategories || [];

    const ages =
      allItems.filter((item) =>
        ageGroups.includes(item)
      );

    const normalCategories =
      allItems.filter(
        (item) =>
          !ageGroups.includes(item)
      );

    return {
      ages,
      normalCategories,
    };
  };

  const handleCategoryMouseEnter = (
    categoryName
  ) => {
    if (dropdownCloseTimer.current) {
      clearTimeout(
        dropdownCloseTimer.current
      );
    }

    const element =
      categoryRefs.current[
        categoryName
      ];

    if (!element) return;

    const rect =
      element.getBoundingClientRect();

    const dropdownWidth = Math.min(
      580,
      window.innerWidth * 0.9
    );

    const halfWidth =
      dropdownWidth / 2;

    const safeMargin = 10;

    const left = Math.min(
      Math.max(
        rect.left +
          rect.width / 2,
        halfWidth +
          safeMargin
      ),
      window.innerWidth -
        halfWidth -
        safeMargin
    );

    setDropdownPosition({
      top: rect.bottom,
      left,
    });

    setOpenCategory(
      categoryName
    );
  };

  const handleCategoryMouseLeave =
    () => {
      dropdownCloseTimer.current =
        setTimeout(() => {
          setOpenCategory(null);
        }, 120);
    };

  const handleDropdownMouseEnter =
    () => {
      if (dropdownCloseTimer.current) {
        clearTimeout(
          dropdownCloseTimer.current
        );
      }
    };

  const handleDropdownMouseLeave =
    () => {
      dropdownCloseTimer.current =
        setTimeout(() => {
          setOpenCategory(null);
        }, 120);
    };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 bg-white border-b border-[#e8e3df]">

        <div className="relative z-10">

          <div className="px-4 sm:px-6 md:px-8 lg:px-10">

            <div className="min-h-[68px] md:min-h-[78px] flex items-center gap-3 sm:gap-5 lg:gap-8">

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

              <div
                onClick={() => {
                  navigate("/");
                  setIsMobileMenuOpen(false);
                }}
                className="cursor-pointer flex-shrink-0"
              >
                <div className="flex flex-col leading-none">

                  <h1 className="font-serif text-[34px] sm:text-[38px] md:text-[42px] lg:text-[46px] font-bold tracking-tight text-[#111111] leading-none">
                    Kid
                    <span className="text-[#986747]">
                      z
                    </span>
                    y
                  </h1>

                  <p className="hidden sm:block text-[8px] md:text-[9px] text-[#76665c] tracking-[0.28em] mt-1 uppercase">
                    Little Things
                  </p>

                </div>
              </div>

              <div
                ref={searchRef}
                className="flex-1 relative min-w-0 max-w-[560px] mx-auto"
              >

                <div className="h-[42px] sm:h-[44px] flex items-center bg-[#faf8f6] border border-[#eee3dc] rounded-full px-4 sm:px-5">

                  <FaSearch className="text-[#81766f] text-sm sm:text-base mr-3 flex-shrink-0" />

                  <input
                    type="text"
                    value={search}
                    placeholder="Search products..."
                    onChange={(e) => {
                      setSearch(
                        e.target.value
                      );
                      setIsSearchOpen(true);
                    }}
                    onFocus={() =>
                      setIsSearchOpen(true)
                    }
                    onKeyDown={handleSearch}
                    className="w-full bg-transparent outline-none text-[12px] sm:text-[13px] md:text-[14px] text-[#211b18] placeholder:text-[#8c8178]"
                  />

                  {search && (
                    <button
                      onClick={() =>
                        setSearch("")
                      }
                      className="text-[#8c8178] ml-2"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                  )}

                </div>

                {isSearchOpen && search.trim() && (
                  <div className="absolute top-[50px] left-0 w-full bg-white rounded-xl shadow-xl border border-[#e8e3df] overflow-hidden max-h-[300px] overflow-y-auto z-[100]">
                    {isFetchingSuggestions ? (
                      <p className="px-4 py-4 text-sm text-gray-500">
                        Searching products...
                      </p>
                    ) : searchSuggestionsError ? (
                      <p className="px-4 py-4 text-sm text-red-500">
                        Unable to search products. Please try again.
                      </p>
                    ) : suggestions.length > 0 ? (
                      suggestions.slice(0, 8).map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            navigate(`/search/${encodeURIComponent(item.name)}`);
                            setSearch("");
                            setIsSearchOpen(false);
                          }}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-[#faf8f6] cursor-pointer border-b border-[#f0e7df] last:border-0"
                        >
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                            />
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[#212121] truncate">
                              {item.name}
                            </p>
                            <p className="text-[10px] text-[#F47B20]">
                              {item.category}
                            </p>
                            {item.subCategory && (
                              <p className="text-xs text-gray-500 truncate">
                                {item.subCategory}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="px-4 py-4 text-sm text-gray-500">
                        No matching products found.
                      </p>
                    )}
                  </div>
                )}

              </div>

              <div className="flex items-center justify-end gap-3 sm:gap-4 md:gap-5 flex-shrink-0 text-[#211b18]">
                
                <button
                  type="button"
                  onClick={() => {
                    setOpenAuth(true);
                    setActiveSection("menu");
                  }}
                  className="flex items-center gap-2 cursor-pointer whitespace-nowrap text-[#211b18] hover:text-[#986747] transition-colors"
                  aria-label={user ? "Account" : "Login"}
                >
                  <FaUser className="text-[15px] sm:text-[16px]" />
                  <span className="text-[12px] sm:text-[14px]">{user ? "Account" : "Login"}</span>
                </button>

                <span className="hidden sm:block h-7 w-px bg-[#e8e3df]" />

                <button
                  type="button"
                  onClick={() => navigate("/wishlist")}
                  className="relative flex items-center justify-center px-1 text-[#211b18] hover:text-[#986747] transition-colors"
                  aria-label="Wishlist"
                >
                  <FaHeart className="text-[17px] sm:text-[19px]" />
                  {wishlistItems.length > 0 && (
                    <span className="absolute -top-2 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-[#986747] text-white text-[9px] flex items-center justify-center">
                      {wishlistItems.length}
                    </span>
                  )}
                </button>

                <span className="hidden sm:block h-7 w-px bg-[#e8e3df]" />

                <button
                  type="button"
                  onClick={() => navigate("/cart")}
                  className="relative flex items-center justify-center px-1 text-[#211b18] hover:text-[#986747] transition-colors"
                  aria-label="Shopping bag"
                >
                  <FaShoppingBag className="text-[17px] sm:text-[19px]" />
                  <span className="absolute -top-3 -right-3 min-w-[18px] h-[18px] px-1 rounded-full bg-[#986747] text-white text-[9px] flex items-center justify-center">
                    {cartItemCount}
                  </span>
                </button>
              </div>

            </div>

          </div>

          <div className="hidden md:block border-t border-[#e8e3df] bg-white">

            <div className="px-4 lg:px-10">

              <div
                className="overflow-x-auto overflow-y-hidden"
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >

                <div
                  className="
                    h-[36px]
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

                  <div
                    onClick={() => {
                      navigate("/");
                      setOpenCategory(null);
                      setIsMobileMenuOpen(false);
                    }}
                    className="h-full flex items-center text-[11px] lg:text-[12px] font-medium uppercase text-[#211b18] cursor-pointer whitespace-nowrap flex-shrink-0 hover:text-[#986747] transition-colors"
                  >
                    Home
                  </div>

                  {categories.map(
                    (category) => (
                      <div
                        key={category.name}
                        ref={(el) => {
                          categoryRefs.current[
                            category.name
                          ] = el;
                        }}
                        className="relative h-full flex items-center flex-shrink-0"
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
                          className="flex items-center gap-1 text-[11px] lg:text-[12px] font-medium uppercase tracking-[0.01em] text-[#211b18] cursor-pointer whitespace-nowrap hover:text-[#986747] transition-colors"
                        >
                          {category.name}

                          <FaChevronDown className="text-[7px] text-[#81766f]" />

                        </div>

                      </div>
                    )
                  )}

                  <div
                    onClick={() =>
                      navigate("/new")
                    }
                    className="text-[11px] lg:text-[12px] font-medium uppercase text-[#211b18] cursor-pointer whitespace-nowrap flex-shrink-0 hover:text-[#986747] transition-colors"
                  >
                    New Arrivals
                  </div>

                  <div
                    onClick={() =>
                      navigate("/bestsellers")
                    }
                    className="text-[11px] lg:text-[12px] font-medium uppercase text-[#211b18] cursor-pointer whitespace-nowrap flex-shrink-0 hover:text-[#986747] transition-colors"
                  >
                    Best Sellers
                  </div>

                  <div
                    onClick={() =>
                      navigate("/about")
                    }
                    className="text-[11px] lg:text-[12px] font-medium uppercase text-[#211b18] cursor-pointer whitespace-nowrap flex-shrink-0 hover:text-[#986747] transition-colors"
                  >
                    About Us
                  </div>

                </div>

              </div>

            </div>

          </div>

          {openCategory && (
            <div
              className="hidden md:block fixed w-[580px] max-w-[90vw] bg-white rounded-xl shadow-2xl border border-[#e8e3df] py-6 px-7 z-[9999]"
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

                if (!category)
                  return null;

                const {
                  ages,
                  normalCategories,
                } =
                  getCategoryItems(
                    category
                  );

                const hasAge =
                  ages.length > 0;

                return (
                  <div
                    className={
                      hasAge
                        ? "grid grid-cols-12 gap-8"
                        : "grid grid-cols-1"
                    }
                  >

                    <div
                      className={
                        hasAge
                          ? "col-span-8"
                          : "col-span-12"
                      }
                    >

                      <h3 className="text-[12px] font-semibold uppercase tracking-wide text-[#212121] mb-4">
                        Shop By Category
                      </h3>

                      <div className="grid grid-cols-2 gap-x-7 gap-y-2">

                        {normalCategories.map(
                          (subCategory) => (
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
                              className="text-[12px] text-[#5d554f] hover:text-[#986747] cursor-pointer py-1"
                            >
                              {subCategory}
                            </div>
                          )
                        )}

                        <div
                          onClick={() =>
                            handleCategoryClick(
                              category.name
                            )
                          }
                          className="text-[12px] font-medium text-[#4a443f] hover:text-[#986747] cursor-pointer py-1"
                        >
                          Shop All
                        </div>

                      </div>

                    </div>

                    {hasAge && (
                      <div className="col-span-4">

                        <h3 className="text-[12px] font-semibold uppercase tracking-wide text-[#212121] mb-4">
                          Shop By Age
                        </h3>

                        <div className="flex flex-col gap-2">

                          {ages.map(
                            (age) => (
                              <div
                                key={age}
                                onClick={() =>
                                  handleSubCategoryClick(
                                    category.name,
                                    age
                                  )
                                }
                                className="text-[12px] text-[#5d554f] hover:text-[#986747] cursor-pointer py-1"
                              >
                                {age}
                              </div>
                            )
                          )}

                          <div
                            onClick={() =>
                              handleCategoryClick(
                                category.name
                              )
                            }
                            className="text-[12px] font-medium text-[#4a443f] hover:text-[#986747] cursor-pointer py-1"
                          >
                            Shop All
                          </div>

                        </div>

                      </div>
                    )}

                  </div>
                );
              })()}

            </div>
          )}

          {isMobileMenuOpen && (
            <div className="md:hidden bg-white border-t border-[#e8e3df] px-5 py-4 shadow-lg max-h-[75vh] overflow-y-auto">

              <p
                onClick={() => {
                  navigate("/");
                  setIsMobileMenuOpen(false);
                  setOpenCategory(null);
                }}
                className="text-base font-medium text-[#211b18] py-3 border-b border-[#e8e3df] cursor-pointer"
              >
                Home
              </p>

              {categories.map(
                (category) => {
                  const {
                    ages,
                    normalCategories,
                  } =
                    getCategoryItems(
                      category
                    );

                  return (
                    <div
                      key={
                        category.name
                      }
                      className="border-b border-[#e8e3df] last:border-0"
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
                        className="flex items-center justify-between py-3 text-base font-medium text-[#212121] cursor-pointer"
                      >

                        <span>
                          {category.name}
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

                          <p className="text-[10px] uppercase tracking-wide font-semibold text-[#80766e] mb-2">
                            Shop By Category
                          </p>

                          {normalCategories.map(
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
                                className="text-sm text-[#5d554f] py-1.5 cursor-pointer hover:text-[#986747]"
                              >
                                {subCategory}
                              </p>
                            )
                          )}

                          {ages.length >
                            0 && (
                            <>
                              <p className="text-[10px] uppercase tracking-wide font-semibold text-[#80766e] mt-4 mb-2">
                                Shop By Age
                              </p>

                              {ages.map(
                                (age) => (
                                  <p
                                    key={age}
                                    onClick={() =>
                                      handleSubCategoryClick(
                                        category.name,
                                        age
                                      )
                                    }
                                    className="text-sm text-[#5d554f] py-1.5 cursor-pointer hover:text-[#986747]"
                                  >
                                    {age}
                                  </p>
                                )
                              )}
                            </>
                          )}

                          <p
                            onClick={() =>
                              handleCategoryClick(
                                category.name
                              )
                            }
                            className="text-sm font-medium text-[#212121] py-2 cursor-pointer hover:text-[#986747]"
                          >
                            Shop All
                          </p>

                        </div>
                      )}

                    </div>
                  );
                }
              )}

              <p
                onClick={() => {
                  navigate("/new");

                  setIsMobileMenuOpen(
                    false
                  );
                }}
                className="text-base font-medium text-[#212121] py-3 border-b border-[#e8e3df]"
              >
                New Arrivals
              </p>

              <p
                onClick={() => {
                  navigate("/bestsellers");

                  setIsMobileMenuOpen(
                    false
                  );
                }}
                className="text-base font-medium text-[#212121] py-3 border-b border-[#e8e3df]"
              >
                Best Sellers
              </p>

              <p
                onClick={() => {
                  navigate("/about");

                  setIsMobileMenuOpen(
                    false
                  );
                }}
                className="text-base font-medium text-[#212121] py-3"
              >
                About Us
              </p>

            </div>
          )}

        </div>
      </nav>

      <div className="h-[104px] md:h-[114px]" />

      {openAuth && (
        <>

          <div
            onClick={() =>
              setOpenAuth(false)
            }
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200]"
          />

          <div className="fixed top-0 right-0 h-full w-full max-w-[390px] bg-[#FFF9F3] z-[210] shadow-2xl overflow-y-auto border-l border-[#E7DED5]">

            <div className="p-6 sm:p-7">

              <button
                type="button"
                onClick={() =>
                  setOpenAuth(false)
                }
                className="text-3xl float-right text-[#5A4030] hover:text-[#8A654A] transition-colors"
              >
                ×
              </button>

              <div className="text-center mt-10">

                <div className="w-20 h-20 rounded-full bg-[#5A4030] text-white flex items-center justify-center mx-auto shadow-md ring-4 ring-[#EDE0D3]">

                  <FaUser className="text-3xl" />

                </div>

                {user ? (
                  <>

                    <p className="font-semibold text-lg mt-4 text-[#4A3326]">
                      {user.name}
                    </p>

                    <p className="text-sm text-[#817467] break-all mt-1">
                      {user.email}
                    </p>

                  </>
                ) : (

                  <p className="mt-4 text-[#817467]">
                    Guest User
                  </p>

                )}

              </div>

              {activeSection ===
                "menu" && (
                <div className="mt-8 space-y-3">

                  {user && (
                    <>

                      <div
                        onClick={() => {
                          setOpenAuth(
                            false
                          );

                          navigate(
                            "/profile"
                          );
                        }}
                        className="flex items-center gap-3 p-4 rounded-xl bg-white border border-[#E7DED5] text-[#5A4030] cursor-pointer hover:bg-[#5A4030] hover:text-white hover:border-[#5A4030] transition-all duration-200 shadow-sm"
                      >

                        <FaUser />

                        <span className="font-medium">
                          Profile
                        </span>

                      </div>

                      <div
                        onClick={() => {
                          setOpenAuth(
                            false
                          );

                          navigate(
                            "/myorders"
                          );
                        }}
                        className="flex items-center gap-3 p-4 rounded-xl bg-white border border-[#E7DED5] text-[#5A4030] cursor-pointer hover:bg-[#5A4030] hover:text-white hover:border-[#5A4030] transition-all duration-200 shadow-sm"
                      >

                        <FaBoxOpen />

                        <span className="font-medium">
                          My Orders
                        </span>

                      </div>

                    </>
                  )}

                  {!user ? (

                    <div
                      onClick={() => {
                        setOpenAuth(false);
                        setIsMobileMenuOpen(false);
                        navigate("/login");
                      }}
                      className="bg-[#5A4030] text-white p-4 rounded-xl text-center cursor-pointer hover:bg-[#443329] transition-all duration-200 shadow-md font-medium tracking-wide"
                    >

                      <span className="font-medium">
                        Login
                      </span>

                    </div>

                  ) : (

                    <div
                      onClick={
                        handleLogout
                      }
                      className="flex items-center justify-center gap-2 p-4 rounded-xl cursor-pointer text-[#9B4B42] border border-[#E8C9C3] bg-white hover:bg-[#FBEEEB] transition-all duration-200"
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

import { useEffect, useRef, useState } from "react";
import {
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";

import { setCart } from "../redux/cartSlice";
import {
  addToWishlist,
  removeFromWishlist,
  setWishlist,
} from "../redux/wishlistSlice";

import {
  FaRegHeart,
  FaHeart,
  FaTruck,
  FaInfoCircle,
  FaSlidersH,
  FaTimes,
  FaChevronDown,
} from "react-icons/fa";

import { toast } from "react-toastify";
import { categories } from "../data/categories";
import api from "../api/api";

function ProductPage() {
  const { category } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [searchParams] = useSearchParams();

  const selectedSubCategory =
    searchParams.get("subCategory");

  // STATES

  const [sortOption, setSortOption] =
    useState("default");

  const [showFilters, setShowFilters] =
    useState(false);

  const [openFilter, setOpenFilter] =
    useState("");

  const [selectedSubCategories, setSelectedSubCategories] =
    useState(
      selectedSubCategory
        ? [selectedSubCategory]
        : []
    );

  const [selectedSizes, setSelectedSizes] =
    useState([]);

  const [selectedGenders, setSelectedGenders] =
    useState([]);

  const [selectedPriceRange, setSelectedPriceRange] =
    useState("");

  const [selectedStock, setSelectedStock] =
    useState("");

  // CATEGORY-SPECIFIC FILTERS

  const clothingCategories = [
    "Girls",
    "Boys",
  ];

  const footwearCategory = "Footwear";

  const clothingAgeGroups = [
    "0–2 Years",
    "2–4 Years",
    "4–6 Years",
    "6–8 Years",
    "8–10 Years",
  ];

  // Simplified footwear age groups
  const footwearAgeGroups = [
    "0–2 Years",
    "2–5 Years",
    "5–8 Years",
    "8–10 Years",
  ];

  // Used for URL/query detection before the current category is known
  const allAgeGroups = [
    ...clothingAgeGroups,
    ...footwearAgeGroups,
  ];

  const genderFilterCategories = [
    "Footwear",
    "Kids Accessories",
    "School Supplies",
  ];

  const [selectedAge, setSelectedAge] =
    useState("");

  // SIZE POPUP

  const [showSizePopup, setShowSizePopup] =
    useState(false);

  const [selectedProduct, setSelectedProduct] =
    useState(null);

  const [selectedSize, setSelectedSize] =
    useState(null);

  const addingCartRef = useRef(false);

  // WISHLIST

  const wishlistItems = useSelector(
    (state) =>
      state.wishlist?.items || []
  );

  // CURRENT CATEGORY

  const currentCategory =
    categories.find(
      (item) =>
        item.name.toLowerCase() ===
        String(category || "").toLowerCase()
    );

  const categorySubCategories =
    currentCategory?.subCategories || [];

  // LOAD WISHLIST

  useEffect(() => {
    const loadWishlist = async () => {
      const user = JSON.parse(
        localStorage.getItem("user")
      );

      if (!user) {
        dispatch(setWishlist([]));
        return;
      }

      try {
        const response = await api.get(
          `/wishlist?userId=${user.id}`
        );

        const data = response.data;

        dispatch(
          setWishlist(data)
        );
      } catch (error) {
        console.error(
          "Wishlist error:",
          error
        );
      }
    };

    loadWishlist();
  }, [dispatch]);

  // RESET FILTERS

  useEffect(() => {
    const queryValue =
      selectedSubCategory || "";

    const normalizedCurrentCategory =
      String(category || "").toLowerCase();

    const isAgeQuery = allAgeGroups.includes(
      queryValue
    );

    const isGenderQuery =
      genderFilterCategories.some(
        (item) =>
          item.toLowerCase() ===
          normalizedCurrentCategory
      ) &&
      (queryValue === "Boys" ||
        queryValue === "Girls");

    setSelectedSubCategories(
      queryValue &&
        !isAgeQuery &&
        !isGenderQuery
        ? [queryValue]
        : []
    );

    setSelectedAge(
      isAgeQuery
        ? queryValue
        : ""
    );

    setSelectedGenders(
      isGenderQuery
        ? [queryValue]
        : []
    );

    setSelectedSizes([]);
    setSelectedPriceRange("");
    setSelectedStock("");
    setSortOption("default");
    setOpenFilter("");
  }, [
    category,
    selectedSubCategory,
  ]);

  // LOAD PRODUCTS

  const {
    data: products = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["products"],

    queryFn: async () => {
      const response = await api.get("/products");

      return response.data;
    },

    enabled: Boolean(category),
  });

  // VISIBLE PRODUCTS

  const visibleProducts =
    products.filter(
      (product) =>
        product.deleted !== true &&
        String(product.category || "").toLowerCase() ===
          String(category || "").toLowerCase()
    );

  // HELPERS

  const getSizeValue = (size) => {
    if (
      typeof size === "object" &&
      size !== null
    ) {
      return size.size;
    }

    return size;
  };

  const getSizeStock = (size) => {
    if (
      typeof size === "object" &&
      size !== null
    ) {
      return Number(
        size.stock || 0
      );
    }

    return 1;
  };

  const hasSizes = (product) => {
    return (
      Array.isArray(
        product.sizes
      ) &&
      product.sizes.length > 0
    );
  };

  const getProductStock = (
    product
  ) => {
    if (hasSizes(product)) {
      return product.sizes.reduce(
        (total, size) =>
          total +
          getSizeStock(size),
        0
      );
    }

    return Number(
      product.stock || 0
    );
  };

  // CATEGORY FEATURES

  const normalizedCategory = String(
    category || ""
  ).toLowerCase();

  const isClothingCategory =
    clothingCategories.some(
      (item) =>
        item.toLowerCase() ===
        normalizedCategory
    );

  const isFootwearCategory =
    normalizedCategory ===
    footwearCategory.toLowerCase();

  const categoryHasGender =
    genderFilterCategories.some(
      (item) =>
        item.toLowerCase() ===
        normalizedCategory
    ) &&
    visibleProducts.some(
      (product) =>
        product.gender
    );

  // Clothing keeps the original age groups.
  // Footwear uses fewer age groups to keep the filter simple.
  const ageGroups =
    isFootwearCategory
      ? footwearAgeGroups
      : clothingAgeGroups;

  const showAgeFilter =
    isClothingCategory ||
    isFootwearCategory;

  const showSizeFilter =
    isFootwearCategory;

  // AVAILABLE SIZES

  // Footwear uses EU sizes 16–35.
  const footwearSizes = Array.from(
    { length: 20 },
    (_, index) => String(index + 16)
  );

  const availableSizes = isFootwearCategory
    ? footwearSizes
    : [
        ...new Set(
          visibleProducts.flatMap((product) => {
            if (!Array.isArray(product.sizes)) {
              return [];
            }

            return product.sizes
              .map(getSizeValue)
              .filter(Boolean)
              .map((size) => String(size));
          })
        ),
      ].sort((a, b) => {
        const numA = Number(a);
        const numB = Number(b);

        if (!Number.isNaN(numA) && !Number.isNaN(numB)) {
          return numA - numB;
        }

        return String(a).localeCompare(String(b));
      });

  // AVAILABLE GENDERS


  const availableGenders = [
    ...new Set(
      visibleProducts
        .map(
          (product) =>
            product.gender
        )
        .filter(Boolean)
    ),
  ];

  // PRICE CHECK

  const checkPriceRange = (
    product
  ) => {
    if (!selectedPriceRange) {
      return true;
    }

    const price = Number(
      product.price || 0
    );

    if (
      selectedPriceRange ===
      "under500"
    ) {
      return price < 500;
    }

    if (
      selectedPriceRange ===
      "500to1000"
    ) {
      return (
        price >= 500 &&
        price <= 1000
      );
    }

    if (
      selectedPriceRange ===
      "1000to2000"
    ) {
      return (
        price > 1000 &&
        price <= 2000
      );
    }

    if (
      selectedPriceRange ===
      "above2000"
    ) {
      return price > 2000;
    }

    return true;
  };

  // STOCK CHECK

  const checkStock = (
    product
  ) => {
    if (!selectedStock) {
      return true;
    }

    const stock = getProductStock(product);

    const hasLowStockSize =
      hasSizes(product) &&
      product.sizes.some((size) => {
        const sizeStock = getSizeStock(size);

        return (
          sizeStock > 0 &&
          sizeStock < 5
        );
      });

    if (selectedStock === "inStock") {
      return stock > 0;
    }

    // LOW STOCK = 1, 2, 3, 4

    if (selectedStock === "lowStock") {
      return hasSizes(product)
        ? hasLowStockSize
        : stock > 0 && stock < 5;
    }

    return true;
  };

  // FILTER PRODUCTS

  const filteredProducts =
    visibleProducts
      .filter((product) => {

        // AGE - GIRLS / BOYS / FOOTWEAR
        // A product can belong to one or multiple age groups.

        if (
          (isClothingCategory || isFootwearCategory) &&
          selectedAge
        ) {
          const productAges = Array.isArray(product.age)
            ? product.age
            : [product.age];

          if (!productAges.includes(selectedAge)) {
            return false;
          }
        }

        // SUBCATEGORY

        if (
          selectedSubCategories.length >
          0
        ) {
          if (
            !selectedSubCategories.includes(
              product.subCategory
            )
          ) {
            return false;
          }
        }

        // SIZE - FOOTWEAR

        if (
          isFootwearCategory &&
          selectedSizes.length >
          0
        ) {
          const productSizes =
            Array.isArray(
              product.sizes
            )
              ? product.sizes.map(
                  getSizeValue
                )
              : [];

          const matchingSize =
            selectedSizes.some(
              (size) =>
                productSizes.includes(
                  String(size)
                )
            );

          if (!matchingSize) {
            return false;
          }
        }

        // GENDER

        if (
          selectedGenders.length >
          0
        ) {
          if (
            !selectedGenders.includes(
              product.gender
            )
          ) {
            return false;
          }
        }

        // PRICE

        if (
          !checkPriceRange(
            product
          )
        ) {
          return false;
        }

        // STOCK

        if (
          !checkStock(product)
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {

        if (
          sortOption ===
          "lowToHigh"
        ) {
          return (
            Number(
              a.price || 0
            ) -
            Number(
              b.price || 0
            )
          );
        }

        if (
          sortOption ===
          "highToLow"
        ) {
          return (
            Number(
              b.price || 0
            ) -
            Number(
              a.price || 0
            )
          );
        }

        return 0;
      });

  // =====================================================
  // DROPDOWN
  // =====================================================

  const toggleDropdown = (
    name
  ) => {
    setOpenFilter(
      (previous) =>
        previous === name
          ? ""
          : name
    );
  };

  // SUBCATEGORY

  const toggleSubCategory = (
    value
  ) => {
    setSelectedSubCategories(
      (previous) =>
        previous.includes(value)
          ? previous.filter(
              (item) =>
                item !== value
            )
          : [
              ...previous,
              value,
            ]
    );
  };

  // SIZE

  const toggleSize = (
    value
  ) => {
    setSelectedSizes(
      (previous) =>
        previous.includes(value)
          ? previous.filter(
              (item) =>
                item !== value
            )
          : [
              ...previous,
              value,
            ]
    );
  };

  // GENDER

  const toggleGender = (
    value
  ) => {
    setSelectedGenders(
      (previous) =>
        previous.includes(value)
          ? previous.filter(
              (item) =>
                item !== value
            )
          : [
              ...previous,
              value,
            ]
    );
  };

  // CLEAR FILTERS

  const clearFilters = () => {
    setSelectedSubCategories([]);
    setSelectedAge("");
    setSelectedSizes([]);
    setSelectedGenders([]);
    setSelectedPriceRange("");
    setSelectedStock("");
  };

  // FILTER COUNT

  const activeFilterCount =
    selectedSubCategories.length +
    (selectedAge ? 1 : 0) +
    selectedSizes.length +
    selectedGenders.length +
    (selectedPriceRange
      ? 1
      : 0) +
    (selectedStock
      ? 1
      : 0);

  // WISHLIST

  const handleWishlist = async (
    product
  ) => {
    const user = JSON.parse(
      localStorage.getItem("user")
    );

    if (!user) {
      toast.error(
        "Please login first"
      );

      navigate("/login");
      return;
    }

    const existing =
      wishlistItems.find(
        (item) =>
          String(
            item.productId ??
              item.id
          ) ===
          String(product.id)
      );

    try {
      if (existing) {
        await api.delete(
          `/wishlist/${existing.id}`
        );

        dispatch(
          removeFromWishlist(
            existing.id
          )
        );

        toast.success(
          "Removed from wishlist"
        );

        return;
      }

      const wishlistItem = {
        ...product,
        productId:
          product.id,
        userId:
          user.id,
      };

      const response = await api.post(
        "/wishlist",
        wishlistItem
      );

      const savedItem = response.data;

      dispatch(
        addToWishlist(savedItem)
      );

      toast.success(
        "Added to wishlist"
      );
    } catch (error) {
      console.error(
        "Wishlist error:",
        error
      );

      toast.error(
        "Wishlist update failed"
      );
    }
  };

  // ADD TO CART

  const addProductToCart = async (
    product,
    size,
    user
  ) => {
    if (
      addingCartRef.current
    ) {
      return false;
    }

    addingCartRef.current =
      true;

    try {
      const response = await api.get(
        `/cart?userId=${user.id}`
      );

      const cartItems = response.data;

      const existingItem =
        cartItems.find(
          (item) => {

            const existingProductId =
              String(
                item.productId ??
                  ""
              );

            const existingSize =
              String(
                item.selectedSize ||
                  ""
              );

            const existingUserId =
              String(
                item.userId ??
                  ""
              );

            return (
              existingProductId ===
                String(
                  product.id
                ) &&
              existingSize ===
                String(
                  size || ""
                ) &&
              existingUserId ===
                String(
                  user.id
                )
            );
          }
        );

      if (existingItem) {
        toast.info(
          "Already in cart"
        );

        return false;
      }

      const cartItem = {
        productId:
          product.id,

        userId:
          user.id,

        name:
          product.name,

        price:
          product.price,

        originalPrice:
          product.originalPrice ||
          null,

        image:
          product.image,

        selectedSize:
          size || null,

        qty: 1,
      };

      await api.post(
        "/cart",
        cartItem
      );

      const updatedResponse =
        await api.get(
          `/cart?userId=${user.id}`
        );

      const updatedCart =
        updatedResponse.data;

      dispatch(
        setCart(updatedCart)
      );

      toast.success(
        "Added to cart"
      );

      return true;
    } catch (error) {
      console.error(
        "Cart error:",
        error
      );

      toast.error(
        "Failed to add to cart"
      );

      return false;
    } finally {
      addingCartRef.current =
        false;
    }
  };

  // PLUS BUTTON

  const handlePlusClick = (
    product
  ) => {
    const user = JSON.parse(
      localStorage.getItem("user")
    );

    if (!user) {
      toast.error(
        "Please login first"
      );

      navigate("/login");
      return;
    }

    if (hasSizes(product)) {
      setSelectedProduct(
        product
      );

      setSelectedSize(null);

      setShowSizePopup(true);

      return;
    }

    addProductToCart(
      product,
      null,
      user
    );
  };

  // ADD SELECTED SIZE

  const handleAddSelectedToCart =
    async () => {

      if (!selectedProduct) {
        return;
      }

      if (!selectedSize) {
        toast.error(
          "Please select a size"
        );

        return;
      }

      const user = JSON.parse(
        localStorage.getItem("user")
      );

      if (!user) {
        toast.error(
          "Please login first"
        );

        navigate("/login");
        return;
      }

      const selectedSizeObject =
        selectedProduct.sizes.find(
          (size) =>
            String(
              getSizeValue(size)
            ) ===
            String(
              selectedSize
            )
        );

      if (
        selectedSizeObject &&
        getSizeStock(
          selectedSizeObject
        ) <= 0
      ) {
        toast.error(
          "This size is out of stock"
        );

        return;
      }

      const added =
        await addProductToCart(
          selectedProduct,
          selectedSize,
          user
        );

      if (added) {
        setShowSizePopup(false);
        setSelectedProduct(null);
        setSelectedSize(null);
      }
    };

  // BUY NOW

  const handleBuyNow =
    async () => {

      if (!selectedProduct) {
        return;
      }

      if (!selectedSize) {
        toast.error(
          "Please select a size"
        );

        return;
      }

      const user = JSON.parse(
        localStorage.getItem("user")
      );

      if (!user) {
        toast.error(
          "Please login first"
        );

        navigate("/login");
        return;
      }

      const selectedSizeObject =
        selectedProduct.sizes.find(
          (size) =>
            String(
              getSizeValue(size)
            ) ===
            String(
              selectedSize
            )
        );

      if (
        selectedSizeObject &&
        getSizeStock(
          selectedSizeObject
        ) <= 0
      ) {
        toast.error(
          "This size is out of stock"
        );

        return;
      }

      const added =
        await addProductToCart(
          selectedProduct,
          selectedSize,
          user
        );

      if (added) {
        setShowSizePopup(false);
        setSelectedProduct(null);
        setSelectedSize(null);

        navigate("/cart");
      }
    };

  // CLOSE POPUP

  const closePopup = () => {
    setShowSizePopup(false);
    setSelectedProduct(null);
    setSelectedSize(null);
  };

  // LOADING

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p>
          Loading products...
        </p>
      </div>
    );
  }

  // ERROR

  if (isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">

        <p className="text-red-500 font-semibold">
          Failed to load products
        </p>

        <p className="text-gray-500 mt-2">
          {error?.message}
        </p>

      </div>
    );
  }

  // UI

  return (
    <div className="min-h-screen bg-white">

      <div className="px-4 md:px-8 lg:px-12 py-8">

        {/* PAGE HEADER */}

        <div className="mb-6">

          <h1 className="text-3xl md:text-4xl font-bold capitalize">
            {category}
          </h1>

          {selectedSubCategory && (
            <p className="text-gray-500 mt-1">
              {selectedSubCategory}
            </p>
          )}

        </div>

        {/* FILTER BAR */}

        <div className="flex items-center gap-3 flex-wrap pb-5">

          {/* FILTERS */}

          <button
            type="button"
            onClick={() => {
              setShowFilters(true);
              setOpenFilter("");
            }}
            className="flex items-center gap-2 px-5 py-3 rounded-full border border-gray-300 bg-white hover:border-gray-500 transition font-medium"
          >

            <FaSlidersH />

            Filters

            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}

          </button>

          {/* CATEGORY */}

          <div className="relative">

            <button
              type="button"
              onClick={() =>
                toggleDropdown("Category")
              }
              className={`px-5 py-3 rounded-full border bg-white flex items-center gap-3 transition font-medium ${
                selectedSubCategories.length > 0
                  ? "border-orange-500 text-orange-600"
                  : "border-gray-300 hover:border-gray-500"
              }`}
            >
              Category

              <FaChevronDown className="text-xs" />

            </button>

            {openFilter === "Category" && (

              <div className="absolute left-0 top-[55px] z-[999] w-56 bg-white border border-gray-200 shadow-xl">

                <button
                  type="button"
                  onClick={() => {
                    setSelectedSubCategories([]);
                    setOpenFilter("");
                  }}
                  className={`w-full text-left px-5 py-3 text-sm ${
                    selectedSubCategories.length === 0
                      ? "bg-gray-500 text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  All
                </button>

                {categorySubCategories.map((subCategory) => (
                  <button
                    key={subCategory}
                    type="button"
                    onClick={() => {
                      setSelectedSubCategories([subCategory]);
                      setOpenFilter("");
                    }}
                    className={`w-full text-left px-5 py-3 text-sm ${
                      selectedSubCategories.includes(subCategory)
                        ? "bg-gray-500 text-white"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {subCategory}
                  </button>
                ))}

              </div>

            )}

          </div>

          {/* RELEVANCE */}

          <div className="relative">

            <button
              type="button"
              onClick={() =>
                toggleDropdown(
                  "Relevance"
                )
              }
              className={`px-5 py-3 rounded-full border bg-white flex items-center gap-3 transition font-medium ${
                sortOption !== "default"
                  ? "border-orange-500 text-orange-600"
                  : "border-gray-300 hover:border-gray-500"
              }`}
            >

              {sortOption ===
              "default"
                ? "Relevance"
                : sortOption ===
                  "lowToHigh"
                ? "Lowest Price"
                : "Highest Price"}

              <FaChevronDown className="text-xs" />

            </button>

            {openFilter ===
              "Relevance" && (

              <div className="absolute left-0 top-[55px] z-[999] w-48 bg-white border border-gray-200 shadow-xl">

                <button
                  type="button"
                  onClick={() => {
                    setSortOption(
                      "default"
                    );
                    setOpenFilter(
                      ""
                    );
                  }}
                  className={`w-full text-left px-5 py-3 text-sm ${
                    sortOption ===
                    "default"
                      ? "bg-gray-500 text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  Relevance
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSortOption(
                      "lowToHigh"
                    );
                    setOpenFilter(
                      ""
                    );
                  }}
                  className={`w-full text-left px-5 py-3 text-sm ${
                    sortOption ===
                    "lowToHigh"
                      ? "bg-gray-500 text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  Lowest Price
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSortOption(
                      "highToLow"
                    );
                    setOpenFilter(
                      ""
                    );
                  }}
                  className={`w-full text-left px-5 py-3 text-sm ${
                    sortOption ===
                    "highToLow"
                      ? "bg-gray-500 text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  Highest Price
                </button>

              </div>
            )}

          </div>

          {/* GENDER */}

          {categoryHasGender && (

            <div className="relative">

              <button
                type="button"
                onClick={() =>
                  toggleDropdown(
                    "Gender"
                  )
                }
                className={`px-5 py-3 rounded-full border bg-white flex items-center gap-3 transition font-medium ${
                  selectedGenders.length
                    ? "border-orange-500 text-orange-600"
                    : "border-gray-300 hover:border-gray-500"
                }`}
              >

                {selectedGenders.length ===
                1
                  ? selectedGenders[0]
                  : "Gender"}

                <FaChevronDown className="text-xs" />

              </button>

              {openFilter ===
                "Gender" && (

                <div className="absolute left-0 top-[55px] z-[999] min-w-[170px] bg-white border border-gray-200 shadow-xl">

                  {availableGenders.map(
                    (gender) => (

                      <button
                        key={
                          gender
                        }
                        type="button"
                        onClick={() => {
                          toggleGender(
                            gender
                          );
                          setOpenFilter(
                            ""
                          );
                        }}
                        className={`w-full text-left px-5 py-3 text-sm ${
                          selectedGenders.includes(
                            gender
                          )
                            ? "bg-gray-500 text-white"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        {gender}
                      </button>

                    )
                  )}

                  {selectedGenders.length >
                    0 && (

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedGenders(
                          []
                        );
                        setOpenFilter(
                          ""
                        );
                      }}
                      className="w-full text-left px-5 py-3 text-sm text-orange-600 border-t hover:bg-gray-50"
                    >
                      Clear
                    </button>

                  )}

                </div>

              )}

            </div>

          )}

          {/* AGE / SIZE */}

          {(showAgeFilter || showSizeFilter) && (

            <div className="relative">

              <button
                type="button"
                onClick={() =>
                  toggleDropdown(
                    showAgeFilter ? "Age" : "Size"
                  )
                }
                className={`px-5 py-3 rounded-full border bg-white flex items-center gap-3 transition font-medium ${
                  (showAgeFilter
                    ? selectedAge
                    : selectedSizes.length > 0)
                    ? "border-orange-500 text-orange-600"
                    : "border-gray-300 hover:border-gray-500"
                }`}
              >
                {showAgeFilter
                  ? selectedAge || "Age"
                  : selectedSizes.length === 1
                  ? selectedSizes[0]
                  : "Size"}

                <FaChevronDown className="text-xs" />
              </button>

              {/* AGE DROPDOWN */}

              {showAgeFilter && openFilter === "Age" && (
                <div className="absolute left-0 top-[55px] z-[999] min-w-[180px] bg-white border border-gray-200 shadow-xl">

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAge("");
                      setOpenFilter("");
                    }}
                    className={`w-full text-left px-5 py-3 text-sm ${
                      !selectedAge
                        ? "bg-gray-500 text-white"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    All Ages
                  </button>

                  {ageGroups.map((age) => (
                    <button
                      key={age}
                      type="button"
                      onClick={() => {
                        setSelectedAge(age);
                        setOpenFilter("");
                      }}
                      className={`w-full text-left px-5 py-3 text-sm ${
                        selectedAge === age
                          ? "bg-gray-500 text-white"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {age}
                    </button>
                  ))}

                </div>
              )}

              {/* FOOTWEAR SIZE DROPDOWN */}

              {showSizeFilter && openFilter === "Size" && (
                <div className="absolute left-0 top-[55px] z-[999] min-w-[190px] bg-white border border-gray-200 shadow-xl p-2">

                  {availableSizes.map((size) => (
                    <label
                      key={String(size)}
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSizes.includes(size)}
                        onChange={() => toggleSize(size)}
                        className="w-4 h-4 accent-orange-500"
                      />

                      <span className="text-sm">
                        {size}
                      </span>
                    </label>
                  ))}

                  {selectedSizes.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSizes([]);
                        setOpenFilter("");
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-orange-600 border-t mt-1"
                    >
                      Clear
                    </button>
                  )}

                </div>
              )}

            </div>

          )}

          {/* PRICE RANGE */}

          <div className="relative">

            <button
              type="button"
              onClick={() =>
                toggleDropdown(
                  "Price"
                )
              }
              className={`px-5 py-3 rounded-full border bg-white flex items-center gap-3 transition font-medium ${
                selectedPriceRange
                  ? "border-orange-500 text-orange-600"
                  : "border-gray-300 hover:border-gray-500"
              }`}
            >

              {selectedPriceRange ===
              "under500"
                ? "Under ₹500"
                : selectedPriceRange ===
                  "500to1000"
                ? "₹500–₹1000"
                : selectedPriceRange ===
                  "1000to2000"
                ? "₹1000–₹2000"
                : selectedPriceRange ===
                  "above2000"
                ? "Above ₹2000"
                : "Price Range"}

              <FaChevronDown className="text-xs" />

            </button>

            {openFilter ===
              "Price" && (

              <div className="absolute left-0 top-[55px] z-[999] w-52 bg-white border border-gray-200 shadow-xl">

                <button
                  type="button"
                  onClick={() => {
                    setSelectedPriceRange(
                      "under500"
                    );
                    setOpenFilter(
                      ""
                    );
                  }}
                  className={`w-full text-left px-5 py-3 text-sm ${
                    selectedPriceRange ===
                    "under500"
                      ? "bg-gray-500 text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  Under ₹500
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedPriceRange(
                      "500to1000"
                    );
                    setOpenFilter(
                      ""
                    );
                  }}
                  className={`w-full text-left px-5 py-3 text-sm ${
                    selectedPriceRange ===
                    "500to1000"
                      ? "bg-gray-500 text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  ₹500–₹1000
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedPriceRange(
                      "1000to2000"
                    );
                    setOpenFilter(
                      ""
                    );
                  }}
                  className={`w-full text-left px-5 py-3 text-sm ${
                    selectedPriceRange ===
                    "1000to2000"
                      ? "bg-gray-500 text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  ₹1000–₹2000
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedPriceRange(
                      "above2000"
                    );
                    setOpenFilter(
                      ""
                    );
                  }}
                  className={`w-full text-left px-5 py-3 text-sm ${
                    selectedPriceRange ===
                    "above2000"
                      ? "bg-gray-500 text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  Above ₹2000
                </button>

                {selectedPriceRange && (

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPriceRange(
                        ""
                      );
                      setOpenFilter(
                        ""
                      );
                    }}
                    className="w-full text-left px-5 py-3 text-sm text-orange-600 border-t"
                  >
                    Clear
                  </button>

                )}

              </div>

            )}

          </div>

          {/* AVAILABILITY */}

          <div className="relative">

            <button
              type="button"
              onClick={() =>
                toggleDropdown(
                  "Stock"
                )
              }
              className={`px-5 py-3 rounded-full border bg-white flex items-center gap-3 transition font-medium ${
                selectedStock
                  ? "border-orange-500 text-orange-600"
                  : "border-gray-300 hover:border-gray-500"
              }`}
            >

              {selectedStock ===
              "inStock"
                ? "In Stock"
                : selectedStock ===
                  "lowStock"
                ? "Low Stock"
                : "Availability"}

              <FaChevronDown className="text-xs" />

            </button>

            {openFilter ===
              "Stock" && (

              <div className="absolute left-0 top-[55px] z-[999] w-48 bg-white border border-gray-200 shadow-xl">

                <button
                  type="button"
                  onClick={() => {
                    setSelectedStock(
                      "inStock"
                    );
                    setOpenFilter(
                      ""
                    );
                  }}
                  className={`w-full text-left px-5 py-3 text-sm ${
                    selectedStock ===
                    "inStock"
                      ? "bg-gray-500 text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  In Stock
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedStock(
                      "lowStock"
                    );
                    setOpenFilter(
                      ""
                    );
                  }}
                  className={`w-full text-left px-5 py-3 text-sm ${
                    selectedStock ===
                    "lowStock"
                      ? "bg-gray-500 text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  Low Stock
                </button>

                {selectedStock && (

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStock(
                        ""
                      );
                      setOpenFilter(
                        ""
                      );
                    }}
                    className="w-full text-left px-5 py-3 text-sm text-orange-600 border-t"
                  >
                    Clear
                  </button>

                )}

              </div>

            )}

          </div>

        </div>

        {/* PRODUCT COUNT */}

        <div className="flex items-center justify-between mb-5">

          <p className="text-sm text-gray-500">
            {filteredProducts.length}{" "}
            products
          </p>

          {activeFilterCount >
            0 && (

            <button
              type="button"
              onClick={
                clearFilters
              }
              className="text-sm text-orange-600 font-medium"
            >
              Clear Filters
            </button>

          )}

        </div>

        {/* PRODUCTS */}

        {filteredProducts.length ===
        0 ? (

          <div className="py-20 flex justify-center">

            <p className="text-gray-500">
              No products found.
            </p>

          </div>

        ) : (

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 md:gap-7">

            {filteredProducts.map(
              (item) => {

                const isInWishlist =
                  wishlistItems.some(
                    (wishlistItem) =>
                      String(
                        wishlistItem.productId ??
                          wishlistItem.id
                      ) ===
                      String(item.id)
                  );

                const stock =
                  getProductStock(item);

                const isOutOfStock =
                  stock <= 0;

                const price =
                  Number(
                    item.price || 0
                  );

                const originalPrice =
                  item.originalPrice
                    ? Number(
                        item.originalPrice
                      )
                    : null;

                return (

                  <div
                    key={item.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition duration-300"
                  >

                    {/* IMAGE */}

                    <div
                      className="relative aspect-[4/5] overflow-hidden cursor-pointer group"
                      onClick={() =>
                        navigate(
                          `/product/${item.id}`
                        )
                      }
                    >

                      <img
                        src={
                          item.image
                        }
                        alt={
                          item.name
                        }
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />

                      {/* OUT OF STOCK */}

                      {isOutOfStock && (

                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">

                          <span className="bg-black text-white px-4 py-2 rounded-full text-xs font-semibold">
                            OUT OF STOCK
                          </span>

                        </div>

                      )}

                      {/* WISHLIST */}

                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();

                          handleWishlist(
                            item
                          );
                        }}
                        className="absolute top-3 right-3 bg-white w-9 h-9 rounded-full flex items-center justify-center shadow hover:scale-110 transition"
                      >

                        {isInWishlist ? (

                          <FaHeart className="text-red-500" />

                        ) : (

                          <FaRegHeart className="text-gray-700" />

                        )}

                      </button>

                      {/* PLUS */}

                      {!isOutOfStock && (

                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();

                            handlePlusClick(
                              item
                            );
                          }}
                          className="absolute bottom-3 right-3 bg-white w-10 h-10 rounded-lg flex items-center justify-center shadow hover:scale-110 transition text-xl font-medium"
                        >
                          +
                        </button>

                      )}

                    </div>

                    {/* PRODUCT INFO */}

                    <div className="p-4">

                      {item.bestSeller && (

                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">
                          Bestseller
                        </p>

                      )}

                      {item.newArrival && (

                        <p className="text-xs font-medium uppercase tracking-wide text-orange-500 mb-1">
                          New Arrival
                        </p>

                      )}

                      <h2
                        className="font-medium text-sm md:text-base line-clamp-2 min-h-[40px] cursor-pointer"
                        onClick={() =>
                          navigate(
                            `/product/${item.id}`
                          )
                        }
                      >
                        {item.name}
                      </h2>

                      <div className="flex items-center gap-2 mt-2 flex-wrap">

                        <span className="font-semibold">
                          ₹
                          {price.toLocaleString(
                            "en-IN"
                          )}
                        </span>

                        {originalPrice &&
                          originalPrice >
                            price && (

                            <span className="text-gray-400 text-sm line-through">
                              ₹
                              {originalPrice.toLocaleString(
                                "en-IN"
                              )}
                            </span>

                          )}

                      </div>

                    </div>

                  </div>

                );
              }
            )}

          </div>

        )}

      </div>

      {/* FILTER DRAWER */}

      {showFilters && (

        <div className="fixed inset-0 z-[9998]">

          <div
            className="absolute inset-0 bg-black/40"
            onClick={() =>
              setShowFilters(false)
            }
          />

          <div className="absolute left-0 top-0 bottom-0 w-full max-w-[420px] bg-white shadow-2xl flex flex-col">

            {/* DRAWER HEADER */}

            <div className="flex items-center justify-between px-5 py-5 border-b">

              <h2 className="text-xl font-semibold">
                Filters
              </h2>

              <button
                type="button"
                onClick={() =>
                  setShowFilters(
                    false
                  )
                }
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center"
              >
                <FaTimes />
              </button>

            </div>

            <div className="flex-1 overflow-y-auto">

              {/* SUBCATEGORY */}

              {categorySubCategories.length >
                0 && (

                <div className="border-b">

                  <button
                    type="button"
                    onClick={() =>
                      toggleDropdown(
                        "DrawerSubcategory"
                      )
                    }
                    className="w-full px-5 py-5 flex items-center justify-between font-semibold"
                  >

                    <span>
                      Category
                    </span>

                    <FaChevronDown
                      className={
                        openFilter ===
                        "DrawerSubcategory"
                          ? "rotate-180"
                          : ""
                      }
                    />

                  </button>

                  {openFilter ===
                    "DrawerSubcategory" && (

                    <div className="px-5 pb-5 space-y-3">

                      {categorySubCategories.map(
                        (sub) => (

                          <label
                            key={sub}
                            className="flex items-center justify-between cursor-pointer"
                          >

                            <span className="text-sm">
                              {sub}
                            </span>

                            <input
                              type="checkbox"
                              checked={selectedSubCategories.includes(
                                sub
                              )}
                              onChange={() =>
                                toggleSubCategory(
                                  sub
                                )
                              }
                              className="w-4 h-4 accent-orange-500"
                            />

                          </label>

                        )
                      )}

                    </div>

                  )}

                </div>

              )}

              {/* GENDER */}

              {categoryHasGender && (

                <div className="border-b">

                  <button
                    type="button"
                    onClick={() =>
                      toggleDropdown(
                        "DrawerGender"
                      )
                    }
                    className="w-full px-5 py-5 flex items-center justify-between font-semibold"
                  >

                    <span>
                      Gender
                    </span>

                    <FaChevronDown
                      className={
                        openFilter ===
                        "DrawerGender"
                          ? "rotate-180"
                          : ""
                      }
                    />

                  </button>

                  {openFilter ===
                    "DrawerGender" && (

                    <div className="px-5 pb-5 space-y-3">

                      {availableGenders.map(
                        (gender) => (

                          <label
                            key={
                              gender
                            }
                            className="flex items-center justify-between cursor-pointer"
                          >

                            <span>
                              {gender}
                            </span>

                            <input
                              type="checkbox"
                              checked={selectedGenders.includes(
                                gender
                              )}
                              onChange={() =>
                                toggleGender(
                                  gender
                                )
                              }
                              className="w-4 h-4 accent-orange-500"
                            />

                          </label>

                        )
                      )}

                    </div>

                  )}

                </div>

              )}

              {/* AGE - GIRLS / BOYS */}

              {showAgeFilter && (

                <div className="border-b">

                  <button
                    type="button"
                    onClick={() => toggleDropdown("DrawerAge")}
                    className="w-full px-5 py-5 flex items-center justify-between font-semibold"
                  >
                    <span>Age</span>

                    <FaChevronDown
                      className={
                        openFilter === "DrawerAge"
                          ? "rotate-180"
                          : ""
                      }
                    />
                  </button>

                  {openFilter === "DrawerAge" && (
                    <div className="px-5 pb-5 space-y-3">
                      {ageGroups.map((age) => (
                        <label
                          key={age}
                          className="flex items-center justify-between cursor-pointer"
                        >
                          <span>{age}</span>

                          <input
                            type="radio"
                            name="drawer-age"
                            checked={selectedAge === age}
                            onChange={() => setSelectedAge(age)}
                            className="w-4 h-4 accent-orange-500"
                          />
                        </label>
                      ))}

                      {selectedAge && (
                        <button
                          type="button"
                          onClick={() => setSelectedAge("")}
                          className="text-sm text-orange-600"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  )}

                </div>
              )}

              {/* SIZE - FOOTWEAR */}

              {showSizeFilter && (

                <div className="border-b">

                  <button
                    type="button"
                    onClick={() =>
                      toggleDropdown(
                        "DrawerSize"
                      )
                    }
                    className="w-full px-5 py-5 flex items-center justify-between font-semibold"
                  >

                    <span>
                      Size
                    </span>

                    <FaChevronDown
                      className={
                        openFilter ===
                        "DrawerSize"
                          ? "rotate-180"
                          : ""
                      }
                    />

                  </button>

                  {openFilter ===
                    "DrawerSize" && (

                    <div className="px-5 pb-5 flex flex-wrap gap-3">

                      {availableSizes.map(
                        (size) => (

                          <button
                            key={String(
                              size
                            )}
                            type="button"
                            onClick={() =>
                              toggleSize(
                                size
                              )
                            }
                            className={`px-4 py-2 rounded-lg border ${
                              selectedSizes.includes(
                                size
                              )
                                ? "bg-orange-500 text-white border-orange-500"
                                : "bg-white border-gray-300"
                            }`}
                          >
                            {size}
                          </button>

                        )
                      )}

                    </div>

                  )}

                </div>

              )}

              {/* PRICE */}

              <div className="border-b">

                <button
                  type="button"
                  onClick={() =>
                    toggleDropdown(
                      "DrawerPrice"
                    )
                  }
                  className="w-full px-5 py-5 flex items-center justify-between font-semibold"
                >

                  <span>
                    Price Range
                  </span>

                  <FaChevronDown
                    className={
                      openFilter ===
                      "DrawerPrice"
                        ? "rotate-180"
                        : ""
                    }
                  />

                </button>

                {openFilter ===
                  "DrawerPrice" && (

                  <div className="px-5 pb-5 space-y-3">

                    {[
                      [
                        "under500",
                        "Under ₹500",
                      ],
                      [
                        "500to1000",
                        "₹500–₹1000",
                      ],
                      [
                        "1000to2000",
                        "₹1000–₹2000",
                      ],
                      [
                        "above2000",
                        "Above ₹2000",
                      ],
                    ].map(
                      ([
                        value,
                        label,
                      ]) => (

                        <label
                          key={
                            value
                          }
                          className="flex items-center justify-between cursor-pointer"
                        >

                          <span>
                            {label}
                          </span>

                          <input
                            type="radio"
                            name="drawer-price"
                            checked={
                              selectedPriceRange ===
                              value
                            }
                            onChange={() =>
                              setSelectedPriceRange(
                                value
                              )
                            }
                            className="w-4 h-4 accent-orange-500"
                          />

                        </label>

                      )
                    )}

                  </div>

                )}

              </div>

              {/* AVAILABILITY */}

              <div className="border-b">

                <button
                  type="button"
                  onClick={() =>
                    toggleDropdown(
                      "DrawerStock"
                    )
                  }
                  className="w-full px-5 py-5 flex items-center justify-between font-semibold"
                >

                  <span>
                    Availability
                  </span>

                  <FaChevronDown
                    className={
                      openFilter ===
                      "DrawerStock"
                        ? "rotate-180"
                        : ""
                    }
                  />

                </button>

                {openFilter ===
                  "DrawerStock" && (

                  <div className="px-5 pb-5 space-y-3">

                    {[
                      [
                        "inStock",
                        "In Stock",
                      ],
                      [
                        "lowStock",
                        "Low Stock",
                      ],
                    ].map(
                      ([
                        value,
                        label,
                      ]) => (

                        <label
                          key={
                            value
                          }
                          className="flex items-center justify-between cursor-pointer"
                        >

                          <span>
                            {label}
                          </span>

                          <input
                            type="radio"
                            name="drawer-stock"
                            checked={
                              selectedStock ===
                              value
                            }
                            onChange={() =>
                              setSelectedStock(
                                value
                              )
                            }
                            className="w-4 h-4 accent-orange-500"
                          />

                        </label>

                      )
                    )}

                  </div>

                )}

              </div>

            </div>

            {/* DRAWER FOOTER */}

            <div className="border-t p-4 flex gap-3">

              <button
                type="button"
                onClick={
                  clearFilters
                }
                className="flex-1 h-12 rounded-full border border-gray-300 bg-white font-semibold"
              >
                Clear Filters
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowFilters(
                    false
                  );

                  setOpenFilter(
                    ""
                  );
                }}
                className="flex-1 h-12 rounded-full bg-[#ff6b00] text-white font-semibold"
              >
                Apply Filters
              </button>

            </div>

          </div>

        </div>

      )}

      {/* SIZE POPUP */}

      {showSizePopup &&
        selectedProduct && (

        <div
          className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center px-4 py-6"
          onClick={
            closePopup
          }
        >

          <div
            className="relative bg-white w-full max-w-[520px] max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* HEADER */}

            <div className="px-6 pt-5">

              <div className="flex items-center justify-between">

                <h2 className="text-xl font-semibold">
                  Select size
                </h2>

                <button
                  type="button"
                  onClick={
                    closePopup
                  }
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                >
                  <FaTimes />
                </button>

              </div>

            </div>

            {/* PRODUCT */}

            <div className="px-6 py-5">

              <div className="flex gap-4">

                <div className="w-24 h-28 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">

                  <img
                    src={
                      selectedProduct.image
                    }
                    alt={
                      selectedProduct.name
                    }
                    className="w-full h-full object-cover"
                  />

                </div>

                <div className="flex-1">

                  <h3 className="text-sm text-gray-600">
                    {
                      selectedProduct.name
                    }
                  </h3>

                  <div className="flex items-center gap-2 mt-2">

                    <span className="font-bold">
                      ₹
                      {Number(
                        selectedProduct.price ||
                          0
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </span>

                    {selectedProduct.originalPrice && (

                      <span className="text-sm text-gray-400 line-through">
                        ₹
                        {Number(
                          selectedProduct.originalPrice
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </span>

                    )}

                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      closePopup();

                      navigate(
                        `/product/${selectedProduct.id}`
                      );
                    }}
                    className="mt-4 text-sm font-medium hover:underline"
                  >
                    View Product →
                  </button>

                </div>

              </div>

            </div>

            {/* DELIVERY */}

            <div className="px-6">

              <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">

                <FaTruck className="text-orange-500" />

                <span className="text-sm text-gray-600 flex-1">
                  Fast Delivery within
                  2–4 days
                </span>

                <FaInfoCircle className="text-gray-400" />

              </div>

            </div>

            {/* SIZE */}

            <div className="px-6 pt-6">

              <p className="text-sm font-semibold mb-3">
                Select Size
              </p>

              <div className="flex flex-wrap gap-2">

                {selectedProduct.sizes.map(
                  (
                    size,
                    index
                  ) => {

                    const sizeValue =
                      getSizeValue(
                        size
                      );

                    const sizeStock =
                      getSizeStock(
                        size
                      );

                    const isOutOfStock =
                      sizeStock <= 0;

                    const isSelected =
                      String(
                        selectedSize
                      ) ===
                      String(
                        sizeValue
                      );

                    return (

                      <button
                        key={index}
                        type="button"
                        disabled={
                          isOutOfStock
                        }
                        onClick={() =>
                          setSelectedSize(
                            sizeValue
                          )
                        }
                        className={`min-w-[70px] px-4 py-2.5 rounded-lg border text-sm font-medium ${
                          isSelected
                            ? "bg-black text-white border-black"
                            : "bg-white text-gray-700 border-gray-300"
                        } ${
                          isOutOfStock
                            ? "opacity-40 line-through cursor-not-allowed"
                            : "hover:border-black"
                        }`}
                      >
                        {sizeValue}
                      </button>

                    );
                  }
                )}

              </div>

            </div>

            {/* BUTTONS */}

            <div className="px-6 py-6">

              <div className="flex gap-3">

                <button
                  type="button"
                  onClick={
                    handleBuyNow
                  }
                  className="flex-1 h-12 rounded-full border border-gray-300 bg-white font-semibold hover:bg-gray-50"
                >
                  Buy Now
                </button>

                <button
                  type="button"
                  onClick={
                    handleAddSelectedToCart
                  }
                  className="flex-1 h-12 rounded-full bg-[#ff6b00] text-white font-semibold hover:bg-[#e85f00]"
                >
                  Add to Bag
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default ProductPage;
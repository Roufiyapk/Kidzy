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

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../api/api";

const API_BASE_URL = api.defaults.baseURL.replace(/\/api\/?$/, "");
const AGE_FILTER_OPTIONS = [
  "0–2 Years",
  "2–6 Years",
  "6-10 Years",
];

const normalizeAgeLabel = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s*[-–—]\s*/g, "-")
    .replace(/\s+/g, " ");

const getApiData = (response) => {
  return response?.data?.data ?? response?.data ?? [];
};

const normalizeCategoryKey = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "");

const normalizeCategoryResponse = (responseData) => {
  const root =
    responseData?.data ??
    responseData ??
    null;

  const unwrap = (value) => {
    if (Array.isArray(value)) {
      return value;
    }

    if (!value || typeof value !== "object") {
      return [];
    }

    const candidates = [
      value.data,
      value.Data,
      value.categories,
      value.Categories,
      value.items,
      value.Items,
      value.results,
      value.Results,
    ];

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
        return candidate;
      }

      if (candidate && typeof candidate === "object") {
        const nested = unwrap(candidate);
        if (nested.length > 0) {
          return nested;
        }
      }
    }

    return [];
  };

  return unwrap(root)
    .filter(Boolean)
    .map((item) => {
      const rawSubCategories =
        item?.subCategories ??
        item?.SubCategories ??
        item?.subcategories ??
        item?.Subcategories ??
        [];

      return {
        id: item?.id ?? item?.Id ?? null,
        name: String(
          item?.name ?? item?.Name ?? ""
        ).trim(),
        subCategories: Array.isArray(rawSubCategories)
          ? rawSubCategories
              .filter(Boolean)
              .map((subCategory) => ({
                id:
                  subCategory?.id ??
                  subCategory?.Id ??
                  null,
                name:
                  typeof subCategory === "string"
                    ? subCategory.trim()
                    : String(
                        subCategory?.name ??
                        subCategory?.Name ??
                        ""
                      ).trim(),
              }))
              .filter((subCategory) => subCategory.name)
          : [],
      };
    })
    .filter((item) => item.name);
};

const normalizeImageUrl = (image) => {
  if (!image) {
    return "";
  }

  const imageString = String(image).trim();

  if (!imageString) {
    return "";
  }

  if (
    imageString.startsWith("http://") ||
    imageString.startsWith("https://")
  ) {
    return imageString;
  }

  if (imageString.startsWith("/")) {
    return `${API_BASE_URL}${imageString}`;
  }

  return `${API_BASE_URL}/${imageString}`;
};

const normalizeProduct = (product) => {
  const variants = Array.isArray(
    product?.variants
  )
    ? product.variants
    : Array.isArray(product?.Variants)
      ? product.Variants
      : [];

  const sizes = variants.length > 0
    ? variants.flatMap((variant) => {
        const ageGroup =
          variant?.ageGroup ??
          variant?.AgeGroup ??
          "";

        const variantSizes =
          Array.isArray(variant?.sizes)
            ? variant.sizes
            : Array.isArray(variant?.Sizes)
              ? variant.Sizes
              : variant?.size || variant?.Size
                ? [variant]
                : [];

        return variantSizes
          .map((sizeItem) => ({
            id:
              sizeItem?.id ??
              sizeItem?.Id ??
              null,
            productVariantId:
              sizeItem?.id ??
              sizeItem?.Id ??
              variant?.id ??
              variant?.Id ??
              null,
            variantId:
              sizeItem?.id ??
              sizeItem?.Id ??
              variant?.id ??
              variant?.Id ??
              null,
            ageGroup:
              sizeItem?.ageGroup ??
              sizeItem?.AgeGroup ??
              ageGroup,
            size:
              sizeItem?.size ??
              sizeItem?.Size ??
              sizeItem?.name ??
              sizeItem?.Name ??
              sizeItem?.value ??
              sizeItem?.Value ??
              "",
            stock: Number(
              sizeItem?.stock ??
              sizeItem?.Stock ??
              0
            ),
          }))
          .filter((sizeItem) => sizeItem.size);
      })
    : Array.isArray(product?.sizes)
      ? product.sizes
      : Array.isArray(product?.Sizes)
        ? product.Sizes
        : [];

  const image =
    product?.imageUrl ??
    product?.imagePath ??
    product?.image ??
    product?.thumbnail ??
    "";

  return {
    ...product,

    id: product?.id ?? product?.Id,
    categoryId:
      product?.categoryId ??
      product?.CategoryId ??
      product?.category?.id ??
      product?.category?.Id ??
      null,

    category:
      product?.categoryName ??
      product?.CategoryName ??
      product?.category?.name ??
      product?.category?.Name ??
      (typeof product?.category === "string"
        ? product.category
        : ""),
    subCategoryId:
      product?.subCategoryId ??
      product?.SubCategoryId ??
      product?.subCategory?.id ??
      product?.subCategory?.Id ??
      null,

    subCategory:
      product?.subCategoryName ??
      product?.SubCategoryName ??
      product?.subCategory?.name ??
      product?.subCategory?.Name ??
      (typeof product?.subCategory === "string"
        ? product.subCategory
        : ""),
    image: normalizeImageUrl(image),

    images: Array.isArray(product?.images)
      ? product.images.map((item) => {
          if (typeof item === "string") {
            return normalizeImageUrl(item);
          }

          return normalizeImageUrl(
            item?.imageUrl ??
              item?.imagePath ??
              item?.image ??
              ""
          );
        })
      : [],

    price: Number(product?.price ?? product?.Price ?? 0),

    originalPrice:
      product?.originalPrice != null
        ? Number(product.originalPrice)
        : product?.OriginalPrice != null
          ? Number(product.OriginalPrice)
          : null,

    stock: Number(
      product?.stock ??
      product?.Stock ??
      0
    ),

    gender:
      product?.gender ??
      product?.Gender ??
      null,

    age:
      product?.age ??
      product?.Age ??
      null,

    bestSeller: Boolean(
      product?.bestSeller ??
      product?.BestSeller ??
      false
    ),

    newArrival: Boolean(
      product?.newArrival ??
      product?.NewArrival ??
      false
    ),

    deleted: Boolean(
      product?.deleted ??
      product?.Deleted ??
      false
    ),

    sizes,
  };
};

function ProductPage() {
  const { category } = useParams();

  const navigate = useNavigate();

  const dispatch = useDispatch();

  const [searchParams] = useSearchParams();

  const selectedSubCategory =
    searchParams.get("subCategory");

  const [sortOption, setSortOption] =
    useState("default");

  const [showFilters, setShowFilters] =
    useState(false);

  const [openFilter, setOpenFilter] =
    useState("");

  const [selectedAges, setSelectedAges] =
    useState([]);

  const [selectedGenders, setSelectedGenders] =
    useState([]);

  const [selectedPriceRange, setSelectedPriceRange] =
    useState("");

  const [showSizePopup, setShowSizePopup] =
    useState(false);

  const [selectedProduct, setSelectedProduct] =
    useState(null);

  const [selectedSize, setSelectedSize] =
    useState(null);

  const addingCartRef = useRef(false);

  const wishlistItems = useSelector(
    (state) =>
      state.wishlist?.items || []
  );

  const {
    data: backendCategories = [],
    isLoading: categoriesLoading,
    isError: categoriesError,
    error: categoriesQueryError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await api.get("/categories");
      const result = normalizeCategoryResponse(response.data);

      if (result.length === 0) {
        throw new Error(
          "No categories were returned from the backend."
        );
      }

      return result;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const currentCategory = backendCategories.find(
    (item) =>
      normalizeCategoryKey(item.name) ===
      normalizeCategoryKey(category)
  );

  useEffect(() => {
    const loadWishlist = async () => {
      const token =
        localStorage.getItem("token");

      if (!token) {
        dispatch(setWishlist([]));
        return;
      }

      dispatch(setWishlist([]));

      try {
        const response = await api.get("/wishlist");
        const responseData = response.data;

        const wishlistItems =
          Array.isArray(
            responseData?.data?.items
          )
            ? responseData.data.items
            : [];

        dispatch(
          setWishlist(
            wishlistItems
          )
        );
      } catch (error) {
        console.error(
          "Wishlist load error:",
          error
        );

        dispatch(setWishlist([]));
      }
    };

    loadWishlist();
  }, [dispatch]);

  useEffect(() => {
    setSelectedAges([]);
    setSelectedGenders([]);
    setSelectedPriceRange("");
    setSortOption("default");
    setOpenFilter("");
  }, [
    category,
    selectedSubCategory,
  ]);

  const {
    data: products = [],
    isLoading: productsLoading,
    isError: productsError,
    error: productsQueryError,
  } = useQuery({
    queryKey: [
      "products",
      currentCategory?.id ?? null,
      category,
    ],

    queryFn: async () => {
      if (!currentCategory?.id) {
        return [];
      }

      const response = await api.get(
        `/products/category/${currentCategory.id}`
      );

      const responseData = response.data;
      const root =
        responseData?.data ??
        responseData ??
        [];

      let productList = [];

      if (Array.isArray(root)) {
        productList = root;
      } else if (root && typeof root === "object") {
        productList =
          root.products ??
          root.Products ??
          root.data ??
          root.Data ??
          [];
      }

      if (!Array.isArray(productList)) {
        return [];
      }

      return productList.map(normalizeProduct);
    },

    enabled: Boolean(currentCategory?.id),
  });

  const isLoading =
    categoriesLoading ||
    productsLoading;

  const isError =
    categoriesError ||
    productsError;

  const error =
    categoriesQueryError ||
    productsQueryError;

  const visibleProducts =
    products.filter(
      (product) =>
        product.deleted !== true
    );
  const getSizeValue = (size) => {
    if (
      typeof size === "object" &&
      size !== null
    ) {
      return (
        size.size ??
        size.name ??
        size.value ??
        ""
      );
    }

    return size;
  };

  const getSizeStock = (size) => {
    if (
      typeof size === "object" &&
      size !== null
    ) {
      return Number(
        size.stock ?? 0
      );
    }

    return 1;
  };

  const hasSizes = (product) => {
    return (
      Array.isArray(product.sizes) &&
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

  const categoryHasGender =
    visibleProducts.some(
      (product) => product.gender
    );

  const getProductAges = (product) => {
    const variantAges = Array.isArray(product?.sizes)
      ? product.sizes
          .map((item) => {
            if (!item || typeof item !== "object") return "";
            return item.ageGroup ?? item.AgeGroup ?? item.age ?? item.Age ?? "";
          })
          .filter(Boolean)
      : [];

    if (product?.age) {
      variantAges.push(product.age);
    }

    return [...new Set(
      variantAges
        .map((age) => String(age).trim())
        .filter(Boolean)
    )];
  };

  const availableAges = AGE_FILTER_OPTIONS.filter((ageOption) =>
    visibleProducts.some((product) =>
      getProductAges(product).some(
        (productAge) =>
          normalizeAgeLabel(productAge) === normalizeAgeLabel(ageOption)
      )
    )
  );

  const categoryHasAges = availableAges.length > 0;

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

  const filteredProducts =
    visibleProducts
      .filter((product) => {

        if (selectedSubCategory) {
          if (
            normalizeCategoryKey(product.subCategory) !==
            normalizeCategoryKey(selectedSubCategory)
          ) {
            return false;
          }
        }
        if (selectedAges.length > 0) {
          const productAges = getProductAges(product).map(normalizeAgeLabel);

          const matchingAge = selectedAges.some((age) =>
            productAges.includes(normalizeAgeLabel(age))
          );

          if (!matchingAge) {
            return false;
          }
        }

        if (
          selectedGenders.length >
          0
        ) {
          const genderMatch =
            selectedGenders.some(
              (gender) =>
                String(
                  gender
                ).toLowerCase() ===
                String(
                  product.gender
                ).toLowerCase()
            );

          if (!genderMatch) {
            return false;
          }
        }

        if (
          !checkPriceRange(
            product
          )
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

  const toggleAge = (value) => {
    setSelectedAges((previous) =>
      previous.includes(value)
        ? previous.filter((item) => item !== value)
        : [...previous, value]
    );
  };

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

  const clearFilters = () => {
    setSelectedAges([]);
    setSelectedGenders([]);
    setSelectedPriceRange("");
    setSortOption("default");
    setOpenFilter("");
  };

  const activeFilterCount =
    selectedAges.length +
    selectedGenders.length +
    (selectedPriceRange ? 1 : 0) +
    (sortOption !== "default" ? 1 : 0);

  const handleWishlist = async (
    product
  ) => {
    const token =
      localStorage.getItem("token");

    if (!token) {
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
        
        await dispatch(
          removeFromWishlist(
            product.id
          )
        ).unwrap();

        toast.success(
          "Removed from wishlist"
        );

        return;
      }
     
      await dispatch(
        addToWishlist(
          product
        )
      ).unwrap();

      toast.success(
        "Added to wishlist"
      );
    } catch (error) {
      console.error(
        "Wishlist error:",
        error
      );

      toast.error(
        typeof error === "string"
          ? error
          : error?.message ||
            "Wishlist update failed"
      );
    }
  };

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

      const response =
        await api.get("/cart");

      const responseData =
        response.data;

      const cartItems =
        Array.isArray(responseData?.data?.items)
          ? responseData.data.items
          : Array.isArray(responseData?.items)
            ? responseData.items
            : Array.isArray(responseData?.data)
              ? responseData.data
              : Array.isArray(responseData)
                ? responseData
                : [];

      const existingItem =
        Array.isArray(cartItems)
          ? cartItems.find(
              (item) => {

                const existingProductId =
                  String(
                    item.productId ??
                      item.product?.id ??
                      ""
                  );

                const existingVariantId =
                  item.productVariantId == null
                    ? null
                    : String(
                        item.productVariantId
                      );

                const selectedVariantId =
                  productVariantIdFromProduct(
                    product,
                    size
                  );

                return (
                  existingProductId ===
                    String(
                      product.id
                    ) &&
                  (existingVariantId === null
                    ? selectedVariantId == null
                    : existingVariantId ===
                      String(
                        selectedVariantId
                      ))
                );
              }
            )
          : null;

      if (existingItem) {
        toast.info(
          "Already in cart"
        );

        return false;
      }

      const productVariantId =
        productVariantIdFromProduct(
          product,
          size
        );

      const cartItem = {
        productId:
          Number(product.id),

        productVariantId:
          productVariantId == null
            ? null
            : Number(productVariantId),

        quantity: 1,
      };

      await api.post(
        "/cart",
        cartItem
      );

      const updatedResponse =
        await api.get("/cart");

      const updatedData =
        updatedResponse.data;

      const updatedCart =
        Array.isArray(
          updatedData?.data?.items
        )
          ? updatedData.data.items
          : Array.isArray(
              updatedData?.items
            )
            ? updatedData.items
            : Array.isArray(
                updatedData?.data
              )
              ? updatedData.data
              : Array.isArray(
                  updatedData
                )
                ? updatedData
                : [];

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
        error?.message ||
          "Failed to add to cart"
      );

      return false;
    } finally {
      addingCartRef.current =
        false;
    }
  };

  const productVariantIdFromProduct = (
    product,
    size
  ) => {
    if (
      !size ||
      !Array.isArray(
        product?.sizes
      )
    ) {
      return null;
    }

    const matchingSize =
      product.sizes.find(
        (item) =>
          String(
            getSizeValue(item)
          ) ===
          String(size)
      );

    return (
      matchingSize?.id ??
      matchingSize?.variantId ??
      matchingSize?.productVariantId ??
      null
    );
  };

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

    if (
      hasSizes(product)
    ) {
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
        closePopup();
      }
    };

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
        closePopup();

        navigate("/cart");
      }
    };

  const closePopup = () => {
    setShowSizePopup(false);

    setSelectedProduct(null);

    setSelectedSize(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p>
          Loading products...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <p className="text-[#5A4030] font-semibold">
          Failed to load products
        </p>

        <p className="text-gray-500 mt-2">
          {error?.message}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">

      <div className="px-4 md:px-8 lg:px-12 py-8">

        <div className="flex justify-end pb-5">
          <button
            type="button"
            onClick={() => {
              setShowFilters(true);
              setOpenFilter("");
            }}
            className="flex items-center gap-2 px-5 py-3 rounded-full border border-[#E7DED5] bg-white hover:border-[#6B4F3A] transition font-medium"
          >
            <FaSlidersH />
            <span>Filter &amp; Sort</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#5A4030] text-white text-xs flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

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
              className="text-sm text-[#5A4030] font-medium"
            >
              Clear Filters
            </button>

          )}

        </div>

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
                      String(
                        item.id
                      )
                  );

                const stock =
                  getProductStock(
                    item
                  );

                const isOutOfStock =
                  stock <= 0;

                const isLowStock =
                  stock > 0 &&
                  stock < 5;

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

                    <div
                      className="relative aspect-[4/5] overflow-hidden cursor-pointer group"
                      onClick={() =>
                        navigate(
                          `/product/${item.id}`
                        )
                      }
                    >

                      {item.image ? (

                        <img
                          src={
                            item.image
                          }
                          alt={
                            item.name
                          }
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          onError={(event) => {
                            event.currentTarget.style.display =
                              "none";
                          }}
                        />

                      ) : (

                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                          No Image
                        </div>

                      )}

                      {isLowStock && (
                        <div className="absolute top-3 left-3 bg-[#5A4030] text-white px-3 py-1 rounded-full text-[11px] font-semibold shadow z-10">
                          LOW STOCK
                        </div>
                      )}

                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="bg-black text-white px-4 py-2 rounded-full text-xs font-semibold">
                            OUT OF STOCK
                          </span>
                        </div>
                      )}

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

                          <FaHeart className="text-[#5A4030]" />

                        ) : (

                          <FaRegHeart className="text-gray-700" />

                        )}

                      </button>

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

                    <div className="p-4">

                      {item.bestSeller && (
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">
                          Bestseller
                        </p>
                      )}

                      {item.newArrival && (
                        <p className="text-xs font-medium uppercase tracking-wide text-[#5A4030] mb-1">
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

      {showFilters && (

        <div className="fixed inset-0 z-[9998]">

          <div
            className="absolute inset-0 bg-black/40"
            onClick={() =>
              setShowFilters(false)
            }
          />

          <div className="absolute right-0 top-0 bottom-0 w-full max-w-[420px] bg-white shadow-2xl flex flex-col">

            <div className="flex items-center justify-between px-5 py-5 border-b">

              <h2 className="text-xl font-semibold">
                Filter &amp; Sort
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

              <div className="border-b">
                <button
                  type="button"
                  onClick={() => toggleDropdown("DrawerSort")}
                  className="w-full px-5 py-5 flex items-center justify-between font-semibold"
                >
                  <span>Sort By</span>
                  <FaChevronDown
                    className={openFilter === "DrawerSort" ? "rotate-180" : ""}
                  />
                </button>

                {openFilter === "DrawerSort" && (
                  <div className="px-5 pb-5 space-y-3">
                    {[
                      ["default", "Relevance"],
                      ["lowToHigh", "Price: Low to High"],
                      ["highToLow", "Price: High to Low"],
                    ].map(([value, label]) => (
                      <label
                        key={value}
                        className="flex items-center justify-between cursor-pointer"
                      >
                        <span className="text-sm">{label}</span>
                        <input
                          type="radio"
                          name="drawer-sort"
                          checked={sortOption === value}
                          onChange={() => setSortOption(value)}
                          className="w-4 h-4 accent-[#5A4030]"
                        />
                      </label>
                    ))}
                  </div>
                )}
              </div>

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
                            key={gender}
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
                              className="w-4 h-4 accent-[#5A4030]"
                            />

                          </label>

                        )
                      )}

                    </div>

                  )}

                </div>

              )}

              {categoryHasAges && (
                <div className="border-b">
                  <button
                    type="button"
                    onClick={() => toggleDropdown("DrawerAge")}
                    className="w-full px-5 py-5 flex items-center justify-between font-semibold"
                  >
                    <span>Age</span>
                    <FaChevronDown
                      className={
                        openFilter === "DrawerAge" ? "rotate-180" : ""
                      }
                    />
                  </button>

                  {openFilter === "DrawerAge" && (
                    <div className="px-5 pb-5 space-y-3">
                      {availableAges.map((age) => (
                        <label
                          key={age}
                          className="flex items-center justify-between cursor-pointer"
                        >
                          <span className="text-sm">{age}</span>
                          <input
                            type="checkbox"
                            checked={selectedAges.includes(age)}
                            onChange={() => toggleAge(age)}
                            className="w-4 h-4 accent-[#5A4030]"
                          />
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

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
                          key={value}
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
                            className="w-4 h-4 accent-[#5A4030]"
                          />

                        </label>

                      )
                    )}

                  </div>

                )}

              </div>

            </div>

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
                className="flex-1 h-12 rounded-full bg-[#5A4030] text-white font-semibold"
              >
                Apply Filters
              </button>

            </div>

          </div>

        </div>

      )}

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

            <div className="px-6 py-5">

              <div className="flex gap-4">

                <div className="w-24 h-28 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">

                  {selectedProduct.image ? (

                    <img
                      src={
                        selectedProduct.image
                      }
                      alt={
                        selectedProduct.name
                      }
                      className="w-full h-full object-cover"
                    />

                  ) : (

                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      No Image
                    </div>

                  )}

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

            <div className="px-6">

              <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">

                <FaTruck className="text-[#5A4030]" />

                <span className="text-sm text-gray-600 flex-1">
                  Fast Delivery within
                  2–4 days
                </span>

                <FaInfoCircle className="text-gray-400" />

              </div>

            </div>

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
                      sizeStock <=
                      0;

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
                            ? "bg-[#5A4030] text-white border-[#5A4030]"
                            : "bg-white text-gray-700 border-gray-300"
                        } ${
                          isOutOfStock
                            ? "opacity-40 line-through cursor-not-allowed"
                            : "hover:border-[#6B4F3A]"
                        }`}
                      >
                        {sizeValue}
                      </button>

                    );
                  }
                )}

              </div>

            </div>

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
                  className="flex-1 h-12 rounded-full bg-[#5A4030] text-white font-semibold hover:bg-[#4A3326]"
                >
                  Add to Bag
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

      <ToastContainer
        position="bottom-center"
        autoClose={1800}
        hideProgressBar
        newestOnTop
        closeButton={false}
        closeOnClick
        pauseOnHover={false}
        draggable={false}
        theme="light"
        icon={false}
        toastStyle={{
          background: "#FFF9F3",
          color: "#5A4030",
          border: "1px solid #E7DED5",
          borderRadius: "12px",
          boxShadow: "0 4px 16px rgba(90, 64, 48, 0.12)",
          fontSize: "14px",
          fontWeight: 500,
          minHeight: "42px",
          padding: "10px 14px",
        }}
      />

    </div>
  );
}

export default ProductPage;
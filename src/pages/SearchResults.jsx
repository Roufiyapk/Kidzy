import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import { FaHeart, FaSearch } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import api from "../api/api";
import { categories } from "../data/categories";

function SearchResults() {
  const { query } = useParams();
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const searchText = decodeURIComponent(query || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();


  // LOAD WISHLIST FROM BACKEND
  

  const refreshWishlist = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setWishlistItems([]);
      return [];
    }

    try {
      const response = await api.get("/wishlist");
      const root = response?.data?.data ?? response?.data ?? [];

      const items = Array.isArray(root)
        ? root
        : Array.isArray(root?.items)
          ? root.items
          : Array.isArray(root?.Items)
            ? root.Items
            : [];

      setWishlistItems(items);
      return items;
    } catch (error) {
      console.error("Get wishlist error:", error);
      if (error?.response?.status === 401) {
        setWishlistItems([]);
      }
      return [];
    }
  };

  useEffect(() => {
    refreshWishlist();
    
  }, []);


  const normalize = (value = "") =>
    String(value ?? "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ");

  const getValue = (item, camelCase, pascalCase) =>
    item?.[camelCase] ?? item?.[pascalCase];

  // NORMALIZE API RESPONSE

  const normalizeResponse = (responseData) => {
   

    let payload = responseData;

    // Handle nested API response wrappers.
    for (let i = 0; i < 3; i++) {
      if (Array.isArray(payload)) {
        return payload;
      }

      if (!payload || typeof payload !== "object") {
        return [];
      }

      if (Array.isArray(payload.items)) {
        return payload.items;
      }

      if (Array.isArray(payload.Items)) {
        return payload.Items;
      }

      if (Array.isArray(payload.products)) {
        return payload.products;
      }

      if (Array.isArray(payload.Products)) {
        return payload.Products;
      }

      if (Array.isArray(payload.data)) {
        return payload.data;
      }

      if (payload.data && typeof payload.data === "object") {
        payload = payload.data;
        continue;
      }

      if (payload.Data && typeof payload.Data === "object") {
        payload = payload.Data;
        continue;
      }

      break;
    }

    return [];
  };

  // NORMALIZE PRODUCT

  const normalizeProduct = (item) => {
    const variants =
      getValue(item, "variants", "Variants") || [];

    const images =
      getValue(item, "images", "Images") || [];

    const normalizedVariants = Array.isArray(variants)
      ? variants
      : [];

    const normalizedImages = Array.isArray(images)
      ? images
      : [];

    const imageFromImages =
      normalizedImages.length > 0
        ? getValue(
            normalizedImages[0],
            "imageUrl",
            "ImageUrl"
          ) ||
          getValue(
            normalizedImages[0],
            "url",
            "Url"
          ) ||
          ""
        : "";

    const categoryObject =
      getValue(item, "category", "Category");

    const subCategoryObject =
      getValue(item, "subCategory", "SubCategory");

    const categoryName =
      getValue(item, "categoryName", "CategoryName") ||
      (typeof categoryObject === "object"
        ? getValue(categoryObject, "name", "Name")
        : categoryObject) ||
      "";

    const subCategoryName =
      getValue(item, "subCategoryName", "SubCategoryName") ||
      (typeof subCategoryObject === "object"
        ? getValue(subCategoryObject, "name", "Name")
        : subCategoryObject) ||
      "";

    const imageUrl =
      getValue(item, "imageUrl", "ImageUrl") ||
      getValue(item, "image", "Image") ||
      imageFromImages ||
      "";

    const ageGroups = normalizedVariants
      .map((variant) =>
        getValue(variant, "ageGroup", "AgeGroup")
      )
      .filter(Boolean);

    const sizes = normalizedVariants
      .map((variant) =>
        getValue(variant, "size", "Size")
      )
      .filter(Boolean);

    return {
      ...item,

      id: getValue(item, "id", "Id"),

      name: getValue(item, "name", "Name") || "",

      description:
        getValue(item, "description", "Description") || "",

      price: Number(
        getValue(item, "price", "Price") || 0
      ),

      stock: Number(
        getValue(item, "stock", "Stock") || 0
      ),

      image: imageUrl,
      imageUrl,

      images: normalizedImages,

      category: categoryName,
      categoryName,

      subCategory: subCategoryName,
      subCategoryName,

      gender: getValue(item, "gender", "Gender") || "",

      deleted:
        getValue(item, "deleted", "Deleted") ?? false,

      bestSeller:
        getValue(item, "bestSeller", "BestSeller") ?? false,

      newArrival:
        getValue(item, "newArrival", "NewArrival") ?? false,

      variants: normalizedVariants,
      ageGroups,
      sizes,
    };
  };

  // FETCH SEARCH RESULTS FROM BACKEND

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      if (!searchText) {
        setProducts([]);
        setLoading(false);
        setError("");
        return;
      }

      try {
        setLoading(true);
        setError("");

       

        const response = await api.get("/products/search", {
          params: {
            query: searchText,
          },
        });

        const responseProducts = normalizeResponse(
          response.data
        );

        const normalizedProducts = responseProducts
          .map(normalizeProduct)
          .filter(
            (product) =>
              product.id !== undefined &&
              product.id !== null &&
              !product.deleted
          );

        if (isMounted) {
          setProducts(normalizedProducts);
        }
      } catch (err) {
        console.error(
          "Error fetching search results:",
          err.response?.data || err
        );

        if (isMounted) {
          setProducts([]);
          setError(
            "Unable to load search results. Please try again."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, [searchText]);

  // FILTER PRODUCTS

  const filteredProducts = useMemo(() => {
    if (!searchText) {
      return [];
    }

   

    const searchWords = searchText.split(" ");

    return products.filter((product) => {
      const name = normalize(product.name);
      const description = normalize(product.description);
      const category = normalize(product.category);
      const subCategory = normalize(product.subCategory);
      const gender = normalize(product.gender);

      const ageGroups = product.ageGroups
        .map(normalize)
        .join(" ");

      const sizes = product.sizes
        .map(normalize)
        .join(" ");

      const searchableText = normalize(
        [
          name,
          description,
          category,
          subCategory,
          gender,
          ageGroups,
          sizes,
        ].join(" ")
      );

      if (category === searchText) {
        return true;
      }

      if (subCategory === searchText) {
        return true;
      }

      if (
        category &&
        subCategory &&
        `${category} ${subCategory}` === searchText
      ) {
        return true;
      }

      const matchedCategory = categories.find((cat) => {
        const categoryName = normalize(cat.name);

        return (
          searchText === categoryName ||
          searchText.startsWith(`${categoryName} `)
        );
      });

      if (matchedCategory) {
        const categoryName = normalize(matchedCategory.name);

        const remainingText = searchText
          .slice(categoryName.length)
          .trim();

        if (!remainingText) {
          return category === categoryName;
        }

        if (
          category === categoryName &&
          subCategory.includes(remainingText)
        ) {
          return true;
        }
      }

      return searchWords.every((word) =>
        searchableText.includes(word)
      );
    });
  }, [products, searchText]);

  // WISHLIST CHECK
  

  const isInWishlist = (productId) =>
    wishlistItems.some((item) => {
      const wishlistProductId =
        item?.productId ??
        item?.ProductId ??
        item?.product?.id ??
        item?.product?.Id ??
        item?.id ??
        item?.Id;

      return String(wishlistProductId) === String(productId);
    });

  // WISHLIST HANDLER

  const handleWishlist = async (product) => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }

    const productId = product?.id ?? product?.Id;

    if (!productId) {
      toast.error("Product ID not found");
      return;
    }

    const existing = wishlistItems.find((item) => {
      const wishlistProductId =
        item?.productId ??
        item?.ProductId ??
        item?.product?.id ??
        item?.product?.Id ??
        item?.id ??
        item?.Id;

      return String(wishlistProductId) === String(productId);
    });

    try {
      setWishlistLoading(true);

      if (existing) {
        await api.delete(`/wishlist/${productId}`);
        await refreshWishlist();
        toast.success("Removed from wishlist");
        return;
      }

      await api.post("/wishlist", { productId: Number(productId) });
      await refreshWishlist();
      toast.success("Added to wishlist");
    } catch (error) {
      console.error("Wishlist error:", error);

      if (error?.response?.status === 401) {
        toast.error("Please login first");
        navigate("/login");
        return;
      }

      toast.error(
        error?.response?.data?.message ||
        error?.response?.data?.title ||
        error?.response?.data?.errors?.[0] ||
        "Wishlist update failed"
      );
    } finally {
      setWishlistLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F3EE]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#E7DED5] border-t-[#6B4F3A] rounded-full animate-spin mx-auto mb-4" />

          <p className="text-[#6B4F3A]">
            Loading search results...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-center px-4">
        <p className="text-[#5A4030] mb-4">{error}</p>

        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-[#6B4F3A] text-white rounded-lg font-semibold hover:bg-[#5A4030] transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  // SEARCH RESULTS PAGE

  return (
    <div className="min-h-screen bg-[#F7F3EE] px-4 sm:px-6 lg:px-10 py-8">
      <style>{`
        .Toastify__toast--success {
          --toastify-color-success: #C86F85;
        }
        .Toastify__toast--error {
          --toastify-color-error: #B94F68;
        }
        .Toastify__toast-icon svg {
          fill: #C86F85;
        }
      `}</style>

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
        toastStyle={{
          background: "#FFF5F7",
          color: "#78394B",
          border: "1px solid #F0C7D1",
          borderRadius: "10px",
          boxShadow: "0 4px 14px rgba(120, 57, 75, 0.12)",
          fontSize: "13px",
          fontWeight: "500",
          minHeight: "42px",
          padding: "10px 14px",
          width: "fit-content",
          maxWidth: "calc(100vw - 32px)",
        }}
      />

      {/* HEADER */}

      <div className="mb-8">
        <p className="text-[#6B4F3A] mt-2">
          Results for{" "}
          <span className="font-semibold text-[#5A4030]">
            "{query || ""}"
          </span>
        </p>
      </div>

      {/* RESULT COUNT */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <p className="text-sm text-[#6B4F3A]">
          {filteredProducts.length}{" "}
          {filteredProducts.length === 1
            ? "product"
            : "products"}{" "}
          found
        </p>

        <div className="flex items-center gap-2 text-sm text-[#6B4F3A]">
          <FaSearch className="text-[#6B4F3A]" />

          <span>Search products and categories</span>
        </div>
      </div>

      {/* NO RESULTS */}

      {filteredProducts.length === 0 ? (
        <div className="min-h-[400px] flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-[#F7F3EE] flex items-center justify-center mb-5">
            <FaSearch className="text-3xl text-[#8A7768]" />
          </div>

          <h2 className="text-xl font-semibold text-[#5A4030]">
            No products found
          </h2>

          <p className="text-[#6B4F3A] mt-2 max-w-md">
            We couldn't find any products matching "{query}".
            Try another product name, category or subcategory.
          </p>

          <button
            onClick={() => navigate("/")}
            className="mt-5 px-6 py-3 bg-[#6B4F3A] text-white rounded-lg font-semibold hover:bg-[#5A4030] transition"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <>
          {/* PRODUCT GRID */}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group bg-white rounded-xl overflow-hidden border border-[#E7DED5] hover:shadow-md transition relative"
              >
                {/* IMAGE */}

                <div
                  className="relative aspect-[3/4] bg-[#F7F3EE] overflow-hidden cursor-pointer"
                  onClick={() =>
                    navigate(`/product/${product.id}`)
                  }
                >
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name || "Product"}
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#8A7768]">
                      <FaSearch className="text-3xl mb-2" />

                      <span className="text-xs">
                        Image unavailable
                      </span>
                    </div>
                  )}

                  {/* NEW ARRIVAL */}

                  {product.newArrival && (
                    <span className="absolute top-3 left-3 bg-[#6B4F3A] text-white text-[10px] font-semibold px-2 py-1 rounded">
                      NEW
                    </span>
                  )}

                  {/* BEST SELLER */}

                  {product.bestSeller && (
                    <span className="absolute bottom-3 left-3 bg-white text-[#5A4030] text-[10px] font-semibold px-2 py-1 rounded shadow-sm">
                      BEST SELLER
                    </span>
                  )}

                  {/* WISHLIST */}

                  <button
                    type="button"
                    aria-label={
                      isInWishlist(product.id)
                        ? "Remove from wishlist"
                        : "Add to wishlist"
                    }
                    disabled={wishlistLoading}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleWishlist(product);
                    }}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm hover:scale-110 transition disabled:opacity-60"
                  >
                    <FaHeart
                      className={
                        isInWishlist(product.id)
                          ? "text-[#5A4030]"
                          : "text-[#8A7768]"
                      }
                    />
                  </button>
                </div>

                {/* PRODUCT DETAILS */}

                <div className="p-3">
                  <h2
                    className="text-sm font-semibold text-[#5A4030] truncate cursor-pointer"
                    onClick={() =>
                      navigate(`/product/${product.id}`)
                    }
                    title={product.name}
                  >
                    {product.name}
                  </h2>

                  {product.category && (
                    <p className="text-xs text-[#6B4F3A] mt-1">
                      {product.category}
                    </p>
                  )}

                  {product.subCategory && (
                    <p className="text-xs text-[#8A7768]">
                      {product.subCategory}
                    </p>
                  )}

                  <p className="mt-2 font-bold text-[#5A4030]">
                    ₹{product.price.toLocaleString("en-IN")}
                  </p>

                  {product.stock <= 0 && (
                    <p className="text-xs text-[#5A4030] mt-1">
                      Out of stock
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default SearchResults;
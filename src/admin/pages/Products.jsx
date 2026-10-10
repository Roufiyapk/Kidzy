import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FaEdit, FaEye, FaTrash, FaUndo } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import api from "../../api/api";

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

const AGE_CATEGORIES = [
  "0–2 Years",
  "2–6 Years",
  "6–10 Years",
];

const SIZE_CATEGORIES = [
  "0–6 Months",
  "6–12 Months",
  "12–16 Months",
  "16–24 Months",
  "2–3 Years",
  "3–4 Years",
  "4–5 Years",
  "5–6 Years",
  "6–7 Years",
  "7–8 Years",
  "8–9 Years",
  "9–10 Years",
];

const SIZE_CATEGORY_MAP = {
  "0–2 Years": SIZE_CATEGORIES.slice(0, 4),
  "2–6 Years": SIZE_CATEGORIES.slice(4, 8),
  "6–10 Years": SIZE_CATEGORIES.slice(8),
};

const SIZE_PRODUCT_CATEGORIES = ["Girls", "Boys", "Footwear"];

const GENDER_CATEGORIES = [
  "Footwear",
  "Kids Accessories",
  "School Supplies",
];

const hasSizesForCategory = (category) =>
  SIZE_PRODUCT_CATEGORIES.includes(category);

const hasAgeForCategory = (category) =>
  SIZE_PRODUCT_CATEGORIES.includes(category);

const hasGenderForCategory = (category) =>
  GENDER_CATEGORIES.includes(category);

const getSizesForAgeCategory = (ageCategory) =>
  SIZE_CATEGORY_MAP[ageCategory] || [];

const normalizeName = (value) =>
  String(value || "").trim().toLowerCase();

const createEmptySize = (size = "") => ({
  size,
  stock: "",
});

const createEmptyAgeVariant = (ageCategory) => ({
  ageCategory,
  sizes: getSizesForAgeCategory(ageCategory).map(createEmptySize),
});

const createEmptyForm = () => ({
  id: null,
  name: "",
  price: "",
  originalPrice: "",
  category: "",
  categoryId: "",
  subCategory: "",
  subCategoryId: "",
  gender: "",
  description: "",
  bestSeller: false,
  newArrival: false,
  deleted: false,
  ageVariants: [],
  imageFiles: [],
  imagePreviews: [],
  existingImages: [],
  stock: "",
});

function Products() {
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [view, setView] = useState("active");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [productTypeFilter, setProductTypeFilter] = useState("all");

  const [confirm, setConfirm] = useState({
    open: false,
    type: null,
    id: null,
  });

  const [form, setForm] = useState(createEmptyForm());
  const [isSaving, setIsSaving] = useState(false);
  const savingRef = useRef(false);
  const limit = 5;

  const {
    data: productPage = {
      products: [],
      currentPage: 1,
      pageSize: limit,
      totalProducts: 0,
      totalPages: 1,
    },
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["products", view, search, availabilityFilter, productTypeFilter, page, limit],
    queryFn: async () => {
      const response = await api.get("/products", {
        params: {
          Search: search.trim() || undefined,
          Status: view === "trash" ? "trash" : "active",
          StockStatus:
            availabilityFilter === "all"
              ? undefined
              : {
                  inStock: "InStock",
                  lowStock: "LowStock",
                  outOfStock: "OutOfStock",
                }[availabilityFilter],
          BestSeller:
            productTypeFilter === "bestSeller" ? true : undefined,
          NewArrival:
            productTypeFilter === "newArrival" ? true : undefined,
          Page: page,
          PageSize: limit,
          SortBy: "Relevance",
        },
      });

      const body = response?.data?.data ?? response?.data ?? {};
      const data = body?.data ?? body;

      return {
        products: data?.products ?? data?.Products ?? [],
        currentPage: Number(
          data?.currentPage ?? data?.CurrentPage ?? page
        ),
        pageSize: Number(
          data?.pageSize ?? data?.PageSize ?? limit
        ),
        totalProducts: Number(
          data?.totalProducts ?? data?.TotalProducts ?? 0
        ),
        totalPages: Math.max(
          1,
          Number(data?.totalPages ?? data?.TotalPages ?? 1)
        ),
      };
    },
  });

  const products = Array.isArray(productPage.products)
    ? productPage.products
    : [];
  const getProductStock = (product) => {
    const variants = product?.variants ?? product?.Variants ?? [];

    if (Array.isArray(variants)) {
      const variantSizes = variants.flatMap((variant) => {
        const sizes = variant?.sizes ?? variant?.Sizes ?? [];
        return Array.isArray(sizes) ? sizes : [];
      });

      if (variantSizes.length > 0) {
        return variantSizes.reduce((total, item) => {
          const itemStock = Number(item?.stock ?? item?.Stock ?? 0);
          return total + (Number.isFinite(itemStock) ? Math.max(0, itemStock) : 0);
        }, 0);
      }
    }

    const directStock = Number(product?.stock ?? product?.Stock ?? 0);
    return Number.isFinite(directStock) ? Math.max(0, directStock) : 0;
  };
  const filteredProducts = products;

  const totalProducts = Number(productPage.totalProducts || 0);
  const totalPages = Math.max(1, Number(productPage.totalPages || 1));
  const currentPage = Math.min(page, totalPages);

  const normalizeCategoryResponse = (response) => {
    const root = response?.data ?? response ?? null;

    const unwrap = (value) => {
      if (Array.isArray(value)) return value;
      if (!value || typeof value !== "object") return [];

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
        if (Array.isArray(candidate)) return candidate;
        if (candidate && typeof candidate === "object") {
          const nested = unwrap(candidate);
          if (nested.length > 0) return nested;
        }
      }

      return [];
    };

    return unwrap(root)
      .filter(Boolean)
      .map((category) => {
        const rawSubCategories =
          category?.subCategories ??
          category?.SubCategories ??
          category?.subcategories ??
          category?.Subcategories ??
          [];

        return {
          id: category?.id ?? category?.Id ?? null,
          name: String(
            category?.name ?? category?.Name ?? ""
          ).trim(),
          subCategories: Array.isArray(rawSubCategories)
            ? rawSubCategories
                .filter(Boolean)
                .map((subCategory) => {
                  if (typeof subCategory === "string") {
                    return {
                      id: null,
                      name: subCategory.trim(),
                    };
                  }

                  return {
                    id:
                      subCategory?.id ??
                      subCategory?.Id ??
                      null,
                    name: String(
                      subCategory?.name ??
                        subCategory?.Name ??
                        ""
                    ).trim(),
                  };
                })
                .filter((item) => item.name)
            : [],
        };
      })
      .filter((category) => category.name);
  };

  const {
    data: backendCategories = [],
    isLoading: categoriesLoading,
    isError: categoriesError,
    error: categoryQueryError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        const response = await api.get("/categories");
        const categories = normalizeCategoryResponse(response);

        if (categories.length === 0) {
          throw new Error(
            "The /api/categories endpoint returned no categories."
          );
        }

        return categories;
      } catch (error) {
        console.error(
          "Failed to load categories from /api/categories:",
          error
        );

        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const selectedCategory = backendCategories.find(
    (item) =>
      String(item.id ?? item.Id ?? "") ===
        String(form.categoryId ?? "") ||
      normalizeName(item.name ?? item.Name) ===
        normalizeName(form.category)
  );

  const selectedSubCategories =
    selectedCategory?.subCategories ?? [];

  const categoryNames = backendCategories
    .map((item) => item.name)
    .filter(Boolean);

  const openAdd = () => {
    setForm(createEmptyForm());
    setEditing(false);
    setShowDetails(false);
    setShowForm(true);
    setPage(1);
  };

  const handleCategoryChange = (event) => {
    const category = event.target.value;

    const backendCategory = backendCategories.find(
      (item) =>
        normalizeName(item.name ?? item.Name) ===
        normalizeName(category)
    );

    setForm((previous) => ({
      ...previous,
      category,
      categoryId: backendCategory?.id ?? backendCategory?.Id ?? "",
      subCategory: "",
      subCategoryId: "",
      gender: "",
      ageVariants: [],
      stock: "",
    }));
  };

  const addAgeCategory = (ageCategory) => {
    setForm((previous) => {
      if (!ageCategory) return previous;

      if (
        previous.ageVariants.some(
          (item) => item.ageCategory === ageCategory
        )
      ) {
        return previous;
      }

      return {
        ...previous,
        ageVariants: [
          ...previous.ageVariants,
          createEmptyAgeVariant(ageCategory),
        ],
      };
    });
  };

  const removeAgeCategory = (ageCategory) => {
    setForm((previous) => ({
      ...previous,
      ageVariants: previous.ageVariants.filter(
        (item) => item.ageCategory !== ageCategory
      ),
    }));
  };

  const handleAgeCategoryChange = (event) => {
    const ageCategory = event.target.value;
    addAgeCategory(ageCategory);
    event.target.value = "";
  };

  const handleSizeStockChange = (
    ageCategory,
    size,
    value
  ) => {
    setForm((previous) => ({
      ...previous,
      ageVariants: previous.ageVariants.map((variant) =>
        variant.ageCategory !== ageCategory
          ? variant
          : {
              ...variant,
              sizes: variant.sizes.map((item) =>
                item.size === size
                  ? { ...item, stock: value }
                  : item
              ),
            }
      ),
    }));
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    if (name === "subCategory") {
      const selected = selectedSubCategories.find(
        (item) =>
          normalizeName(item.name) ===
          normalizeName(value)
      );

      setForm((previous) => ({
        ...previous,
        subCategory: value,
        subCategoryId: selected?.id ?? selected?.Id ?? "",
      }));
      return;
    }

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageFiles = (event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    const previews = files.map((file) => URL.createObjectURL(file));

    setForm((previous) => ({
      ...previous,
      imageFiles: [...previous.imageFiles, ...files],
      imagePreviews: [...previous.imagePreviews, ...previews],
    }));

    event.target.value = "";
  };

  const removeNewImage = (index) => {
    setForm((previous) => ({
      ...previous,
      imageFiles: previous.imageFiles.filter(
        (_, fileIndex) => fileIndex !== index
      ),
      imagePreviews: previous.imagePreviews.filter(
        (_, fileIndex) => fileIndex !== index
      ),
    }));
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      notify("error", "Product name is required.");
      return false;
    }

    if (!form.category) {
      notify("error", "Please select a category.");
      return false;
    }
    if (selectedSubCategories.length > 0 && !form.subCategory) {
      notify("error", "Please select a subcategory.");
      return false;
    }

    if (form.price === "" || Number(form.price) <= 0) {
      notify("error", "Price must be greater than zero.");
      return false;
    }

    if (
      hasAgeForCategory(form.category) &&
      form.ageVariants.length === 0
    ) {
      notify("error", "Please select at least one age category.");
      return false;
    }

    if (hasGenderForCategory(form.category) && !form.gender) {
      notify("error", "Please select gender.");
      return false;
    }

    if (hasSizesForCategory(form.category)) {
      for (const variant of form.ageVariants) {
        if (!variant.sizes.length) {
          notify("error", 
            `No sizes found for ${variant.ageCategory}.`
          );
          return false;
        }

        for (const item of variant.sizes) {
          if (
            item.stock === "" ||
            Number(item.stock) < 0
          ) {
            notify("error", 
              `Enter valid stock for ${variant.ageCategory} - ${item.size}.`
            );
            return false;
          }
        }
      }
    } else if (form.stock === "" || Number(form.stock) < 0) {
      notify("error", "Please enter a valid stock.");
      return false;
    }

    if (!editing && form.imageFiles.length === 0) {
      notify("error", "Please select at least one product image.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (savingRef.current) return;
    if (!validateForm()) return;

    savingRef.current = true;
    setIsSaving(true);

    try {
      const categoryId = form.categoryId || selectedCategory?.id || selectedCategory?.Id;
      const selectedSubCategory = selectedSubCategories.find(
        (item) =>
          normalizeName(item.name) ===
          normalizeName(form.subCategory)
      );
      const subCategoryId =
        form.subCategoryId ||
        selectedSubCategory?.id ||
        selectedSubCategory?.Id;

      if (!categoryId) {
        throw new Error("Category ID was not found from the backend.");
      }
      if (selectedSubCategories.length > 0 && form.subCategory && !subCategoryId) {
        notify("error", "The selected subcategory ID could not be found. Reload categories and try again.");
        return;
      }

      const formData = new FormData();

      formData.append("Name", form.name.trim());
      formData.append("Description", form.description.trim());
      formData.append("Price", String(Number(form.price)));
      formData.append("CategoryId", String(categoryId));
      if (form.subCategory && subCategoryId) {
        formData.append("SubCategoryId", String(subCategoryId));
      }
      formData.append(
        "BestSeller",
        String(Boolean(form.bestSeller))
      );
      formData.append(
        "NewArrival",
        String(Boolean(form.newArrival))
      );

      const totalStock = hasSizesForCategory(form.category)
        ? form.ageVariants.reduce(
            (total, variant) =>
              total +
              variant.sizes.reduce(
                (sum, item) => sum + Number(item.stock || 0),
                0
              ),
            0
          )
        : Number(form.stock || 0);

      formData.append("Stock", String(totalStock));

      if (form.gender) {
        formData.append("Gender", form.gender);
      }
      form.imageFiles.forEach((image) => {
        formData.append("Images", image);
      });

      form.ageVariants.forEach((variant, ageIndex) => {
        formData.append(
          `Variants[${ageIndex}].AgeGroup`,
          variant.ageCategory
        );

        variant.sizes.forEach((item, sizeIndex) => {
          formData.append(
            `Variants[${ageIndex}].Sizes[${sizeIndex}].Size`,
            item.size
          );
          formData.append(
            `Variants[${ageIndex}].Sizes[${sizeIndex}].Stock`,
            String(Number(item.stock || 0))
          );
        });
      });

      if (editing) {
        await api.put(`/products/${form.id}`, formData, {
          headers: { "Content-Type": undefined },
        });
        notify("success", "Product updated successfully.");
      } else {
        await api.post("/products", formData, {
          headers: { "Content-Type": undefined },
        });
        notify("success", "Product added successfully.");
      }

      await queryClient.invalidateQueries({
        queryKey: ["products"],
      });

      setShowForm(false);
      setEditing(false);
      setForm(createEmptyForm());
    } catch (error) {
      console.error("Product save error:", error);
      notify("error",
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong while saving the product."
      );
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  };

  const openDetails = (product) => {
    setSelectedProduct(product);
    setShowDetails(true);
  };

  const handleEdit = (product) => {
    const category =
      product.categoryName ??
      product.CategoryName ??
      product.category ??
      "";

    const subCategory =
      product.subCategory ??
      product.SubCategory ??
      product.subCategoryName ??
      "";

    const variants = Array.isArray(product.variants)
      ? product.variants
      : Array.isArray(product.Variants)
      ? product.Variants
      : [];

    const ageVariants = variants.map((variant) => {
      const ageCategory =
        variant?.ageGroup ?? variant?.AgeGroup ?? "";

      const variantSizes = Array.isArray(variant?.sizes)
        ? variant.sizes
        : Array.isArray(variant?.Sizes)
        ? variant.Sizes
        : [];

      const backendSizes = variantSizes.map((item) => ({
        size: String(item?.size ?? item?.Size ?? ""),
        stock: String(item?.stock ?? item?.Stock ?? ""),
      }));

      const allowedSizes = getSizesForAgeCategory(ageCategory);
      const sizes = allowedSizes.length
        ? allowedSizes.map((size) => ({
            size,
            stock:
              backendSizes.find(
                (item) => item.size === size
              )?.stock ?? "",
          }))
        : backendSizes;

      return {
        ageCategory,
        sizes,
      };
    });

    const imageUrl =
      product.imageUrl ??
      product.ImageUrl ??
      product.image ??
      "";

    setForm({
      id: product.id ?? product.Id ?? null,
      name: product.name ?? product.Name ?? "",
      price: product.price ?? product.Price ?? "",
      originalPrice: "",
      category,
      categoryId: product.categoryId ?? product.CategoryId ?? "",
      subCategory,
      subCategoryId:
        product.subCategoryId ??
        product.SubCategoryId ??
        "",
      gender: product.gender ?? product.Gender ?? "",
      description:
        product.description ?? product.Description ?? "",
      bestSeller: Boolean(
        product.bestSeller ?? product.BestSeller
      ),
      newArrival: Boolean(
        product.newArrival ?? product.NewArrival
      ),
      deleted: Boolean(product.deleted ?? product.Deleted),
      ageVariants,
      imageFiles: [],
      imagePreviews: [],
      existingImages: imageUrl ? [imageUrl] : [],
      stock: String(product.stock ?? product.Stock ?? ""),
    });

    setEditing(true);
    setShowDetails(false);
    setShowForm(true);
  };

  const openConfirm = (type, id) => {
    setConfirm({ open: true, type, id });
  };

  const handleConfirm = async () => {
    try {
      if (confirm.type === "delete") {
        await api.put(`/products/${confirm.id}/trash`);
        notify("success", "Product moved to trash.");
      }

      if (confirm.type === "restore") {
        await api.put(`/products/${confirm.id}/restore`);
        notify("success", "Product restored.");
      }

      if (confirm.type === "permanentDelete") {
        await api.delete(`/products/${confirm.id}`);
        notify("success", "Product permanently deleted.");
      }

      await queryClient.invalidateQueries({
        queryKey: ["products"],
      });

      setConfirm({ open: false, type: null, id: null });
    } catch (error) {
      console.error("Product action error:", error);
      notify("error", 
        error?.response?.data?.message ||
          "Action failed."
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F1EAE1] flex items-center justify-center">
        <p className="text-[#817467]">Loading products...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-[#F1EAE1] p-6">
        <p className="text-red-500">
          Failed to load products.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1EAE1] p-3 sm:p-6">
      <ToastContainer
        position="bottom-center"
        autoClose={1800}
        hideProgressBar
        closeButton={false}
        icon={false}
        newestOnTop
        limit={3}
        toastStyle={{
          background: "#FFF9F3",
          color: "#5A4030",
          border: "1px solid #E7DED5",
          borderRadius: "12px",
          boxShadow: "0 4px 16px rgba(90, 64, 48, 0.12)",
          fontSize: "14px",
          fontWeight: 500,
        }}
      />
      {confirm.open && (
        <div className="fixed inset-0 bg-[#30251F]/40 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-2xl border border-[#E7DDD2] shadow-xl w-full max-w-sm p-6 text-center">
            <h2 className="text-xl font-bold text-[#3F3026]">
              {confirm.type === "delete"
                ? "Move Product to Trash?"
                : confirm.type === "restore"
                ? "Restore Product?"
                : "Delete Product Permanently?"}
            </h2>
            <p className="text-sm text-[#817467] mt-2">
              {confirm.type === "delete"
                ? "This product will be moved to Trash."
                : confirm.type === "restore"
                ? "This product will be restored."
                : "This action cannot be undone."}
            </p>
            <div className="flex justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() =>
                  setConfirm({
                    open: false,
                    type: null,
                    id: null,
                  })
                }
                className="px-5 py-2 rounded-xl border border-[#E0D5CA] hover:bg-[#FAF7F2]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className={`px-5 py-2 rounded-xl text-white ${
                  confirm.type === "restore"
                    ? "bg-[#426B42] hover:bg-[#345734]"
                    : "bg-[#A13F39] hover:bg-[#8E332E]"
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetails && selectedProduct && (
        <div className="fixed inset-0 bg-[#30251F]/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl border border-[#E7DDD2] shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto p-5 sm:p-7">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-[#3F3026]">
                  Product Details
                </h2>
                <p className="text-sm text-[#817467] mt-1">
                  Complete product information and variants
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDetails(false)}
                className="text-[#817467] hover:text-black text-2xl"
              >
                ✕
              </button>
            </div>

            {(() => {
              const product = selectedProduct;
              const variants = Array.isArray(product.variants)
                ? product.variants
                : Array.isArray(product.Variants)
                ? product.Variants
                : [];
              const image =
                product.imageUrl ??
                product.ImageUrl ??
                product.image ??
                "";

              return (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
                    <div>
                      <img
                        src={image}
                        alt={product.name ?? product.Name}
                        className="w-full h-64 object-cover rounded-2xl border"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <DetailItem
                        label="Product Name"
                        value={product.name ?? product.Name}
                      />
                      <DetailItem
                        label="Price"
                        value={`₹${Number(
                          product.price ?? product.Price ?? 0
                        ).toLocaleString("en-IN")}`}
                      />
                      <DetailItem
                        label="Category"
                        value={
                          product.categoryName ??
                          product.CategoryName ??
                          product.category ??
                          "-"
                        }
                      />
                      <DetailItem
                        label="Subcategory"
                        value={
                          product.subCategory ??
                          product.SubCategory ??
                          "-"
                        }
                      />
                      <DetailItem
                        label="Gender"
                        value={product.gender ?? product.Gender ?? "-"}
                      />
                      <DetailItem
                        label="Stock"
                        value={String(getProductStock(product))}
                      />
                      <DetailItem
                        label="Best Seller"
                        value={
                          product.bestSeller ?? product.BestSeller
                            ? "Yes"
                            : "No"
                        }
                      />
                      <DetailItem
                        label="New Arrival"
                        value={
                          product.newArrival ?? product.NewArrival
                            ? "Yes"
                            : "No"
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-[#3F3026] mb-2">
                      Description
                    </h3>
                    <div className="bg-[#FAF7F2] rounded-xl p-4 text-sm text-[#5A4030] whitespace-pre-wrap">
                      {product.description ??
                        product.Description ??
                        "No description"}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-[#3F3026] mb-3">
                      Age Categories & Stock
                    </h3>

                    {variants.length === 0 ? (
                      <p className="text-sm text-[#817467]">
                        No variants available.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {variants.map((variant, index) => {
                          const ageGroup =
                            variant.ageGroup ??
                            variant.AgeGroup ??
                            "-";
                          const sizes =
                            variant.sizes ??
                            variant.Sizes ??
                            [];

                          return (
                            <div
                              key={`${ageGroup}-${index}`}
                              className="border border-[#E7DDD2] rounded-2xl overflow-hidden"
                            >
                              <div className="bg-[#F5F0E9] px-4 py-3 font-semibold">
                                {ageGroup}
                              </div>
                              <div className="overflow-x-auto">
                                <table className="w-full">
                                  <thead>
                                    <tr className="border-b">
                                      <th className="p-3 text-left text-sm">
                                        Size
                                      </th>
                                      <th className="p-3 text-left text-sm">
                                        Stock
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {sizes.map((item, sizeIndex) => (
                                      <tr
                                        key={`${item.id ?? sizeIndex}`}
                                        className="border-b last:border-b-0"
                                      >
                                        <td className="p-3 text-sm">
                                          {item.size ?? item.Size}
                                        </td>
                                        <td className="p-3 text-sm">
                                          {item.stock ?? item.Stock ?? 0}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowDetails(false)}
                      className="border border-[#E0D5CA] px-5 py-2 rounded-xl hover:bg-[#FAF7F2]"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEdit(product)}
                      className="bg-[#30251F] text-white px-5 py-2 rounded-xl hover:bg-[#443329]"
                    >
                      Edit Product
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#3F3026]">
            Products
          </h1>
          <p className="text-sm text-[#817467] mt-1">
            Manage Kidzy products
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            className="border border-[#E0D5CA] bg-white px-4 py-2 rounded-xl w-full sm:w-72 outline-none"
          />

          <button
            type="button"
            onClick={() => {
              setView("active");
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl border ${
              view === "active"
                ? "bg-[#30251F] text-white"
                : "bg-white hover:bg-[#FAF7F2]"
            }`}
          >
            Active
          </button>

          <button
            type="button"
            onClick={() => {
              setView("trash");
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl border ${
              view === "trash"
                ? "bg-[#30251F] text-white"
                : "bg-white hover:bg-[#FAF7F2]"
            }`}
          >
            Trash
          </button>

          <select
            value={availabilityFilter}
            onChange={(event) => {
              setAvailabilityFilter(event.target.value);
              setPage(1);
            }}
            aria-label="Filter by stock availability"
            className="border border-[#E0D5CA] bg-white px-3 py-2 rounded-xl outline-none"
          >
            <option value="all">All Availability</option>
            <option value="inStock">In Stock (&gt; 10)</option>
            <option value="lowStock">Low Stock (1–10)</option>
            <option value="outOfStock">Out of Stock (0)</option>
          </select>

          <select
            value={productTypeFilter}
            onChange={(event) => {
              setProductTypeFilter(event.target.value);
              setPage(1);
            }}
            aria-label="Filter by product type"
            className="border border-[#E0D5CA] bg-white px-3 py-2 rounded-xl outline-none"
          >
            <option value="all">All Products</option>
            <option value="bestSeller">Best Sellers</option>
            <option value="newArrival">New Drops</option>
          </select>

          <button
            type="button"
            onClick={openAdd}
            className="bg-[#30251F] text-white px-4 py-2 rounded-xl hover:bg-[#443329]"
          >
            Add Product
          </button>
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-[#E7DDD2] shadow-sm p-4 sm:p-6 mb-6 space-y-5"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">
              {editing ? "Edit Product" : "Add Product"}
            </h2>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditing(false);
              }}
              className="text-[#817467] hover:text-black text-xl"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="name"
              placeholder="Product Name"
              value={form.name}
              onChange={handleChange}
              className="border border-[#E0D5CA] p-3 rounded-xl w-full outline-none"
            />

            <input
              type="number"
              name="price"
              placeholder="Selling Price"
              min="0"
              value={form.price}
              onChange={handleChange}
              className="border border-[#E0D5CA] p-3 rounded-xl w-full outline-none"
            />

            <select
              value={form.category}
              onChange={handleCategoryChange}
              disabled={categoriesLoading || categoriesError || categoryNames.length === 0}
              className="border border-[#E0D5CA] p-3 rounded-xl w-full bg-white outline-none disabled:bg-[#F5F0E9]"
            >
              <option value="">
                {categoriesLoading
                  ? "Loading categories..."
                  : categoriesError
                  ? "Unable to load categories"
                  : categoryNames.length === 0
                  ? "No categories found"
                  : "Select Category"}
              </option>
              {categoryNames.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            {}
            {selectedSubCategories.length > 0 && (
              <select
                name="subCategory"
                value={form.subCategory}
                onChange={handleChange}
                className="border border-[#E0D5CA] p-3 rounded-xl w-full bg-white outline-none"
              >
                <option value="">Select Subcategory (optional)</option>
                {selectedSubCategories.map((subCategory) => {
                  const subCategoryName = subCategory.name;
                  return (
                    <option
                      key={subCategory.id ?? subCategoryName}
                      value={subCategoryName}
                    >
                      {subCategoryName}
                    </option>
                  );
                })}
              </select>
            )}

            {hasGenderForCategory(form.category) && (
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="border border-[#E0D5CA] p-3 rounded-xl w-full bg-white outline-none"
              >
                <option value="">Select Gender</option>
                <option value="Boys">Boys</option>
                <option value="Girls">Girls</option>
              </select>
            )}
          </div>

          {hasAgeForCategory(form.category) && (
            <div className="border border-[#E7DDD2] rounded-2xl p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div>
                  <h3 className="font-semibold text-[#3F3026]">
                    Age Categories
                  </h3>
                  <p className="text-xs text-[#817467] mt-1">
                    You can add multiple age categories to the same product.
                  </p>
                </div>

                <select
                  value=""
                  onChange={handleAgeCategoryChange}
                  className="border border-[#E0D5CA] p-3 rounded-xl bg-white min-w-[220px]"
                >
                  <option value="">+ Add Age Category</option>
                  {AGE_CATEGORIES.filter(
                    (age) =>
                      !form.ageVariants.some(
                        (variant) => variant.ageCategory === age
                      )
                  ).map((age) => (
                    <option key={age} value={age}>
                      {age}
                    </option>
                  ))}
                </select>
              </div>

              {form.ageVariants.length === 0 ? (
                <p className="text-sm text-[#817467]">
                  No age category selected yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {form.ageVariants.map((variant) => (
                    <div
                      key={variant.ageCategory}
                      className="border border-[#E7DDD2] rounded-2xl p-4"
                    >
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <h4 className="font-semibold text-[#3F3026]">
                          {variant.ageCategory}
                        </h4>
                        <button
                          type="button"
                          onClick={() =>
                            removeAgeCategory(variant.ageCategory)
                          }
                          className="text-red-600 text-sm hover:text-red-800"
                        >
                          Remove Age Category
                        </button>
                      </div>

                      <div className="space-y-2">
                        {variant.sizes.map((item) => (
                          <div
                            key={item.size}
                            className="grid grid-cols-[1fr_1fr] gap-3"
                          >
                            <div className="border border-[#E0D5CA] p-3 rounded-xl bg-[#FAF7F2]">
                              {item.size}
                            </div>
                            <input
                              type="number"
                              min="0"
                              placeholder="Stock"
                              value={item.stock}
                              onChange={(event) =>
                                handleSizeStockChange(
                                  variant.ageCategory,
                                  item.size,
                                  event.target.value
                                )
                              }
                              className="border border-[#E0D5CA] p-3 rounded-xl"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!hasSizesForCategory(form.category) && (
            <div>
              <label className="block text-sm font-medium text-[#5A4030] mb-2">
                Stock
              </label>
              <input
                type="number"
                name="stock"
                min="0"
                placeholder="Enter stock quantity"
                value={form.stock}
                onChange={handleChange}
                className="border border-[#E0D5CA] p-3 rounded-xl w-full outline-none"
              />
            </div>
          )}

          <div className="border border-[#E7DDD2] rounded-2xl p-4">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-semibold text-[#3F3026]">
                  Product Images
                </h3>
                <p className="text-xs text-[#817467] mt-1">
                  Select images directly from your computer. They are uploaded to Cloudinary by the backend.
                </p>
              </div>

              <label className="bg-[#30251F] text-white px-4 py-2 rounded-xl cursor-pointer hover:bg-[#443329]">
                + Add Images
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageFiles}
                  className="hidden"
                />
              </label>
            </div>

            {form.existingImages.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-[#817467] mb-2">
                  Existing Cloudinary image
                </p>
                <div className="flex flex-wrap gap-3">
                  {form.existingImages.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt="Existing product"
                      className="w-24 h-24 object-cover rounded-xl border"
                    />
                  ))}
                </div>
              </div>
            )}

            {form.imagePreviews.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {form.imagePreviews.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Selected ${index + 1}`}
                      className="w-24 h-24 object-cover rounded-xl border"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 text-white text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {form.imageFiles.length === 0 &&
              form.existingImages.length === 0 && (
                <p className="text-sm text-[#817467]">
                  No image selected.
                </p>
              )}
          </div>

          <textarea
            name="description"
            placeholder="Product Description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="border border-[#E0D5CA] p-3 rounded-xl w-full outline-none resize-none"
          />

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="bestSeller"
                checked={form.bestSeller}
                onChange={handleChange}
              />
              <span>Best Seller</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="newArrival"
                checked={form.newArrival}
                onChange={handleChange}
              />
              <span>New Arrival</span>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-[#30251F] text-white px-5 py-3 rounded-xl hover:bg-[#443329] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving
                ? editing ? "Updating Product..." : "Adding Product..."
                : editing ? "Update Product" : "Add Product"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditing(false);
              }}
              className="border border-[#E0D5CA] px-5 py-3 rounded-xl hover:bg-[#FAF7F2]"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl border border-[#E7DDD2] shadow-sm overflow-x-auto">
        <table className="w-full min-w-[920px]">
          <thead className="bg-[#F5F0E9]">
            <tr>
              <th className="p-3 text-left">Image</th>
              <th className="p-3 text-left">Product</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Stock</th>
              <th className="p-3 text-left">Price</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-10 text-center text-[#817467]">
                  No products match the selected filters.
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr
                  key={product.id ?? product.Id}
                  className="border-t hover:bg-[#FAF7F2]"
                >
                  <td className="p-3">
                    <img
                      src={
                        product.imageUrl ??
                        product.ImageUrl ??
                        product.image ??
                        ""
                      }
                      alt={product.name ?? product.Name}
                      className="w-14 h-14 object-cover rounded-xl border"
                    />
                  </td>

                  <td className="p-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">
                        {product.name ?? product.Name}
                      </span>
                    </div>
                    <p className="text-xs text-[#817467] mt-1">
                      {product.subCategory ??
                        product.SubCategory ??
                        ""}
                    </p>
                  </td>

                  <td className="p-3">
                    <span className="bg-[#F5F0E9] px-3 py-1 rounded-full text-sm">
                      {product.categoryName ??
                        product.CategoryName ??
                        product.category ??
                        "-"}
                    </span>
                  </td>

                  <td className="p-3">
                    {(() => {
                      const stock = getProductStock(product);

                      return (
                        <div className="flex flex-col items-start gap-1">
                          <span className="font-semibold text-[#3F3026]">
                            {stock} {stock === 1 ? "item" : "items"}
                          </span>
                          {stock <= 0 && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-[#FBEDEC] text-[#A13F39]">
                              Out of Stock
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </td>

                  <td className="p-3 font-medium">
                    ₹
                    {Number(
                      product.price ?? product.Price ?? 0
                    ).toLocaleString("en-IN")}
                  </td>

                  <td className="p-3">
                    <div className="flex justify-center items-center gap-4">
                      <button
                        type="button"
                        title="View Product Details"
                        onClick={() => openDetails(product)}
                        className="text-[#5A4030] hover:text-black"
                      >
                        <FaEye />
                      </button>

                      {view === "active" ? (
                        <>
                          <button
                            type="button"
                            title="Edit Product"
                            onClick={() => handleEdit(product)}
                            className="text-[#5A4030] hover:text-[#30251F]"
                          >
                            <FaEdit />
                          </button>
                          <button
                            type="button"
                            title="Move to Trash"
                            onClick={() =>
                              openConfirm(
                                "delete",
                                product.id ?? product.Id
                              )
                            }
                            className="text-[#A13F39] hover:text-[#8E332E]"
                          >
                            <FaTrash />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            title="Restore Product"
                            onClick={() =>
                              openConfirm(
                                "restore",
                                product.id ?? product.Id
                              )
                            }
                            className="text-[#426B42] hover:text-[#345734]"
                          >
                            <FaUndo />
                          </button>
                          <button
                            type="button"
                            title="Delete Permanently"
                            onClick={() =>
                              openConfirm(
                                "permanentDelete",
                                product.id ?? product.Id
                              )
                            }
                            className="text-[#A13F39] hover:text-[#8E332E]"
                          >
                            <FaTrash />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalProducts > 0 && (
        <div className="flex justify-center items-center mt-6 gap-2 flex-wrap">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            className="border bg-white px-4 py-2 rounded-xl disabled:opacity-50"
          >
            Prev
          </button>

          {Array.from({ length: totalPages }, (_, index) => index + 1).map(
            (pageNumber) => (
              <button
                type="button"
                key={pageNumber}
                onClick={() => setPage(pageNumber)}
                className={`border px-4 py-2 rounded-xl ${
                  currentPage === pageNumber
                    ? "bg-[#30251F] text-white"
                    : "bg-white hover:bg-[#FAF7F2]"
                }`}
              >
                {pageNumber}
              </button>
            )
          )}

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() =>
              setPage((value) => Math.min(totalPages, value + 1))
            }
            className="border bg-white px-4 py-2 rounded-xl disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="border border-[#E7DDD2] rounded-xl p-3">
      <p className="text-xs text-[#817467]">{label}</p>
      <p className="font-medium text-[#3F3026] mt-1 break-words">
        {value || "-"}
      </p>
    </div>
  );
}

export default Products;

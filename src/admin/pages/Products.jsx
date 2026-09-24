import { useMemo, useState } from "react";
import {
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { FaEdit, FaTrash, FaUndo } from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../api/api";

const CATEGORY_DATA = {
  Girls: [
    "Dresses",
    "Tops",
    "Bottoms",
    "Ethnic Wear",
    "Party Wear",
  ],
  Boys: [
    "T-Shirts",
    "Shirts",
    "Pants",
    "Ethnic Wear",
    "Party Wear",
  ],
  Toys: [
    "Educational Toys",
    "Soft Toys",
    "Dolls",
    "Cars & Vehicles",
  ],
  "Kids Accessories": [
    "Bags",
    "Caps",
    "Hair Accessories",
    "Watches",
    "Sunglasses",
  ],
  "School Supplies": [
    "School Bags",
    "Water Bottles",
    "Lunch Boxes",
  ],
  Footwear: [
    "Sneakers",
    "Sandals",
    "School Shoes",
    "Casual Shoes",
    "Boots",
  ],
  Books: [
    "Story Books",
    "Coloring Books",
    "Activity Books",
    "Educational Books",
  ],
  "Kids Care": [
    "Bath & Body",
    "Personal Care",
  ],
  Activities: [
    "Arts & Crafts",
    "DIY Kits",
    "Puzzles",
  ],
};

const CATEGORY_NAMES = Object.keys(CATEGORY_DATA);

const CLOTHING_AGES = [
  "0–2 Years",
  "2–4 Years",
  "4–6 Years",
  "6–8 Years",
  "8–10 Years",
];

const FOOTWEAR_AGES = [
  "0–2 Years",
  "2–5 Years",
  "5–8 Years",
  "8–10 Years",
];

const GENDER_CATEGORIES = [
  "Footwear",
  "Kids Accessories",
  "School Supplies",
];

const SIZE_CATEGORIES = ["Girls", "Boys", "Footwear"];

const CLOTHING_SIZES = ["S", "M", "L", "XL", "XXL"];

const FOOTWEAR_SIZES = Array.from(
  { length: 20 },
  (_, index) => String(16 + index)
);

const getFootwearSizesForAge = (ageOrAges) => {
  const ranges = {
    "0–2 Years": [16, 20],
    "2–5 Years": [21, 27],
    "5–8 Years": [28, 32],
    "8–10 Years": [33, 35],
  };

  const ages = Array.isArray(ageOrAges)
    ? ageOrAges
    : ageOrAges
    ? [ageOrAges]
    : [];

  if (ages.length === 0) {
    return [];
  }

  const selectedRanges = ages
    .map((age) => ranges[age])
    .filter(Boolean);

  if (selectedRanges.length === 0) {
    return [];
  }

  return FOOTWEAR_SIZES.filter((size) => {
    const numericSize = Number(size);

    return selectedRanges.some(([start, end]) =>
      numericSize >= start && numericSize <= end
    );
  });
};

const normalizeAge = (age) => {
  if (Array.isArray(age)) {
    return age.filter(Boolean);
  }

  return age ? [age] : [];
};

const createEmptySize = (size = "") => ({
  size,
  stock: "",
});

const createDefaultSizes = (category = "") => {
  if (category === "Footwear") {
    return FOOTWEAR_SIZES.slice(0, 4).map((size) =>
      createEmptySize(size)
    );
  }

  if (category === "Girls" || category === "Boys") {
    return CLOTHING_SIZES.map((size) =>
      createEmptySize(size)
    );
  }

  return [];
};

const createEmptyForm = () => ({
  id: null,
  name: "",
  price: "",
  originalPrice: "",
  category: "",
  subCategory: "",
  gender: "",
  age: [],
  image: "",
  images: [""],
  description: "",
  stock: "",
  bestSeller: false,
  newArrival: false,
  sizes: [],
  deleted: false,
});

const hasSizesForCategory = (category) =>
  SIZE_CATEGORIES.includes(category);

const hasGenderForCategory = (category) =>
  GENDER_CATEGORIES.includes(category);

const hasAgeForCategory = (category) =>
  category === "Girls" ||
  category === "Boys" ||
  category === "Footwear";

function Products() {
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [view, setView] = useState("active");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const [confirm, setConfirm] = useState({
    open: false,
    type: null,
    id: null,
  });

  const [form, setForm] = useState(createEmptyForm());

  const limit = 5;

  // FETCH PRODUCTS
  const {
    data: products = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await api.get("/products");
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const selectedSubCategories = useMemo(() => {
    return CATEGORY_DATA[form.category] || [];
  }, [form.category]);

  // OPEN ADD FORM
  const openAdd = () => {
    setForm({
      ...createEmptyForm(),
      sizes: [],
    });
    setEditing(false);
    setShowForm(true);
    setPage(1);
  };

  // IMAGE HANDLERS
  const handleImageChange = (index, value) => {
    setForm((previous) => {
      const updatedImages = [...previous.images];

      updatedImages[index] = value;

      return {
        ...previous,
        images: updatedImages,
      };
    });
  };

  const addImage = () => {
    setForm((previous) => ({
      ...previous,
      images: [...previous.images, ""],
    }));
  };

  const removeImage = (index) => {
    setForm((previous) => {
      const updatedImages = previous.images.filter(
        (_, imageIndex) => imageIndex !== index
      );

      return {
        ...previous,
        images: updatedImages.length > 0 ? updatedImages : [""],
      };
    });
  };

  // CATEGORY CHANGE
  const handleCategoryChange = (e) => {
    const category = e.target.value;

    setForm((previous) => ({
      ...previous,
      category,
      subCategory: "",
      gender: "",
      age: [],
      stock: "",
      sizes:
        category === "Footwear"
          ? []
          : createDefaultSizes(category),
    }));
  };

  // AGE CHANGE - UNLIMITED AGE GROUP SELECTION
  const handleAgeToggle = (age) => {
    setForm((previous) => {
      const currentAges = normalizeAge(previous.age);
      const nextAges = currentAges.includes(age)
        ? currentAges.filter((item) => item !== age)
        : [...currentAges, age];

      if (previous.category !== "Footwear") {
        return {
          ...previous,
          age: nextAges,
        };
      }

      const allowedSizes = getFootwearSizesForAge(nextAges);
      const previousStocks = new Map(
        (previous.sizes || []).map((item) => [
          String(item.size),
          item.stock,
        ])
      );

      return {
        ...previous,
        age: nextAges,
        sizes: allowedSizes.map((size) => ({
          size,
          stock: previousStocks.get(String(size)) ?? "",
        })),
      };
    });
  };

  // NORMAL INPUT CHANGE
  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // SIZE CHANGE
  const handleSizeChange = (index, field, value) => {
    setForm((previous) => {
      const updatedSizes = [...previous.sizes];

      updatedSizes[index] = {
        ...updatedSizes[index],
        [field]: value,
      };

      return {
        ...previous,
        sizes: updatedSizes,
      };
    });
  };

  // ADD SIZE ROW
  const addSize = () => {
    setForm((previous) => ({
      ...previous,
      sizes: [...previous.sizes, createEmptySize()],
    }));
  };

  // REMOVE SIZE ROW
  const removeSize = (index) => {
    setForm((previous) => ({
      ...previous,
      sizes: previous.sizes.filter((_, sizeIndex) => sizeIndex !== index),
    }));
  };

  // EDIT PRODUCT
  const handleEdit = (product) => {
    const category = product.category || "";

    const productAges = normalizeAge(product.age);

    const existingSizes =
      Array.isArray(product.sizes) && product.sizes.length > 0
        ? product.sizes.map((item) => ({
            size: String(item.size ?? ""),
            stock: String(item.stock ?? ""),
          }))
        : category === "Footwear" && productAges.length > 0
        ? getFootwearSizesForAge(productAges).map((size) => ({
            size,
            stock: "",
          }))
        : createDefaultSizes(category);

    const existingImages =
      Array.isArray(product.images) && product.images.length > 0
        ? product.images.map((image) => String(image ?? ""))
        : [product.image || ""];

    setForm({
      id: product.id ?? null,
      name: product.name ?? "",
      price: product.price ?? "",
      originalPrice: product.originalPrice ?? "",
      category,
      subCategory:
        product.subCategory ||
        product.subcategory ||
        "",
      gender: product.gender || "",
      age: productAges,
      image: product.image || "",
      images: existingImages,
      description: product.description || "",
      stock:
        product.stock === undefined || product.stock === null
          ? ""
          : String(product.stock),
      bestSeller: Boolean(product.bestSeller),
      newArrival: Boolean(product.newArrival),
      sizes: existingSizes,
      deleted: Boolean(product.deleted),
    });

    setEditing(true);
    setShowForm(true);
  };

  // VALIDATION
  const validateForm = () => {
    const validImages = form.images
      .map((image) => String(image || "").trim())
      .filter(Boolean);

    if (validImages.length === 0) {
      toast.error("Please add at least one product image.");
      return false;
    }

    if (!form.name.trim()) {
      toast.error("Product name is required.");
      return false;
    }

    if (!form.category) {
      toast.error("Please select a category.");
      return false;
    }

    if (!form.subCategory) {
      toast.error("Please select a subcategory.");
      return false;
    }

    if (form.price === "" || Number(form.price) < 0) {
      toast.error("Please enter a valid price.");
      return false;
    }

    if (form.originalPrice !== "" && Number(form.originalPrice) < 0) {
      toast.error("Please enter a valid original price.");
      return false;
    }

    if (
      hasAgeForCategory(form.category) &&
      (!Array.isArray(form.age) || form.age.length === 0)
    ) {
      toast.error("Please select at least one age group.");
      return false;
    }

    if (hasGenderForCategory(form.category) && !form.gender) {
      toast.error("Please select gender.");
      return false;
    }

    if (hasSizesForCategory(form.category)) {
      if (form.sizes.length === 0) {
        toast.error("Please add at least one size.");
        return false;
      }

      const invalidSize = form.sizes.some(
        (item) =>
          !String(item.size || "").trim() ||
          item.stock === "" ||
          Number(item.stock) < 0
      );

      if (invalidSize) {
        toast.error("Please enter a valid size and stock.");
        return false;
      }

      const duplicateSizes =
        form.sizes.length !==
        new Set(
          form.sizes.map((item) =>
            String(item.size).trim().toLowerCase()
          )
        ).size;

      if (duplicateSizes) {
        toast.error("Duplicate sizes are not allowed.");
        return false;
      }
    } else {
      if (form.stock === "" || Number(form.stock) < 0) {
        toast.error("Please enter a valid stock.");
        return false;
      }
    }

    return true;
  };

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const hasSizeData = hasSizesForCategory(form.category);

    const payload = {
      name: form.name.trim(),
      price: Number(form.price),
      originalPrice:
        form.originalPrice === ""
          ? null
          : Number(form.originalPrice),
      category: form.category,
      subCategory: form.subCategory,
      image: form.images
        .map((image) => String(image || "").trim())
        .filter(Boolean)[0] || form.image.trim(),
      images: form.images
        .map((image) => String(image || "").trim())
        .filter(Boolean),
      description: form.description.trim(),
      bestSeller: Boolean(form.bestSeller),
      newArrival: Boolean(form.newArrival),
      deleted: Boolean(form.deleted),
    };

    if (hasAgeForCategory(form.category)) {
      payload.age =
        form.age.length === 1
          ? form.age[0]
          : form.age;
    }

    if (hasGenderForCategory(form.category)) {
      payload.gender = form.gender;
    }

    if (hasSizeData) {
      payload.sizes = form.sizes.map((item) => ({
        size: String(item.size).trim(),
        stock: Number(item.stock),
      }));

      // Keep a total stock value as well for easier dashboard use.
      payload.stock = payload.sizes.reduce(
        (total, item) => total + item.stock,
        0
      );
    } else {
      payload.stock = Number(form.stock);
      payload.sizes = [];
    }

    try {
      if (editing) {
        await api.patch(`/products/${form.id}`, payload);
        toast.success("Product updated successfully.");
      } else {
        await api.post("/products", payload);
        toast.success("Product added successfully.");
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["products"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["bestSellers"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["newDrops"],
        }),
      ]);

      setShowForm(false);
      setEditing(false);
      setForm(createEmptyForm());
    } catch (error) {
      console.error("Product save error:", error);
      toast.error("Something went wrong while saving the product.");
    }
  };

  // OPEN DELETE / RESTORE CONFIRMATION
  const openConfirm = (type, id) => {
    setConfirm({
      open: true,
      type,
      id,
    });
  };

  // DELETE / RESTORE
  const handleConfirm = async () => {
    try {
      if (confirm.type === "delete") {
        await api.patch(`/products/${confirm.id}`, {
          deleted: true,
        });

        toast.success("Product moved to trash.");
      }

      if (confirm.type === "restore") {
        await api.patch(`/products/${confirm.id}`, {
          deleted: false,
        });

        toast.success("Product restored.");
      }

      if (confirm.type === "permanentDelete") {
        await api.delete(`/products/${confirm.id}`);

        toast.success("Product permanently deleted.");
      }

      await queryClient.invalidateQueries({
        queryKey: ["products"],
      });

      setConfirm({
        open: false,
        type: null,
        id: null,
      });
    } catch (error) {
      console.error("Product action error:", error);
      toast.error("Action failed.");
    }
  };

  // ACTIVE / TRASH
  const activeProducts = products.filter(
    (product) => !product.deleted
  );

  const trashProducts = products.filter(
    (product) => product.deleted
  );

  const source =
    view === "active"
      ? activeProducts
      : trashProducts;

  // SEARCH
  const filteredProducts = source.filter((product) => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return true;
    }

    return [
      product.name,
      product.category,
      product.subCategory,
      product.gender,
    ]
      .filter(Boolean)
      .some((field) =>
        String(field).toLowerCase().includes(value)
      );
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / limit)
  );

  const currentPage =
    page > totalPages ? totalPages : page;

  const list = filteredProducts.slice(
    (currentPage - 1) * limit,
    currentPage * limit
  );

  // TOTAL PRODUCT STOCK FOR BADGE
  const getProductStock = (product) => {
    if (
      Array.isArray(product.sizes) &&
      product.sizes.length > 0
    ) {
      return product.sizes.reduce(
        (total, item) =>
          total + Number(item.stock || 0),
        0
      );
    }

    return Number(product.stock || 0);
  };

  const getProductStockLabel = (product) => {
    const stock = getProductStock(product);

    if (stock <= 0) {
      return {
        text: "Out of Stock",
        className:
          "bg-red-100 text-red-700",
      };
    }

    if (stock < 5) {
      return {
        text: "Low Stock",
        className:
          "bg-orange-100 text-orange-700",
      };
    }

    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f6fa] flex items-center justify-center">
        <p className="text-gray-500">
          Loading products...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-[#f5f6fa] p-6">
        <p className="text-red-500">
          Failed to load products.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f6fa] p-3 sm:p-6">

      {/* CONFIRM MODAL */}
      {confirm.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">

            <h2 className="text-xl font-bold text-gray-800">
              {confirm.type === "delete"
                ? "Move Product to Trash?"
                : confirm.type === "restore"
                ? "Restore Product?"
                : "Delete Product Permanently?"}
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              {confirm.type === "delete"
                ? "This product will be moved to Trash and hidden from the active product list."
                : confirm.type === "restore"
                ? "This product will be available in the active product list again."
                : "This action will permanently remove the product from the database and cannot be undone."}
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
                className="px-5 py-2 rounded-xl border border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                className={`px-5 py-2 rounded-xl text-white ${
                  confirm.type === "restore"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {confirm.type === "delete"
                  ? "Move to Trash"
                  : confirm.type === "restore"
                  ? "Restore"
                  : "Delete Permanently"}
              </button>

            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Products
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage Kidzy products and stock
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">

          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="border border-gray-300 bg-white px-4 py-2 rounded-xl w-full sm:w-72 outline-none focus:border-gray-500"
          />

          <button
            type="button"
            onClick={() => {
              setView("active");
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl border ${
              view === "active"
                ? "bg-black text-white"
                : "bg-white hover:bg-gray-50"
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
                ? "bg-black text-white"
                : "bg-white hover:bg-gray-50"
            }`}
          >
            Trash
          </button>

          <button
            type="button"
            onClick={openAdd}
            className="bg-black text-white px-4 py-2 rounded-xl hover:bg-gray-800"
          >
            Add Product
          </button>

        </div>
      </div>

      {/* FORM */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow p-4 sm:p-6 mb-6 space-y-5"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">
              {editing
                ? "Edit Product"
                : "Add Product"}
            </h2>

            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditing(false);
              }}
              className="text-gray-500 hover:text-black text-xl"
            >
              ✕
            </button>
          </div>

          {/* BASIC DETAILS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <input
              name="name"
              placeholder="Product Name"
              value={form.name}
              onChange={handleChange}
              className="border border-gray-300 p-3 rounded-xl w-full outline-none"
            />

            <input
              type="number"
              name="price"
              placeholder="Selling Price"
              min="0"
              value={form.price}
              onChange={handleChange}
              className="border border-gray-300 p-3 rounded-xl w-full outline-none"
            />

            <input
              type="number"
              name="originalPrice"
              placeholder="Original Price (optional)"
              min="0"
              value={form.originalPrice}
              onChange={handleChange}
              className="border border-gray-300 p-3 rounded-xl w-full outline-none"
            />

            {/* MAIN CATEGORY */}
            <select
              value={form.category}
              onChange={handleCategoryChange}
              className="border border-gray-300 p-3 rounded-xl w-full bg-white outline-none"
            >
              <option value="">
                Select Category
              </option>

              {CATEGORY_NAMES.map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              ))}
            </select>

            {/* SUBCATEGORY */}
            <select
              name="subCategory"
              value={form.subCategory}
              onChange={handleChange}
              disabled={!form.category}
              className="border border-gray-300 p-3 rounded-xl w-full bg-white outline-none disabled:bg-gray-100"
            >
              <option value="">
                Select Subcategory
              </option>

              {selectedSubCategories.map(
                (subCategory) => (
                  <option
                    key={subCategory}
                    value={subCategory}
                  >
                    {subCategory}
                  </option>
                )
              )}
            </select>

            {/* AGE - SELECT ANY NUMBER OF AGE GROUPS */}
            {hasAgeForCategory(form.category) && (
              <div className="border border-gray-200 rounded-2xl p-4 md:col-span-2">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      Age Group
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Select one or more age groups. There is no selection limit.
                    </p>
                  </div>

                  <span className="text-sm text-gray-500">
                    {form.age.length} selected
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(form.category === "Footwear"
                    ? FOOTWEAR_AGES
                    : CLOTHING_AGES
                  ).map((age) => {
                    const checked = form.age.includes(age);

                    return (
                      <label
                        key={age}
                        className={`flex items-center gap-3 border rounded-xl px-4 py-3 cursor-pointer transition ${
                          checked
                            ? "border-orange-500 bg-orange-50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleAgeToggle(age)}
                          className="w-4 h-4 accent-orange-500"
                        />
                        <span className="text-sm">{age}</span>
                      </label>
                    );
                  })}
                </div>

                {form.age.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {form.age.map((age) => (
                      <span
                        key={age}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs"
                      >
                        {age}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* GENDER */}
            {hasGenderForCategory(form.category) && (
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="border border-gray-300 p-3 rounded-xl w-full bg-white outline-none"
              >
                <option value="">
                  Select Gender
                </option>

                <option value="Boys">
                  Boys
                </option>

                <option value="Girls">
                  Girls
                </option>
              </select>
            )}

          </div>

          {/* PRODUCT IMAGES */}
          <div className="border border-gray-200 rounded-2xl p-4">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <h3 className="font-semibold text-gray-800">
                  Product Images
                </h3>

                <p className="text-xs text-gray-500 mt-1">
                  Add one or multiple Cloudinary image URLs.
                </p>
              </div>

              <button
                type="button"
                onClick={addImage}
                className="bg-black text-white px-4 py-2 rounded-xl"
              >
                + Add Image
              </button>
            </div>

            <div className="space-y-3">
              {form.images.map((image, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <input
                    type="text"
                    placeholder={
                      index === 0
                        ? "Primary image URL"
                        : "Additional image URL"
                    }
                    value={image}
                    onChange={(e) =>
                      handleImageChange(
                        index,
                        e.target.value
                      )
                    }
                    className="flex-1 border border-gray-300 p-3 rounded-xl w-full outline-none"
                  />

                  {form.images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="border border-red-200 text-red-600 px-4 py-2 rounded-xl hover:bg-red-50"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            {form.images.some((image) => image.trim()) && (
              <div className="flex flex-wrap gap-3 mt-4">
                {form.images
                  .filter((image) => image.trim())
                  .map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Preview ${index + 1}`}
                      className="w-24 h-24 object-cover rounded-xl border"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ))}
              </div>
            )}
          </div>

          {/* DESCRIPTION */}
          <textarea
            name="description"
            placeholder="Product Description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="border border-gray-300 p-3 rounded-xl w-full outline-none resize-none"
          />

          {/* STOCK FOR NON-SIZE PRODUCTS */}
          {!hasSizesForCategory(form.category) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock
              </label>

              <input
                type="number"
                name="stock"
                min="0"
                placeholder="Enter stock quantity"
                value={form.stock}
                onChange={handleChange}
                className="border border-gray-300 p-3 rounded-xl w-full outline-none"
              />
            </div>
          )}

          {/* SIZES */}
          {hasSizesForCategory(form.category) && (
            <div className="border border-gray-200 rounded-2xl p-4">

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">

                <div>
                  <h3 className="font-semibold text-gray-800">
                    Size & Stock
                  </h3>

                  <p className="text-xs text-gray-500 mt-1">
                    {form.category === "Footwear"
                      ? "Select EU shoe sizes covered by the selected age groups."
                      : "Add the available product sizes and stock."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addSize}
                  className="bg-black text-white px-4 py-2 rounded-xl"
                >
                  + Add Size
                </button>
              </div>

              <div className="space-y-3">

                {form.sizes.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2"
                  >
                    {form.category === "Footwear" ? (
                      <select
                        value={item.size}
                        onChange={(e) =>
                          handleSizeChange(
                            index,
                            "size",
                            e.target.value
                          )
                        }
                        className="border border-gray-300 p-3 rounded-xl bg-white"
                      >
                        <option value="">
                          Select Shoe Size
                        </option>

                        {getFootwearSizesForAge(form.age).map(
                          (size) => (
                            <option
                              key={size}
                              value={size}
                            >
                              {size}
                            </option>
                          )
                        )}
                      </select>
                    ) : (
                      <select
                        value={item.size}
                        onChange={(e) =>
                          handleSizeChange(
                            index,
                            "size",
                            e.target.value
                          )
                        }
                        className="border border-gray-300 p-3 rounded-xl bg-white"
                      >
                        <option value="">
                          Select Clothing Size
                        </option>

                        {CLOTHING_SIZES.map(
                          (size) => (
                            <option
                              key={size}
                              value={size}
                            >
                              {size}
                            </option>
                          )
                        )}
                      </select>
                    )}

                    <input
                      type="number"
                      min="0"
                      placeholder="Stock"
                      value={item.stock}
                      onChange={(e) =>
                        handleSizeChange(
                          index,
                          "stock",
                          e.target.value
                        )
                      }
                      className="border border-gray-300 p-3 rounded-xl"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        removeSize(index)
                      }
                      className="border border-red-200 text-red-600 px-4 py-2 rounded-xl hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                ))}

                {form.sizes.length === 0 && (
                  <p className="text-sm text-gray-500">
                    No sizes added yet.
                  </p>
                )}

              </div>
            </div>
          )}

          {/* CHECKBOXES */}
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

          {/* FORM BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-3">

            <button
              type="submit"
              className="bg-black text-white px-5 py-3 rounded-xl hover:bg-gray-800"
            >
              {editing
                ? "Update Product"
                : "Add Product"}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditing(false);
              }}
              className="border border-gray-300 px-5 py-3 rounded-xl hover:bg-gray-50"
            >
              Cancel
            </button>

          </div>
        </form>
      )}

      {/* PRODUCT TABLE */}
      <div className="bg-white rounded-2xl shadow overflow-x-auto">

        <table className="w-full min-w-[900px]">

          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">
                Image
              </th>

              <th className="p-3 text-left">
                Product
              </th>

              <th className="p-3 text-left">
                Category
              </th>

              <th className="p-3 text-left">
                Price
              </th>

              <th className="p-3 text-left">
                Stock
              </th>

              <th className="p-3 text-center">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {list.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="p-10 text-center text-gray-500"
                >
                  No products found.
                </td>
              </tr>
            ) : (
              list.map((product) => {
                const stockInfo =
                  getProductStockLabel(product);

                return (
                  <tr
                    key={product.id}
                    className="border-t hover:bg-gray-50"
                  >
                    <td className="p-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-14 h-14 object-cover rounded-xl border"
                      />
                    </td>

                    <td className="p-3">
                      <div className="flex items-center gap-2 flex-wrap">

                        <span className="font-medium">
                          {product.name}
                        </span>

                        {product.bestSeller && (
                          <span className="bg-yellow-100 text-yellow-700 px-2 py-1 text-xs rounded-full">
                            Best Seller
                          </span>
                        )}

                        {product.newArrival && (
                          <span className="bg-green-100 text-green-700 px-2 py-1 text-xs rounded-full">
                            New
                          </span>
                        )}

                      </div>

                      {product.subCategory && (
                        <p className="text-xs text-gray-500 mt-1">
                          {product.subCategory}
                        </p>
                      )}
                    </td>

                    <td className="p-3">
                      <div className="flex flex-col gap-1">

                        <span className="bg-gray-100 px-3 py-1 rounded-full text-sm w-fit">
                          {product.category}
                        </span>

                        {product.gender && (
                          <span className="text-xs text-gray-500">
                            {product.gender}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-3 font-medium">
                      ₹
                      {Number(
                        product.price || 0
                      ).toLocaleString("en-IN")}
                    </td>

                    <td className="p-3">
                      <div className="flex flex-col gap-1">
                        <span>
                          {getProductStock(product)}
                        </span>

                        {stockInfo && (
                          <span
                            className={`px-2 py-1 rounded-full text-xs w-fit ${stockInfo.className}`}
                          >
                            {stockInfo.text}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-3">

                      {view === "active" ? (
                        <div className="flex justify-center gap-4">

                          <button
                            type="button"
                            title="Edit Product"
                            onClick={() =>
                              handleEdit(product)
                            }
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <FaEdit />
                          </button>

                          <button
                            type="button"
                            title="Move to Trash"
                            onClick={() =>
                              openConfirm(
                                "delete",
                                product.id
                              )
                            }
                            className="text-red-600 hover:text-red-800"
                          >
                            <FaTrash />
                          </button>

                        </div>
                      ) : (
                        <div className="flex justify-center items-center gap-4">

                          <button
                            type="button"
                            title="Restore Product"
                            onClick={() =>
                              openConfirm(
                                "restore",
                                product.id
                              )
                            }
                            className="text-green-600 hover:text-green-800"
                          >
                            <FaUndo />
                          </button>

                          <button
                            type="button"
                            title="Delete Permanently"
                            onClick={() =>
                              openConfirm(
                                "permanentDelete",
                                product.id
                              )
                            }
                            className="text-red-600 hover:text-red-800"
                          >
                            <FaTrash />
                          </button>

                        </div>
                      )}

                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

        </table>
      </div>

      {/* PAGINATION */}
      {filteredProducts.length > 0 && (
        <div className="flex justify-center items-center mt-6 gap-2 flex-wrap">

          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() =>
              setPage((previous) =>
                Math.max(1, previous - 1)
              )
            }
            className="border bg-white px-4 py-2 rounded-xl disabled:opacity-50"
          >
            Prev
          </button>

          {Array.from(
            { length: totalPages },
            (_, index) => index + 1
          ).map((pageNumber) => (
            <button
              type="button"
              key={pageNumber}
              onClick={() => setPage(pageNumber)}
              className={`border px-4 py-2 rounded-xl ${
                currentPage === pageNumber
                  ? "bg-black text-white"
                  : "bg-white hover:bg-gray-50"
              }`}
            >
              {pageNumber}
            </button>
          ))}

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() =>
              setPage((previous) =>
                Math.min(totalPages, previous + 1)
              )
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

export default Products;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { FaHeart, FaTrash, FaShoppingBag } from "react-icons/fa";

import api from "../api/api";

import {
  setWishlist,
  removeFromWishlist,
} from "../redux/wishlistSlice";

import { setCart } from "../redux/cartSlice";

function Wishlist() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  // ADD TO BAG / AGE + SIZE POPUP

  const [showSelectionPopup, setShowSelectionPopup] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedWishlistItem, setSelectedWishlistItem] = useState(null);
  const [selectedAge, setSelectedAge] = useState("");
  const [selectedSize, setSelectedSize] = useState("");

  // REDUX WISHLIST

  const wishlistItems = useSelector(
    (state) => state.wishlist?.items || []
  );

  // CURRENT USER

  const user = JSON.parse(localStorage.getItem("user"));

  // FETCH WISHLIST

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) {
        dispatch(setWishlist([]));
        setLoading(false);
        navigate("/login");
        return;
      }

      try {
        const response = await api.get("/wishlist");

        const wishlistData =
          response?.data?.data ?? response?.data;

        const items = Array.isArray(wishlistData?.items)
          ? wishlistData.items.map((item) => ({
              ...item,
              name:
                item.name ??
                item.productName ??
                "",
              image:
                item.image ??
                item.imageUrl ??
                "",
            }))
          : [];

        dispatch(setWishlist(items));
      } catch (error) {
        console.error("Failed to fetch wishlist:", error);
        toast.error("Failed to load wishlist");
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [dispatch, navigate]);

  // REMOVE FROM WISHLIST

  const handleRemove = async (item) => {
    try {
      setRemovingId(item.productId);

      await dispatch(
        removeFromWishlist(item.productId)
      ).unwrap();

      toast.success("Removed from wishlist");
    } catch (error) {
      console.error("Failed to remove wishlist item:", error);

      toast.error("Failed to remove from wishlist");
    } finally {
      setRemovingId(null);
    }
  };

  // CHECK IF PRODUCT HAS SIZE

  const getProductSizes = (product) => {
    if (Array.isArray(product?.sizes)) {
      return product.sizes;
    }

    if (Array.isArray(product?.Sizes)) {
      return product.Sizes;
    }

    if (Array.isArray(product?.variants)) {
      return product.variants.flatMap((variant) =>
        Array.isArray(variant?.sizes)
          ? variant.sizes.map((sizeItem) => ({
              ...sizeItem,
              productVariantId:
                sizeItem?.productVariantId ??
                sizeItem?.ProductVariantId ??
                sizeItem?.id ??
                sizeItem?.Id ??
                null,
            }))
          : []
      );
    }

    if (Array.isArray(product?.Variants)) {
      return product.Variants.flatMap((variant) =>
        Array.isArray(variant?.Sizes)
          ? variant.Sizes.map((sizeItem) => ({
              ...sizeItem,
              productVariantId:
                sizeItem?.productVariantId ??
                sizeItem?.ProductVariantId ??
                sizeItem?.id ??
                sizeItem?.Id ??
                null,
            }))
          : []
      );
    }

    return [];
  };

  const hasSizes = (product) => {
    return getProductSizes(product).length > 0;
  };

  // CHECK IF PRODUCT HAS AGE

  const hasAge = (product) => {
    if (Array.isArray(product?.age)) {
      return product.age.length > 0;
    }

    return Boolean(product?.age);
  };

  // GET AGE OPTIONS

  const getAgeOptions = (product) => {
    if (Array.isArray(product?.age)) {
      return product.age;
    }

    if (product?.age) {
      return [product.age];
    }

    return [];
  };

  // GET SIZE VALUE

  const getSizeValue = (size) => {
    if (typeof size === "object" && size !== null) {
      return (
        size.size ??
        size.Size ??
        size.name ??
        size.Name ??
        size.value ??
        size.Value ??
        ""
      );
    }

    return size;
  };

  // GET SIZE STOCK

  const getSizeStock = (size) => {
    if (typeof size === "object" && size !== null) {
      return Number(
        size.stock ??
        size.Stock ??
        0
      );
    }

    return 999999;
  };

  // RESET POPUP

  const closeSelectionPopup = () => {
    setShowSelectionPopup(false);
    setSelectedProduct(null);
    setSelectedWishlistItem(null);
    setSelectedAge("");
    setSelectedSize("");
  };

  // REMOVE ADDED PRODUCT FROM WISHLIST

  const removeAddedItemFromWishlist = async (wishlistItem) => {
    const productId =
      wishlistItem?.productId ?? wishlistItem?.id;

    if (!productId) {
      return;
    }

    try {
      await dispatch(
        removeFromWishlist(productId)
      ).unwrap();
    } catch (error) {
      console.error(
        "Product added to cart, but wishlist removal failed:",
        error
      );

      toast.warning(
        "Added to bag, but could not remove from wishlist"
      );
    }
  };

  // ADD PRODUCT TO BAG

  const addProductToBag = async (
    wishlistItem,
    age = null,
    size = null
  ) => {
    if (!user) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }

    try {
      const productId =
        wishlistItem.productId ?? wishlistItem.id;

      // GET LATEST PRODUCT

      const response = await api.get(`/products/${productId}`);
      const latestProduct = response?.data?.data ?? response?.data;

      const productNeedsAge = hasAge(latestProduct);
      const productNeedsSize = hasSizes(latestProduct);

      // NO AGE + NO SIZE
      // DIRECTLY ADD TO BAG

      if (!productNeedsAge && !productNeedsSize) {
        age = null;
        size = null;
      }

      // AGE / SIZE REQUIRED

      if (productNeedsAge && !age) {
        setSelectedProduct(latestProduct);
        setSelectedWishlistItem(wishlistItem);
        setSelectedAge("");
        setSelectedSize("");
        setShowSelectionPopup(true);

        toast.info("Please select an age");

        return;
      }

      if (productNeedsSize && !size) {
        setSelectedProduct(latestProduct);
        setSelectedWishlistItem(wishlistItem);
        setSelectedAge(age || "");
        setSelectedSize("");
        setShowSelectionPopup(true);

        toast.info("Please select a size");

        return;
      }

      // VALIDATE SELECTED AGE

      if (productNeedsAge && age) {
        const ageOptions = getAgeOptions(latestProduct);

        const validAge = ageOptions.some(
          (ageOption) =>
            String(ageOption) === String(age)
        );

        if (!validAge) {
          toast.error("Please select a valid age");
          return;
        }
      }

      // VALIDATE SELECTED SIZE

      if (productNeedsSize && size) {
        const selectedSizeObject = getProductSizes(latestProduct).find(
          (sizeItem) =>
            String(getSizeValue(sizeItem)) === String(size)
        );

        if (!selectedSizeObject) {
          toast.error("Please select a valid size");
          return;
        }

        const sizeStock = getSizeStock(selectedSizeObject);

        if (sizeStock <= 0) {
          toast.error("Selected size is out of stock");
          return;
        }
      }

      // NORMAL STOCK CHECK

      if (!productNeedsSize) {
        const stock = Number(latestProduct.stock ?? 0);

        if (stock <= 0) {
          toast.error("Product is out of stock");
          return;
        }
      }

      // GET CURRENT CART
      // Same backend cart logic used by ProductPage.

      const cartResponse = await api.get("/cart");

      const cartData =
        cartResponse?.data?.data ??
        cartResponse?.data ??
        [];

      const currentCart = Array.isArray(cartData)
        ? cartData
        : Array.isArray(cartData?.items)
          ? cartData.items
          : [];

      // FIND THE SELECTED PRODUCT VARIANT
      // ProductPage uses ProductVariantId for duplicate checking.

      const selectedSizeObject =
        productNeedsSize && size
          ? getProductSizes(latestProduct).find(
              (sizeItem) =>
                String(getSizeValue(sizeItem)) ===
                String(size)
            )
          : null;

      const productVariantId =
        selectedSizeObject?.productVariantId ??
        selectedSizeObject?.ProductVariantId ??
        selectedSizeObject?.variantId ??
        selectedSizeObject?.VariantId ??
        selectedSizeObject?.id ??
        selectedSizeObject?.Id ??
        null;

      // CHECK SAME PRODUCT + SAME VARIANT

      const existingItem = currentCart.find((item) => {
        const existingProductId =
          item.productId ??
          item.product?.id;

        const existingVariantId =
          item.productVariantId ??
          item.productVariant?.id ??
          item.variantId ??
          null;

        const sameProduct =
          String(existingProductId) ===
          String(productId);

        const sameVariant =
          productVariantId == null
            ? existingVariantId == null
            : String(existingVariantId) ===
              String(productVariantId);

        return sameProduct && sameVariant;
      });

      if (existingItem) {
        toast.info("Already in cart");
        return;
      }

      // BACKEND CART DTO
      // Do not send userId/name/price/image/qty.
      // User is identified from JWT on the backend.

      const cartItem = {
        productId: Number(latestProduct.id),

        productVariantId:
          productVariantId == null
            ? null
            : Number(productVariantId),

        quantity: 1,
      };

      // ADD TO BACKEND CART

      await api.post("/cart", cartItem);

      // GET UPDATED CART

      const updatedResponse =
        await api.get("/cart");

      const updatedData =
        updatedResponse?.data?.data ??
        updatedResponse?.data ??
        [];

      const updatedCart =
        Array.isArray(updatedData)
          ? updatedData
          : Array.isArray(updatedData?.items)
            ? updatedData.items
            : [];

      dispatch(setCart(updatedCart));

      // REMOVE FROM WISHLIST

      await removeAddedItemFromWishlist(wishlistItem);

      // RESET

      closeSelectionPopup();

      toast.success("Added to bag");
    } catch (error) {
      console.error("Failed to add product to bag:", error);

      toast.error("Failed to add to bag");
    }
  };

  // ADD TO BAG BUTTON

  const handleAddToBag = async (item) => {
    await addProductToBag(item);
  };

  // ADD SELECTED AGE + SIZE

  const handleAddSelectedToBag = async () => {
    if (!selectedProduct || !selectedWishlistItem) {
      return;
    }

    if (hasAge(selectedProduct) && !selectedAge) {
      toast.error("Please select an age");
      return;
    }

    if (hasSizes(selectedProduct) && !selectedSize) {
      toast.error("Please select a size");
      return;
    }

    await addProductToBag(
      selectedWishlistItem,
      selectedAge || null,
      selectedSize || null
    );
  };

  // LOADING

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F3EE] flex items-center justify-center">
        <p className="text-lg font-medium">
          Loading wishlist...
        </p>
      </div>
    );
  }

  // PAGE

  return (
    <div className="min-h-screen bg-[#F7F3EE] px-4 md:px-8 lg:px-12 py-8">

      {/* HEADER */}

      <div className="mb-8">
        <div className="flex items-center gap-3">

          <FaHeart className="text-[#5A4030] text-2xl" />

          <h1 className="text-3xl md:text-4xl font-bold">
            My Wishlist
          </h1>

        </div>

        <p className="text-[#6B4F3A] mt-2">
          {wishlistItems.length}{" "}
          {wishlistItems.length === 1
            ? "item"
            : "items"}
        </p>
      </div>

      {/* EMPTY WISHLIST */}

      {wishlistItems.length === 0 ? (

        <div className="min-h-[400px] flex flex-col items-center justify-center">

          <FaHeart className="text-[#E7DED5] text-6xl mb-5" />

          <h2 className="text-xl font-semibold text-[#5A4030]">
            Your wishlist is empty
          </h2>

          <p className="text-[#6B4F3A] mt-2">
            Add products you love to your wishlist.
          </p>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-6 bg-[#5A4030] text-white px-6 py-3 rounded-full hover:bg-[#6B4F3A] transition"
          >
            Continue Shopping
          </button>

        </div>

      ) : (

        /* WISHLIST GRID */

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 md:gap-7">

          {wishlistItems.map((item) => (

            <div
              key={item.id}
              className="bg-white rounded-2xl overflow-hidden border border-[#E7DED5] shadow-sm hover:shadow-md transition duration-300"
            >

              {/* IMAGE */}

              <div
                className="relative aspect-[4/5] overflow-hidden cursor-pointer"
                onClick={() =>
                  navigate(
                    `/product/${item.productId ?? item.id}`
                  )
                }
              >

                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover hover:scale-105 transition duration-500"
                />

                {/* HEART */}

                <div className="absolute top-3 right-3 bg-white w-9 h-9 rounded-full flex items-center justify-center shadow">
                  <FaHeart className="text-[#5A4030]" />
                </div>

              </div>

              {/* PRODUCT INFORMATION */}

              <div className="p-4">

                <h2
                  className="font-medium text-sm md:text-base line-clamp-2 cursor-pointer hover:underline min-h-[40px]"
                  onClick={() =>
                    navigate(
                      `/product/${item.productId ?? item.id}`
                    )
                  }
                >
                  {item.name}
                </h2>

                {/* PRICE */}

                <div className="flex items-center gap-2 mt-2">

                  <span className="font-semibold text-base">
                    ₹
                    {Number(
                      item.price || 0
                    ).toLocaleString("en-IN")}
                  </span>

                  {item.originalPrice &&
                    Number(item.originalPrice) >
                      Number(item.price) && (
                      <span className="text-[#8A7768] text-sm line-through">
                        ₹
                        {Number(
                          item.originalPrice
                        ).toLocaleString("en-IN")}
                      </span>
                    )}

                </div>

                {/* ADD TO BAG */}

                <button
                  type="button"
                  onClick={() => handleAddToBag(item)}
                  className="w-full mt-4 bg-[#5A4030] text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-[#6B4F3A] transition"
                >
                  <FaShoppingBag className="text-sm" />
                  Add to Bag
                </button>

                {/* REMOVE BUTTON */}

                <button
                  type="button"
                  onClick={() => handleRemove(item)}
                  disabled={removingId === item.id}
                  className="w-full mt-2 border border-[#E7DED5] text-[#5A4030] py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-[#6B4F3A] hover:text-white transition disabled:opacity-50"
                >

                  {removingId === item.id ? (
                    "Removing..."
                  ) : (
                    <>
                      <FaTrash />
                      Remove
                    </>
                  )}

                </button>

              </div>

            </div>

          ))}

        </div>
      )}

      {/* AGE + SIZE POPUP */}
      {/* Only shown when product needs age and/or size */}

      {showSelectionPopup && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">

          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl">

            {/* HEADER */}

            <div className="px-6 py-5 border-b border-[#E7DED5] flex items-center justify-between">

              <div>
                <h3 className="text-lg font-semibold text-[#5A4030]">
                  Select Product Options
                </h3>

                <p className="text-sm text-[#6B4F3A] mt-1">
                  Select the required age and size.
                </p>
              </div>

              <button
                type="button"
                onClick={closeSelectionPopup}
                className="text-[#6B4F3A] hover:text-black text-xl"
              >
                ×
              </button>

            </div>

            <div className="px-6 py-6">

              {/* AGE */}

              {hasAge(selectedProduct) && (
                <div className="mb-6">

                  <h4 className="text-sm font-semibold text-[#5A4030] mb-3">
                    Age
                  </h4>

                  <div className="flex flex-wrap gap-2">

                    {getAgeOptions(selectedProduct).map(
                      (ageOption, index) => {

                        const isSelected =
                          String(selectedAge) ===
                          String(ageOption);

                        return (
                          <button
                            key={index}
                            type="button"
                            onClick={() =>
                              setSelectedAge(ageOption)
                            }
                            className={`
                              px-4
                              py-2.5
                              rounded-lg
                              border
                              text-sm
                              font-medium
                              transition
                              ${
                                isSelected
                                  ? "bg-[#5A4030] text-white border-[#5A4030]"
                                  : "bg-white text-[#5A4030] border-[#E7DED5] hover:border-[#5A4030]"
                              }
                            `}
                          >
                            {ageOption}
                          </button>
                        );
                      }
                    )}

                  </div>

                </div>
              )}

              {/* ========================================= */}
              {/* SIZE */}
              {/* ========================================= */}

              {hasSizes(selectedProduct) && (
                <div>

                  <h4 className="text-sm font-semibold text-[#5A4030] mb-3">
                    Size
                  </h4>

                  <div className="flex flex-wrap gap-2">

                    {getProductSizes(selectedProduct).map(
                      (size, index) => {

                        const sizeValue =
                          getSizeValue(size);

                        const stock =
                          getSizeStock(size);

                        const isOutOfStock =
                          stock <= 0;

                        const isSelected =
                          String(selectedSize) ===
                          String(sizeValue);

                        return (
                          <button
                            key={index}
                            type="button"
                            disabled={isOutOfStock}
                            onClick={() =>
                              setSelectedSize(
                                sizeValue
                              )
                            }
                            className={`
                              min-w-[70px]
                              px-4
                              py-2.5
                              rounded-lg
                              border
                              text-sm
                              font-medium
                              transition
                              ${
                                isSelected
                                  ? "bg-[#5A4030] text-white border-[#5A4030]"
                                  : "bg-white text-[#5A4030] border-[#E7DED5]"
                              }
                              ${
                                isOutOfStock
                                  ? "opacity-40 line-through cursor-not-allowed"
                                  : "hover:border-[#5A4030]"
                              }
                            `}
                          >
                            {sizeValue}
                          </button>
                        );
                      }
                    )}

                  </div>

                </div>
              )}

            </div>

            {/* ACTION */}

            <div className="px-6 pb-6 flex gap-3">

              <button
                type="button"
                onClick={closeSelectionPopup}
                className="flex-1 border border-[#E7DED5] py-3 rounded-lg hover:bg-[#F7F3EE] transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleAddSelectedToBag}
                className="flex-1 bg-[#5A4030] text-white py-3 rounded-lg hover:bg-[#6B4F3A] transition"
              >
                Add to Bag
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default Wishlist;
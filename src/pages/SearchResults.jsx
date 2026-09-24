import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaHeart } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import api from "../api/api";
import { setWishlist } from "../redux/wishlistSlice";

function SearchResults() {
  const { query } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector(
    (state) => state.auth?.user
  );

  const wishlistItems = useSelector(
    (state) => state.wishlist?.items || []
  );

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // NORMALIZE

  const normalize = (value) =>
    String(value || "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ");

  const searchText = normalize(
    query ? decodeURIComponent(query) : ""
  );

  // FETCH PRODUCTS

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const response = await api.get("/products");

        const activeProducts = (
          response.data || []
        ).filter(
          (product) => !product.deleted
        );

        setProducts(activeProducts);
      } catch (error) {
        console.error(
          "Failed to fetch products:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // FILTER SEARCH RESULTS

  const filteredProducts = products.filter(
    (product) => {
      if (!searchText) {
        return true;
      }

      const category = normalize(
        product.category
      );

      const subCategory = normalize(
        product.subCategory
      );

      const productName = normalize(
        product.name
      );

      const description = normalize(
        product.description
      );

      const gender = normalize(
        product.gender
      );

      const age = normalize(
        product.age
      );

      // EXACT MAIN CATEGORY
      //
      // School Supplies
      // -> ALL School Supplies products
      //
      // Footwear
      // -> ALL Footwear products
      //
      // Toys
      // -> ALL Toys products
      //
      // Girls
      // -> ALL Girls products
      //

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
    }
  );

  // WISHLIST CHECK

  const isInWishlist = (productId) => {
    return wishlistItems.some(
      (item) =>
        String(
          item.productId ?? item.id
        ) === String(productId)
    );
  };

  // TOGGLE WISHLIST

  const toggleWishlist = async (product) => {
    if (!user?.id) {
      toast.info("Please login first");
      navigate("/login");
      return;
    }

    const existingItem =
      wishlistItems.find(
        (item) =>
          String(
            item.productId ?? item.id
          ) === String(product.id)
      );

    try {
      // REMOVE

      if (existingItem) {
        await api.delete(
          `/wishlist/${existingItem.id}`
        );

        const response = await api.get(
          `/wishlist?userId=${user.id}`
        );

        dispatch(
          setWishlist(response.data || [])
        );

        toast.info(
          "Removed from wishlist"
        );

        return;
      }

      // ADD

      await api.post("/wishlist", {
        productId: product.id,
        userId: user.id,
        name: product.name,
        price: product.price,
        originalPrice:
          product.originalPrice || null,
        image: product.image,
      });

      const response = await api.get(
        `/wishlist?userId=${user.id}`
      );

      dispatch(
        setWishlist(response.data || [])
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
        "Something went wrong"
      );
    }
  };

  // DISCOUNT

  const getDiscount = (product) => {
    const price = Number(
      product.price || 0
    );

    const originalPrice = Number(
      product.originalPrice || 0
    );

    if (
      originalPrice > price &&
      price > 0
    ) {
      return Math.round(
        ((originalPrice - price) /
          originalPrice) *
          100
      );
    }

    return null;
  };

  // LOADING

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f3ee] flex items-center justify-center">
        <p className="text-sm text-[#777]">
          Loading products...
        </p>
      </div>
    );
  }

  // UI

  return (
    <div className="min-h-screen bg-white">

      {/* 
          HEADER
     */}

      <div className="px-4 sm:px-6 md:px-10 lg:px-16 pt-8 pb-6">

        <div className="max-w-[1400px] mx-auto">

          <p className="text-[10px] uppercase tracking-[3px] text-[#999]">
            Search Results
          </p>

          <h1 className="mt-2 text-2xl md:text-3xl font-serif font-medium text-[#222]">
            {searchText
              ? `"${searchText}"`
              : "All Products"}
          </h1>

          <p className="mt-2 text-xs text-[#888]">
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1
              ? "product"
              : "products"}{" "}
            found
          </p>

        </div>

      </div>

      {/* 
          PRODUCTS
       */}

      <div className="px-4 sm:px-6 md:px-10 lg:px-16 pb-14">

        <div className="max-w-[1400px] mx-auto">

          {/* 
              NO RESULTS
           */}

          {filteredProducts.length === 0 ? (

            <div className="min-h-[350px] flex flex-col items-center justify-center">

              <p className="text-xl font-medium text-[#333]">
                No products found
              </p>

              <p className="mt-2 text-sm text-[#999]">
                Try searching for another
                category or product.
              </p>

              <button
                onClick={() =>
                  navigate("/")
                }
                className="
                  mt-6
                  px-7
                  py-3
                  bg-[#222]
                  text-white
                  text-xs
                  uppercase
                  tracking-wider
                  rounded-sm
                  hover:bg-[#444]
                  transition
                "
              >
                Continue Shopping
              </button>

            </div>

          ) : (

            <div
              className="
                grid
                grid-cols-2
                sm:grid-cols-3
                md:grid-cols-4
                lg:grid-cols-5
                gap-x-4
                gap-y-9
              "
            >

              {filteredProducts.map(
                (product) => {

                  const discount =
                    getDiscount(product);

                  const wishlisted =
                    isInWishlist(
                      product.id
                    );

                  return (
                    <div
                      key={product.id}
                      className="group"
                    >

                      {/*
                          IMAGE
                      */}

                      <div
                        onClick={() =>
                          navigate(
                            `/product/${product.id}`
                          )
                        }
                        className="
                          relative
                          aspect-[3/4]
                          bg-white
                          overflow-hidden
                          rounded-sm
                          cursor-pointer
                        "
                      >

                        <img
                          src={product.image}
                          alt={product.name}
                          className="
                            w-full
                            h-full
                            object-cover
                            transition-transform
                            duration-500
                            group-hover:scale-[1.04]
                          "
                        />

                        {/* HEART */}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();

                            toggleWishlist(
                              product
                            );
                          }}
                          className="
                            absolute
                            top-3
                            right-3
                            w-8
                            h-8
                            rounded-full
                            bg-white/90
                            flex
                            items-center
                            justify-center
                            shadow-sm
                            hover:bg-white
                          "
                        >

                          <FaHeart
                            size={14}
                            className={
                              wishlisted
                                ? "text-red-500"
                                : "text-[#777]"
                            }
                          />

                        </button>

                      </div>

                      {/* 
                          PRODUCT DETAILS
                       */}

                      <div className="pt-3">

                        {/* NAME */}

                        <h2 className="
                          text-sm
                          font-medium
                          text-[#333]
                          truncate
                        ">
                          {product.name}
                        </h2>

                        {/* MAIN CATEGORY + SUBCATEGORY */}

                        <p className="
                          mt-1
                          text-[10px]
                          text-[#999]
                          truncate
                        ">
                          {product.category}

                          {product.subCategory &&
                            ` • ${product.subCategory}`}
                        </p>

                        {/* PRICE */}

                        <div className="
                          mt-2
                          flex
                          items-center
                          gap-2
                          flex-wrap
                        ">

                          <span className="
                            text-sm
                            font-semibold
                            text-[#222]
                          ">
                            ₹{product.price}
                          </span>

                          {product.originalPrice &&
                            Number(
                              product.originalPrice
                            ) >
                              Number(
                                product.price
                              ) && (

                              <span className="
                                text-xs
                                text-[#aaa]
                                line-through
                              ">
                                ₹
                                {
                                  product.originalPrice
                                }
                              </span>

                            )}

                          {discount && (

                            <span className="
                              text-[10px]
                              text-[#777]
                            ">
                              {discount}% OFF
                            </span>

                          )}

                        </div>

                        {/* BEST SELLER */}

                        {product.bestSeller && (

                          <p className="
                            mt-2
                            text-[9px]
                            uppercase
                            tracking-[1.5px]
                            text-[#9a7b5d]
                          ">
                            Best Seller
                          </p>

                        )}

                        {/* NEW ARRIVAL */}

                        {!product.bestSeller &&
                          product.newArrival && (

                            <p className="
                              mt-2
                              text-[9px]
                              uppercase
                              tracking-[1.5px]
                              text-[#9a7b5d]
                            ">
                              New Arrival
                            </p>

                          )}

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default SearchResults;
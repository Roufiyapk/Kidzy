import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../redux/cartSlice";
import { toast } from "react-toastify";

function ProductDetails() {

  const { id } = useParams();

  const navigate = useNavigate();

  const dispatch = useDispatch();

  const { items } = useSelector(
    (state) => state.cart
  );

  const [product, setProduct] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [selectedSize, setSelectedSize] =
    useState("");

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  // FETCH PRODUCT

  useEffect(() => {

    fetch(
      `http://localhost:3001/products/${id}`
    )
      .then((res) => res.json())

      .then((data) => {

        setProduct(data);

        setLoading(false);

      })

      .catch((err) => {

        console.error(err);

        setLoading(false);

      });

  }, [id]);

  // CURRENT STOCK

  const selectedSizeData =
    product?.sizes?.find(
      (s) => s.size === selectedSize
    );

  const currentStock =
    selectedSizeData?.stock || 0;

  const outOfStock =
    selectedSize &&
    currentStock <= 0;

  // ADD TO CART

  const handleAddToCart =
    async () => {

      if (!product) return;

      // LOGIN CHECK

      if (!user) {

        toast.error(
          "Please login first"
        );

        setTimeout(() => {

          navigate("/login");

        }, 500);

        return;
      }

      // SIZE CHECK

      if (!selectedSize) {

        toast.error(
          "Please select size"
        );

        return;
      }

      // STOCK CHECK

      if (currentStock <= 0) {

        toast.error(
          "Out of stock"
        );

        return;
      }

      // DUPLICATE CHECK

      const exists = items.some(
        (i) =>
          String(
            i.productId || i.id
          ) ===
            String(product.id) &&
          i.selectedSize ===
            selectedSize
      );

      if (exists) {

        toast.error(
          "Already in cart"
        );

        return;
      }

      // CART ITEM

      const cartItem = {

        ...product,

        selectedSize,

        qty: 1,

        productId:
          product.id,

        userId: user.id,
      };

      try {

        const res = await fetch(
          "http://localhost:3001/cart",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify(
              cartItem
            ),
          }
        );

        if (!res.ok) {

          throw new Error(
            "Failed to add cart"
          );
        }

        const data =
          await res.json();

        dispatch(
          addToCart(data)
        );

        toast.success(
          "Added to cart"
        );

      } catch (err) {

        console.error(err);

        toast.error(
          "Failed to add to cart"
        );
      }
    };

  // BUY NOW

  const handleBuyNow =
    () => {

      if (!product) return;

      // LOGIN CHECK

      if (!user) {

        toast.error(
          "Please login first"
        );

        setTimeout(() => {

          navigate("/login");

        }, 500);

        return;
      }

      // SIZE CHECK

      if (!selectedSize) {

        toast.error(
          "Please select size"
        );

        return;
      }

      // STOCK CHECK

      if (currentStock <= 0) {

        toast.error(
          "Out of stock"
        );

        return;
      }

      // REMOVE OLD BUY NOW ITEM

      localStorage.removeItem(
        "buyNowItem"
      );

      // NEW BUY NOW ITEM

      const buyNowItem = [{

        ...product,

        selectedSize,

        qty: 1,

        productId:
          product.id,

        userId: user.id,
      }];

      // SAVE BUY NOW ITEM

      localStorage.setItem(
        "buyNowItem",
        JSON.stringify(
          buyNowItem
        )
      );

      toast.success(
        "Proceeding to checkout"
      );

      // NAVIGATE TO CHECKOUT

      navigate("/checkout");
    };

  // LOADING

  if (loading) {

    return (
      <p className="text-center mt-10 text-lg">
        Loading...
      </p>
    );
  }

  // PRODUCT NOT FOUND

  if (!product) {

    return (
      <p className="text-center mt-10 text-lg">
        Product not found
      </p>
    );
  }

  return (

    <div className="px-4 md:px-10 py-10 bg-[#f7f3ee]  min-h-screen">

      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-10 bg-white p-5 rounded-2xl shadow-md">

        {/* IMAGE */}

        <div>

          <img
            src={product.image}
            alt={product.name}
            className="w-full h-[450px] object-cover rounded-2xl"
          />

        </div>

        {/* DETAILS */}

        <div className="pt-2">

          <h1 className="text-2xl font-bold">
            {product.name}
          </h1>

          <p className="text-gray-500 mt-2">
            Category: {product.category}
          </p>

          <p className="text-gray-500 mt-1">
            Age: {product.age}
          </p>

          <p className="text-3xl font-bold mt-5">
            ₹{product.price}
          </p>

          {/* STOCK */}

          <p
            className={`mt-3 font-medium ${
              !selectedSize
                ? "text-gray-500"
                : currentStock <= 0
                ? "text-red-500"
                : currentStock <= 3
                ? "text-orange-500"
                : "text-green-600"
            }`}
          >

            {!selectedSize
              ? "Select size"
              : currentStock <= 0
              ? "Out of Stock"
              : currentStock <= 3
              ? `Only ${currentStock} left`
              : `In Stock (${currentStock})`}

          </p>

          <p className="text-gray-600 mt-5 leading-7">

            {product.description}

          </p>

          {/* SIZE */}

          <div className="mt-8">

            <h3 className="text-xl font-semibold mb-4">
              Select Size
            </h3>

            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">

              {product.sizes?.map(
                (sizeObj) => (

                  <button
                    key={sizeObj.size}
                    onClick={() =>
                      setSelectedSize(
                        sizeObj.size
                      )
                    }
                    className={`min-w-[95px] px-4 py-3 border rounded-xl text-sm font-medium transition ${
                      selectedSize ===
                      sizeObj.size
                        ? "border-orange-500 text-orange-500 bg-orange-50"
                        : "border-gray-400 text-gray-700 bg-white"
                    }`}
                  >

                    {sizeObj.size}

                  </button>
                )
              )}

            </div>

          </div>

          {/* BUTTONS */}

          <div className="flex gap-4 mt-7">

            {/* ADD TO CART */}

            <button
              onClick={
                handleAddToCart
              }
              disabled={
                outOfStock
              }
              className={`w-1/2 py-3 rounded-xl text-white font-semibold transition ${
                outOfStock
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-black hover:bg-gray-800"
              }`}
            >

              {outOfStock
                ? "Out of Stock"
                : "Add to Cart"}

            </button>

            {/* BUY NOW */}

            <button
              onClick={
                handleBuyNow
              }
              disabled={
                outOfStock
              }
              className={`w-1/2 py-3 rounded-xl border font-semibold transition ${
                outOfStock
                  ? "border-gray-300 text-gray-400 cursor-not-allowed"
                  : "border-black text-black hover:bg-black hover:text-white"
              }`}
            >

              Buy Now

            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default ProductDetails;
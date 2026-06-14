import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  removeFromCart,
  updateQty,
  clearCart,
  setCart,
} from "../redux/cartSlice";

import {
  removeCartItem,
  updateCartItem,
  clearCartItems,
  fetchCartItems,
} from "../api/cartApi";

import {
  useNavigate,
} from "react-router-dom";

import {
  useEffect,
} from "react";

import { toast } from "react-toastify";

function Cart() {

  const dispatch =
    useDispatch();

  const navigate =
    useNavigate();

  const {
    items,
    totalPrice,
  } = useSelector(
    (state) => state.cart
  );

  const user =
    JSON.parse(
      localStorage.getItem(
        "user"
      )
    );

  // LOAD CART FROM DB

  useEffect(() => {

    const loadCart =
      async () => {

        if (!user?.id)
          return;

        try {

          const data =
            await fetchCartItems(
              user.id
            );

          dispatch(
            setCart(data)
          );

        } catch (err) {

          console.error(err);
        }
      };

    loadCart();

  }, [dispatch]);

  // REMOVE ITEM

  const handleRemove =
    async (itemId) => {

      // UPDATE UI FIRST

      dispatch(
        removeFromCart(
          itemId
        )
      );

      try {

        // DELETE FROM DB

        await removeCartItem(
          itemId
        );

        toast.success(
          "Removed"
        );

      } catch (err) {

        console.error(err);

        toast.error(
          "Failed to remove"
        );
      }
    };

  // UPDATE QUANTITY

  const handleQtyChange =
    async (
      item,
      newQty
    ) => {

      if (newQty <= 0)
        return;

      try {

        // FETCH PRODUCT

        const res =
          await fetch(
            `http://localhost:3001/products/${item.productId}`
          );

        const product =
          await res.json();

        // FIND SIZE STOCK

        const sizeData =
          product.sizes?.find(
            (s) =>
              s.size ===
              item.selectedSize
          );

        const availableStock =
          sizeData?.stock || 0;

        // STOCK CHECK

        if (
          newQty >
          availableStock
        ) {

          toast.error(
            `Only ${availableStock} left`
          );

          return;
        }

        // UPDATE REDUX IMMEDIATELY

        dispatch(
          updateQty({
            id: item.id,
            qty: newQty,
          })
        );

        // UPDATE DATABASE

        await updateCartItem(
          item.id,
          newQty
        );

      } catch (err) {

        console.error(err);

        toast.error(
          "Failed to update"
        );
      }
    };

  // CLEAR CART

  const handleClear =
    async () => {

      // CLEAR UI

      dispatch(
        clearCart()
      );

      try {

        // CLEAR DB

        await clearCartItems(
          user.id
        );

        toast.success(
          "Cart cleared"
        );

      } catch (err) {

        console.error(err);

        toast.error(
          "Failed"
        );
      }
    };

  return (

    <div className="min-h-screen px-4 py-8 bg-[#f7f3ee] ">

      <h1 className="text-2xl font-bold text-center mb-8">

        Cart

      </h1>

      {items.length === 0 ? (

        <div className="text-center text-gray-500 mt-20">

          Cart is empty

        </div>

      ) : (

        <>

          {/* CART ITEMS */}

          <div className="max-w-3xl mx-auto space-y-4">

            {items.map((item) => (

              <div
                key={item.id}
                className="border rounded-xl p-4 flex gap-4 items-center"
              >

                {/* IMAGE */}

                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded"
                />

                {/* DETAILS */}

                <div className="flex-1">

                  <h2 className="font-medium">

                    {item.name}

                  </h2>

                  <p className="text-sm text-gray-500">

                    ₹{item.price}

                  </p>

                  <p className="text-sm text-gray-400">

                    Size:
                    {" "}
                    {item.selectedSize}

                  </p>

                  {/* QUANTITY */}

                  <div className="flex items-center gap-3 mt-3">

                    <button
                      onClick={() =>
                        handleQtyChange(
                          item,
                          item.qty - 1
                        )
                      }
                      className="px-3 py-1 border rounded"
                    >
                      -
                    </button>

                    <span className="font-medium">

                      {item.qty}

                    </span>

                    <button
                      onClick={() =>
                        handleQtyChange(
                          item,
                          item.qty + 1
                        )
                      }
                      className="px-3 py-1 border rounded"
                    >
                      +
                    </button>

                  </div>

                </div>

                {/* REMOVE */}

                <button
                  onClick={() =>
                    handleRemove(
                      item.id
                    )
                  }
                  className="text-red-500 text-sm"
                >
                  Remove
                </button>

              </div>
            ))}

          </div>

          {/* TOTAL */}

          <div className="max-w-3xl mx-auto mt-8 flex justify-between items-center border-t pt-5">

            <h2 className="font-bold text-xl">

              Total:
              {" "}
              ₹{totalPrice}

            </h2>

            <div className="flex gap-4">

              <button
                onClick={
                  handleClear
                }
                className="px-4 py-2 border rounded"
              >
                Clear
              </button>

             <button
  onClick={() => {

    // REMOVE BUY NOW ITEM

    localStorage.removeItem(
      "buyNowItem"
    );

    // OPEN CART CHECKOUT

    navigate(
      "/checkout?type=cart"
    );
  }}
  className="bg-black text-white px-5 py-2 rounded"
>
  Checkout
</button>
            </div>

          </div>

        </>

      )}

    </div>
  );
}

export default Cart;
import { useState } from "react";
import {
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  fetchProducts,
  addProductApi,
  updateProductApi,
  softDeleteProductApi,
  restoreProductApi,
} from "../api/productsApi";

import {
  FaEdit,
  FaTrash,
  FaUndo,
} from "react-icons/fa";

function Products() {

  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);

  const [editing, setEditing] = useState(false);

  const [view, setView] = useState("active");

  const [message, setMessage] = useState({ text: "", type: "", });

  const [page, setPage] =
    useState(1);
  const [search, setSearch] = useState("");


  const limit = 5

  const [confirm, setConfirm] =
    useState({
      open: false,
      type: null,
      id: null,
    });

  const [form, setForm] =
    useState({
      id: null,
      name: "",
      price: "",
      category: "",
      age: "",
      image: "",
      description: "",

      bestSeller: false,
      newArrival: false,

      sizes: [
        {
          size: "2-3 years",
          stock: "",
        },
        {
          size: "3-4 years",
          stock: "",
        },
        {
          size: "4-5 years",
          stock: "",
        },
        {
          size: "5-6 years",
          stock: "",
        },
      ],
    });



  // FETCH PRODUCTS

  const { data: products = [], } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });






  const notify = (text, type = "success") => {
    setMessage({ text, type });

    setTimeout(() => {
      setMessage({ text: "", type: "" });
    }, 2000);
  };
  // INPUT CHANGE

  const handleChange = (e) => {

    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setForm({
      ...form,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    });
  };

  // SIZE CHANGE

  const handleSizeChange = (
    index,
    value
  ) => {

    const updated = [
      ...form.sizes,
    ];

    updated[index].stock =
      value;

    setForm({
      ...form,
      sizes: updated,
    });
  };

  // OPEN ADD

  const openAdd = () => {

    setForm({
      id: null,
      name: "",
      price: "",
      category: "",
      age: "",
      image: "",
      description: "",

      bestSeller: false,
      newArrival: false,

      sizes: [
        {
          size: "2-3 years",
          stock: "",
        },
        {
          size: "3-4 years",
          stock: "",
        },
        {
          size: "4-5 years",
          stock: "",
        },
        {
          size: "5-6 years",
          stock: "",
        },
      ],
    });

    setEditing(false);

    setShowForm(true);
  };

  // EDIT

  const handleEdit = (item) => {

    setForm(item);

    setEditing(true);

    setShowForm(true);
  };

  // SUBMIT

  const handleSubmit = async (
    e
  ) => {

    e.preventDefault();

    const payload = {
      ...form,

      price: Number(form.price),

      sizes: form.sizes.map(
        (s) => ({
          ...s,
          stock: Number(
            s.stock
          ),
        })
      ),
    };

    try {

      // UPDATE
      if (editing) {

        await updateProductApi(
          form.id,
          payload
        );

      } else {

        // ADD
        await addProductApi(
          payload
        );
      }

      // REFRESH
      queryClient.invalidateQueries(
        {
          queryKey: [
            "products",
          ],
        }
      );

      queryClient.invalidateQueries(
        {
          queryKey: [
            "bestSellers",
          ],
        }
      );

      queryClient.invalidateQueries(
        {
          queryKey: [
            "newDrops",
          ],
        }
      );

      notify(
        editing
          ? "Product Updated"
          : "Product Added"
      );

      setShowForm(false);

      setEditing(false);

    } catch (error) {

      console.log(error);

      notify(
        "Something went wrong",
        "error"
      );
    }
  };

  // DELETE / RESTORE

  const openConfirm = (type,id) => {

    setConfirm({open: true,type,id,});
  };

  const handleConfirm = async () => {

    try {

      if ( confirm.type === "delete") {

        await softDeleteProductApi(confirm.id);

        notify(
          "Moved to Trash"
        );
      }

      if (confirm.type ==="restore" ) {

        await restoreProductApi(
          confirm.id
        );

        notify(
          "Restored"
        );
      }

      queryClient.invalidateQueries(
        {
          queryKey: [
            "products",
          ],
        }
      );

      setConfirm({
        open: false,
        type: null,
        id: null,
      });

    } catch (error) {

      console.log(error);

      notify(
        "Action failed",
        "error"
      );
    }
  };

  // FILTERS

  const active =
    products.filter(
      (p) => !p.deleted
    );

  const trash =
    products.filter(
      (p) => p.deleted
    );

  const source = view === "active"? active: trash;

  const filteredProducts =
    source.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );

  const totalPages =
    Math.ceil(
      filteredProducts.length /limit);

  const list =
    filteredProducts.slice(
      (page - 1) * limit,
      page * limit
    );

  return (
    <div className="p-6">

      {/* TOAST */}

      {message.text && (
        <div
          className={`
            fixed top-5 right-5
            px-4 py-2 rounded
            text-white z-50
            ${message.type ===
              "success"
              ? "bg-green-600"
              : "bg-red-600"
            }
          `}
        >
          {message.text}
        </div>
      )}

      {/* CONFIRM */}

      {confirm.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white p-5 rounded shadow w-80 text-center">

            <h2 className="mb-4 font-semibold">
              Are you sure?
            </h2>

            <div className="flex justify-center gap-4">

              <button
                onClick={
                  handleConfirm
                }
                className="bg-black text-white px-4 py-1"
              >
                Yes
              </button>

              <button
                onClick={() =>
                  setConfirm({
                    open: false,
                    type: null,
                    id: null,
                  })
                }
                className="border px-4 py-1"
              >
                No
              </button>

            </div>

          </div>

        </div>
      )}

      {/* HEADER */}

      <div className="flex justify-between items-center mb-5">

        <h1 className="text-3xl font-bold">
          Products
        </h1>

        <div className="flex gap-2 items-center">

          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="border px-3 py-1 rounded w-64"
          />

          <button
            onClick={() => {
              setView("active");
              setPage(1);
            }}
            className={`px-3 py-1 border ${view === "active"
                ? "bg-black text-white"
                : ""
              }`}
          >
            Active
          </button>

          <button
            onClick={() => {
              setView("trash");
              setPage(1);
            }}
            className={`px-3 py-1 border ${view === "trash"
                ? "bg-black text-white"
                : ""
              }`}
          >
            Trash
          </button>

          <button
            onClick={openAdd}
            className="bg-black text-white px-4 py-1"
          >
            Add Product
          </button>

        </div>

      </div>

      {/* FORM */}

      {showForm && (
        <form
          onSubmit={
            handleSubmit
          }
          className="border p-5 rounded-lg mb-5 space-y-3 bg-white"
        >

          <input
            name="name"
            placeholder="Product Name"
            value={form.name}
            onChange={
              handleChange
            }
            className="border p-2 w-full"
          />

          <input
            name="price"
            placeholder="Price"
            value={form.price}
            onChange={
              handleChange
            }
            className="border p-2 w-full"
          />

          <input
            name="category"
            placeholder="Category"
            value={
              form.category
            }
            onChange={
              handleChange
            }
            className="border p-2 w-full"
          />

          <input
            name="age"
            placeholder="Age"
            value={form.age}
            onChange={
              handleChange
            }
            className="border p-2 w-full"
          />

          <input
            name="image"
            placeholder="/images/product.jpg"
            value={form.image}
            onChange={
              handleChange
            }
            className="border p-2 w-full"
          />

          {form.image && (
            <img
              src={form.image}
              alt="preview"
              className="w-24 h-24 object-cover rounded border"
            />
          )}

          <textarea
            name="description"
            placeholder="Description"
            value={
              form.description
            }
            onChange={
              handleChange
            }
            className="border p-2 w-full"
          />

          {/* CHECKBOXES */}

          <div className="flex gap-5">

            <label className="flex items-center gap-2">

              <input
                type="checkbox"
                name="bestSeller"
                checked={
                  form.bestSeller
                }
                onChange={
                  handleChange
                }
              />

              Best Seller

            </label>

            <label className="flex items-center gap-2">

              <input
                type="checkbox"
                name="newArrival"
                checked={
                  form.newArrival
                }
                onChange={
                  handleChange
                }
              />

              New Arrival

            </label>

          </div>

          {/* SIZES */}

          <div className="border p-3 rounded space-y-2">

            <h3 className="font-semibold">
              Sizes
            </h3>

            {form.sizes.map(
              (s, i) => (
                <div
                  key={i}
                  className="flex gap-2 items-center"
                >

                  <span className="w-28">
                    {s.size}
                  </span>

                  <input
                    type="number"
                    value={
                      s.stock
                    }
                    onChange={(
                      e
                    ) =>
                      handleSizeChange(
                        i,
                        e.target.value
                      )
                    }
                    className="border p-1 w-full"
                  />

                </div>
              )
            )}

          </div>

          {/* BUTTONS */}

          <div className="flex gap-3">

            <button className="bg-black text-white px-4 py-2 rounded">

              {editing
                ? "Update"
                : "Add"}

            </button>

            <button
              type="button"
              onClick={() =>
                setShowForm(
                  false
                )
              }
              className="border px-4 py-2 rounded text-red-500"
            >
              Cancel
            </button>

          </div>

        </form>
      )}

      {/* TABLE */}

      <table className="w-full border">

        <thead className="bg-gray-100">

          <tr>

            <th className="p-3">
              Image
            </th>

            <th className="p-3">
              Name
            </th>
            <th className="p-3">
              Category
            </th>


            <th className="p-3">
              Price
            </th>

            <th className="p-3">
              Actions
            </th>

          </tr>

        </thead>

        <tbody>

          {list.map((p) => (

            <tr
              key={p.id}
              className="border-t text-center"
            >

              <td className="p-3">

                <img
                  src={p.image}
                  alt={p.name}
                  className="w-14 h-14 mx-auto rounded object-cover"
                />

              </td>

              <td className="p-3">
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <span>{p.name}</span>

                  {p.bestSeller && (
                    <span className="bg-yellow-500 text-white px-2 py-1 text-xs rounded">
                      Best
                    </span>
                  )}

                  {p.newArrival && (
                    <span className="bg-green-600 text-white px-2 py-1 text-xs rounded">
                      New
                    </span>
                  )}

                  {p.sizes?.every(
                    (size) => Number(size.stock) === 0
                  ) && (
                      <span className="bg-red-600 text-white px-2 py-1 text-xs rounded">
                        Out of Stock
                      </span>
                    )}
                </div>
              </td>

              <td className="p-3">
                <span className="bg-gray-100 px-3 py-1 rounded text-sm">
                  {p.category}
                </span>
              </td>

              <td className="p-3">
                ₹{p.price}
              </td>

              <td className="p-3 space-x-3">

                {view ===
                  "active" ? (
                  <>

                    <FaEdit
                      onClick={() =>
                        handleEdit(
                          p
                        )
                      }
                      className="inline cursor-pointer"
                    />

                    <FaTrash
                      onClick={() =>
                        openConfirm(
                          "delete",
                          p.id
                        )
                      }
                      className="inline cursor-pointer text-red-500"
                    />

                  </>
                ) : (
                  <FaUndo
                    onClick={() =>
                      openConfirm(
                        "restore",
                        p.id
                      )
                    }
                    className="inline cursor-pointer text-green-600"
                  />
                )}

              </td>

            </tr>
          ))}

        </tbody>

      </table>

      {/* PAGINATION */}

      <div className="flex justify-center mt-5 gap-2">

        <button
          disabled={
            page === 1
          }
          onClick={() =>
            setPage(
              (p) => p - 1
            )
          }
          className="border px-3 py-1 disabled:opacity-50"
        >
          Prev
        </button>

        {Array.from(
          {
            length:
              totalPages,
          },
          (_, i) => (
            <button
              key={i}
              onClick={() =>
                setPage(
                  i + 1
                )
              }
              className={`
                border px-3 py-1
                ${page ===
                  i + 1
                  ? "bg-black text-white"
                  : ""
                }
              `}
            >
              {i + 1}
            </button>
          )
        )}

        <button
          disabled={
            page === totalPages
          }
          onClick={() =>
            setPage(
              (p) => p + 1
            )
          }
          className="border px-3 py-1 disabled:opacity-50"
        >
          Next
        </button>

      </div>

    </div>
  );
}

export default Products;
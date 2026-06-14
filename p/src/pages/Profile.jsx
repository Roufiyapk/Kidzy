import { useState } from "react";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaPen,
} from "react-icons/fa";
import { toast } from "react-toastify";

function Profile() {
  const savedUser = JSON.parse(localStorage.getItem("user"));

  const [isEdit, setIsEdit] = useState(false);
  const [user, setUser] = useState(savedUser);

  const [form, setForm] = useState({
    name: savedUser?.name || "",
    email: savedUser?.email || "",
    phone: savedUser?.phone || "",
    address: savedUser?.address || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // 🔥 REAL DB UPDATE CALL
  const updateUserApi = async (id, data) => {
    const res = await fetch(`http://localhost:3001/users/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error("Failed to update user");
    }

    return res.json();
  };

  const handleSave = async () => {
    try {
      const updatedUser = await updateUserApi(user.id, form);

      // update localStorage
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // update local state
      setUser(updatedUser);
      setIsEdit(false);

      // notify navbar + others
      window.dispatchEvent(new Event("userUpdated"));

      toast.success("Profile updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <h1 className="text-lg text-gray-500">Please login first</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f3ee] flex items-center justify-center px-4">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl overflow-hidden">

        {/* HEADER */}
        <div className="bg-black text-white p-8 text-center">
          <div className="w-24 h-24 mx-auto rounded-full bg-white text-black flex items-center justify-center text-3xl font-bold">
            {user.name?.charAt(0)?.toUpperCase()}
          </div>

          <h1 className="text-2xl font-semibold mt-4">{user.name}</h1>
          <p className="text-gray-300 text-sm">{user.email}</p>
        </div>

        {/* BODY */}
        <div className="p-8 space-y-6">

          {/* EDIT BUTTON */}
          <div className="flex justify-end">
            <button
              onClick={() => (isEdit ? handleSave() : setIsEdit(true))}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border hover:bg-black hover:text-white transition text-sm"
            >
              <FaPen />
              {isEdit ? "Save Changes" : "Edit Profile"}
            </button>
          </div>

          {/* GRID */}
          <div className="grid md:grid-cols-2 gap-6">

            {/* NAME */}
            <div>
              <label className="flex items-center gap-2 text-gray-500 text-sm">
                <FaUser /> Full Name
              </label>

              {isEdit ? (
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-3"
                />
              ) : (
                <div className="px-4 py-3 border rounded-xl bg-gray-50">
                  {user.name}
                </div>
              )}
            </div>

            {/* EMAIL */}
            <div>
              <label className="flex items-center gap-2 text-gray-500 text-sm">
                <FaEnvelope /> Email
              </label>

              {isEdit ? (
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-3"
                />
              ) : (
                <div className="px-4 py-3 border rounded-xl bg-gray-50">
                  {user.email}
                </div>
              )}
            </div>

            {/* PHONE */}
            <div>
              <label className="flex items-center gap-2 text-gray-500 text-sm">
                <FaPhone /> Phone
              </label>

              {isEdit ? (
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-3"
                />
              ) : (
                <div className="px-4 py-3 border rounded-xl bg-gray-50">
                  {user.phone || "Not Added"}
                </div>
              )}
            </div>

            {/* ADDRESS */}
            <div>
              <label className="flex items-center gap-2 text-gray-500 text-sm">
                <FaMapMarkerAlt /> Address
              </label>

              {isEdit ? (
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  rows="3"
                  className="w-full border rounded-xl px-4 py-3"
                />
              ) : (
                <div className="px-4 py-3 border rounded-xl bg-gray-50 min-h-[80px]">
                  {user.address || "Not Added"}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
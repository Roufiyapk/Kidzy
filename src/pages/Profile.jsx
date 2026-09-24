import { useState } from "react";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaPen,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../api/api";

function Profile() {
  const savedUser = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const [isEdit, setIsEdit] = useState(false);
  const [user, setUser] = useState(savedUser);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: savedUser?.name || "",
    email: savedUser?.email || "",
    phone: savedUser?.phone || "",
    address: savedUser?.address || "",
    pincode: savedUser?.pincode || "",
  });

  // HANDLE INPUT

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      if (!/^\d{0,10}$/.test(value)) return;
    }

    if (name === "pincode") {
      if (!/^\d{0,6}$/.test(value)) return;
    }

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // UPDATE USER

  const updateUserApi = async (id, data) => {
    const response = await api.patch(`/users/${id}`, data);
    return response.data;
  };

  // EDIT

  const handleEdit = () => {
    setForm({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
      pincode: user?.pincode || "",
    });

    setIsEdit(true);
  };

  // CANCEL

  const handleCancel = () => {
    setForm({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
      pincode: user?.pincode || "",
    });

    setIsEdit(false);
  };

  // SAVE PROFILE + SAVED ADDRESS

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!form.email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (
      form.phone.trim() &&
      !/^\d{10}$/.test(form.phone.trim())
    ) {
      toast.error("Phone number must be 10 digits");
      return;
    }

    if (
      form.pincode.trim() &&
      !/^\d{6}$/.test(form.pincode.trim())
    ) {
      toast.error("PIN code must be 6 digits");
      return;
    }

    if (
      form.address.trim() &&
      !form.pincode.trim()
    ) {
      toast.error("Please enter PIN code for the saved address");
      return;
    }

    try {
      setSaving(true);

      const updatedData = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        pincode: form.pincode.trim(),
      };

      const updatedUser = await updateUserApi(
        user.id,
        updatedData
      );

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      setUser(updatedUser);
      setForm({
        name: updatedUser.name || "",
        email: updatedUser.email || "",
        phone: updatedUser.phone || "",
        address: updatedUser.address || "",
        pincode: updatedUser.pincode || "",
      });

      setIsEdit(false);

      // Navbar listens to this event.
      window.dispatchEvent(
        new Event("userUpdated")
      );

      toast.success(
        "Profile and saved address updated"
      );
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(
        error?.response?.status === 404
          ? "User not found"
          : "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  // NO USER

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f7f3ee] flex items-center justify-center px-4">
        <div className="bg-white border border-[#e7ded5] rounded-2xl px-8 py-10 text-center">
          <p className="text-stone-500 text-sm">
            Please login first.
          </p>
        </div>
      </div>
    );
  }

  const initial =
    user.name?.trim()?.charAt(0)?.toUpperCase() || "U";

  const hasSavedAddress =
    Boolean(user.address?.trim());

  return (
    <div className="min-h-screen bg-[#f7f3ee] px-4 py-8 sm:py-10">
      <div className="max-w-4xl mx-auto">

        {/* PROFILE CARD */}

        <div className="bg-white border border-[#e7ded5] rounded-3xl overflow-hidden">

          {/* HEADER */}

          <div className="px-6 sm:px-10 py-8 border-b border-[#eee6df]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">

              {/* USER */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#f7f3ee] border border-[#ddd3ca] flex items-center justify-center text-xl sm:text-2xl font-bold text-stone-800 flex-shrink-0">
                  {initial}
                </div>

                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.18em] text-stone-400 font-semibold">
                    My Profile
                  </p>

                  <h1 className="text-xl sm:text-2xl font-semibold text-stone-900 mt-1 truncate">
                    {user.name}
                  </h1>

                  <p className="text-sm text-stone-500 mt-1 break-all">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* EDIT / SAVE */}
              {!isEdit ? (
                <button
                  type="button"
                  onClick={handleEdit}
                  className="self-start sm:self-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-stone-300 text-sm font-medium text-stone-800 hover:bg-stone-900 hover:text-white transition"
                >
                  <FaPen className="text-xs" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-stone-300 text-sm font-medium text-stone-700 hover:bg-stone-100 transition"
                  >
                    <FaTimes className="text-xs" />
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-900 text-white text-sm font-medium hover:bg-[#F47B20] hover:text-stone-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaCheck className="text-xs" />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* BODY */}

          <div className="px-5 sm:px-8 py-7 sm:py-9">

            {!isEdit ? (
              <>
                {/* PERSONAL DETAILS */}
                <div>
                  <div className="mb-5">
                    <h2 className="text-lg font-semibold text-stone-900">
                      Personal Details
                    </h2>
                    <p className="text-sm text-stone-500 mt-1">
                      Your account information
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <ProfileField
                      icon={<FaUser />}
                      label="Full Name"
                      value={user.name}
                    />

                    <ProfileField
                      icon={<FaEnvelope />}
                      label="Email"
                      value={user.email}
                    />

                    <ProfileField
                      icon={<FaPhone />}
                      label="Phone"
                      value={user.phone || "Not Added"}
                    />

                    <ProfileField
                      icon={<FaMapMarkerAlt />}
                      label="Address"
                      value={user.address || "Not Added"}
                      multiline
                    />
                  </div>
                </div>

                {/* SAVED ADDRESS */}
                <div className="mt-8">
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold text-stone-900">
                      Saved Address
                    </h2>
                    <p className="text-sm text-stone-500 mt-1">
                      This address will be used automatically in Checkout.
                    </p>
                  </div>

                  <div className="border border-[#e7ded5] rounded-2xl p-5 bg-[#fffaf5]">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-white border border-[#e7ded5] flex items-center justify-center flex-shrink-0">
                        <FaMapMarkerAlt className="text-[#F47B20] text-sm" />
                      </div>

                      <div className="min-w-0">
                        {hasSavedAddress ? (
                          <>
                            <p className="text-sm font-medium text-stone-900 leading-6">
                              {user.address}
                            </p>

                            {user.pincode && (
                              <p className="text-xs text-stone-500 mt-2">
                                PIN Code: {user.pincode}
                              </p>
                            )}

                            {user.phone && (
                              <p className="text-xs text-stone-500 mt-1">
                                Phone: {user.phone}
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="text-sm text-stone-500">
                            No saved address yet. Click Edit Profile to add one.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* EDIT FORM */}
                <div>
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-stone-900">
                      Edit Profile
                    </h2>
                    <p className="text-sm text-stone-500 mt-1">
                      Update your details and save your delivery address.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <EditField
                      icon={<FaUser />}
                      label="Full Name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                    />

                    <EditField
                      icon={<FaEnvelope />}
                      label="Email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                    />

                    <EditField
                      icon={<FaPhone />}
                      label="Phone"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="10 digit phone number"
                      maxLength={10}
                      inputMode="numeric"
                    />

                    <EditField
                      icon={<FaMapMarkerAlt />}
                      label="PIN Code"
                      name="pincode"
                      value={form.pincode}
                      onChange={handleChange}
                      placeholder="6 digit PIN code"
                      maxLength={6}
                      inputMode="numeric"
                    />

                    <div className="md:col-span-2">
                      <label className="flex items-center gap-2 text-xs uppercase tracking-wide text-stone-400 font-semibold mb-2">
                        <FaMapMarkerAlt />
                        Saved Delivery Address
                      </label>

                      <textarea
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Enter your delivery address"
                        className="w-full border border-[#dcd3cb] rounded-xl bg-white px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 outline-none resize-none transition focus:border-stone-700"
                      />

                      <p className="text-xs text-stone-400 mt-2">
                        This address will be available in Checkout as your saved address.
                      </p>
                    </div>
                  </div>

                  {/* SAVE ADDRESS EXPLANATION */}
                  <div className="mt-6 border border-[#eee6df] rounded-2xl px-4 py-3 bg-[#fcfbf9]">
                    <p className="text-sm text-stone-600">
                      Saving this profile will also save the delivery address,
                      PIN code, and phone number for future orders.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileField({
  icon,
  label,
  value,
  multiline = false,
}) {
  return (
    <div>
      <label className="flex items-center gap-2 text-xs uppercase tracking-wide text-stone-400 font-semibold mb-2">
        {icon}
        {label}
      </label>

      <div
        className={`border border-[#e5ddd5] rounded-xl bg-[#fcfbf9] px-4 py-3 text-sm text-stone-800 ${
          multiline ? "min-h-[72px] leading-6" : ""
        }`}
      >
        {value || "Not Added"}
      </div>
    </div>
  );
}

function EditField({
  icon,
  label,
  name,
  value,
  onChange,
  placeholder,
  maxLength,
  inputMode,
}) {
  return (
    <div>
      <label className="flex items-center gap-2 text-xs uppercase tracking-wide text-stone-400 font-semibold mb-2">
        {icon}
        {label}
      </label>

      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        inputMode={inputMode}
        className="w-full border border-[#dcd3cb] rounded-xl bg-white px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 outline-none transition focus:border-stone-700"
      />
    </div>
  );
}

export default Profile;

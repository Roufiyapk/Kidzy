import { useEffect, useState } from "react";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaPen,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../api/api";

function Profile() {
  const [isEdit, setIsEdit] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    pincode: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);

      const response = await api.get("/users/profile");

      const responseData =
        response?.data?.data ?? response?.data;

      setUser(responseData);

      setForm({
        name: responseData?.name || "",
        email: responseData?.email || "",
        phone: responseData?.phone || "",
        address: responseData?.address || "",
        pincode: responseData?.pincode || "",
      });

      localStorage.setItem(
        "user",
        JSON.stringify(responseData)
      );
    } catch (error) {
      console.error("Profile loading error:", error);

      if (error?.response?.status === 401) {
        toast.error("Please login first");
      } else {
        toast.error("Failed to load profile");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      if (!/^\d{0,10}$/.test(value)) {
        return;
      }
    }

    if (name === "pincode") {
      if (!/^\d{0,6}$/.test(value)) {
        return;
      }
    }

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

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
      toast.error(
        "Please enter PIN code for the saved address"
      );
      return;
    }

    try {
      setSaving(true);

      const updateData = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        pincode: form.pincode.trim(),
      };

      const response = await api.put(
        "/users/profile",
        updateData
      );

      const updatedUser =
        response?.data?.data ?? response?.data;

      setUser(updatedUser);

      setForm({
        name: updatedUser?.name || "",
        email: updatedUser?.email || "",
        phone: updatedUser?.phone || "",
        address: updatedUser?.address || "",
        pincode: updatedUser?.pincode || "",
      });

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      setIsEdit(false);

      window.dispatchEvent(
        new Event("userUpdated")
      );

      toast.success("Profile updated successfully");
    } catch (error) {
      console.error(
        "Profile update error:",
        error
      );

      if (error?.response?.status === 401) {
        toast.error("Please login again");
      } else if (
        error?.response?.status === 404
      ) {
        toast.error("User not found");
      } else {
        toast.error(
          error?.response?.data?.message ||
            "Failed to update profile"
        );
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f3ee] flex items-center justify-center">
        <div className="text-sm text-[#7A6A5D]">
          Loading profile...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f7f3ee] flex items-center justify-center px-4">
        <div className="bg-white border border-[#e7ded5] rounded-2xl px-8 py-10 text-center">
          <p className="text-[#7A6A5D] text-sm">
            Please login first.
          </p>
        </div>
      </div>
    );
  }

  const initial =
    user.name
      ?.trim()
      ?.charAt(0)
      ?.toUpperCase() || "U";

  const hasSavedAddress =
    Boolean(user.address?.trim());

  return (
    <div className="min-h-screen bg-[#f7f3ee] px-4 py-8 sm:py-10">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border border-[#e7ded5] rounded-3xl overflow-hidden">
          <div className="px-6 sm:px-10 py-8 border-b border-[#eee6df]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#f7f3ee] border border-[#ddd3ca] flex items-center justify-center text-xl sm:text-2xl font-bold text-[#5A4030] flex-shrink-0">
                  {initial}
                </div>

                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#9A8A7D] font-semibold">
                    My Profile
                  </p>

                  <h1 className="text-xl sm:text-2xl font-semibold text-[#5A4030] mt-1 truncate">
                    {user.name}
                  </h1>

                  <p className="text-sm text-[#7A6A5D] mt-1 break-all">
                    {user.email}
                  </p>
                </div>
              </div>

              {!isEdit ? (
                <button
                  type="button"
                  onClick={handleEdit}
                  className="self-start sm:self-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-[#E7DED5] text-sm font-medium text-[#5A4030] hover:bg-[#5A4030] hover:text-white transition"
                >
                  <FaPen className="text-xs" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-[#E7DED5] text-sm font-medium text-[#6B4F3A] hover:bg-[#F7F3EE] transition"
                  >
                    <FaTimes className="text-xs" />
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#5A4030] text-white text-sm font-medium hover:bg-[#7A604B] hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaCheck className="text-xs" />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="px-5 sm:px-8 py-7 sm:py-9">
            {!isEdit ? (
              <>
                <div>
                  <div className="mb-5">
                    <h2 className="text-lg font-semibold text-[#5A4030]">
                      Personal Details
                    </h2>

                    <p className="text-sm text-[#7A6A5D] mt-1">
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

                <div className="mt-8">
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold text-[#5A4030]">
                      Saved Address
                    </h2>

                    <p className="text-sm text-[#7A6A5D] mt-1">
                      This address will be used automatically in Checkout.
                    </p>
                  </div>

                  <div className="border border-[#e7ded5] rounded-2xl p-5 bg-[#fffaf5]">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-white border border-[#e7ded5] flex items-center justify-center flex-shrink-0">
                        <FaMapMarkerAlt className="text-[#6B4F3A] text-sm" />
                      </div>

                      <div className="min-w-0">
                        {hasSavedAddress ? (
                          <>
                            <p className="text-sm font-medium text-[#5A4030] leading-6">
                              {user.address}
                            </p>

                            {user.pincode && (
                              <p className="text-xs text-[#7A6A5D] mt-2">
                                PIN Code: {user.pincode}
                              </p>
                            )}

                            {user.phone && (
                              <p className="text-xs text-[#7A6A5D] mt-1">
                                Phone: {user.phone}
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="text-sm text-[#7A6A5D]">
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
                <div>
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-[#5A4030]">
                      Edit Profile
                    </h2>

                    <p className="text-sm text-[#7A6A5D] mt-1">
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
                      <label className="flex items-center gap-2 text-xs uppercase tracking-wide text-[#9A8A7D] font-semibold mb-2">
                        <FaMapMarkerAlt />
                        Saved Delivery Address
                      </label>

                      <textarea
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Enter your delivery address"
                        className="w-full border border-[#dcd3cb] rounded-xl bg-white px-4 py-3 text-sm text-[#5A4030] placeholder:text-[#9A8A7D] outline-none resize-none transition focus:border-stone-700"
                      />

                      <p className="text-xs text-[#9A8A7D] mt-2">
                        This address will be available in Checkout as your saved address.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 border border-[#eee6df] rounded-2xl px-4 py-3 bg-[#fcfbf9]">
                    <p className="text-sm text-[#6B4F3A]">
                      Saving this profile will also save the delivery address, PIN code, and phone number for future orders.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

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
        icon={false}
        toastStyle={{
          background: "#FFF5F7",
          color: "#78394B",
          border: "1px solid #F0C7D1",
          borderRadius: "10px",
          boxShadow: "0 4px 14px rgba(120, 57, 75, 0.10)",
          fontSize: "13px",
          fontWeight: "500",
          minHeight: "42px",
          padding: "10px 14px",
        }}
      />
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
      <label className="flex items-center gap-2 text-xs uppercase tracking-wide text-[#9A8A7D] font-semibold mb-2">
        {icon}
        {label}
      </label>

      <div
        className={`border border-[#e5ddd5] rounded-xl bg-[#fcfbf9] px-4 py-3 text-sm text-[#5A4030] ${
          multiline
            ? "min-h-[72px] leading-6"
            : ""
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
      <label className="flex items-center gap-2 text-xs uppercase tracking-wide text-[#9A8A7D] font-semibold mb-2">
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
        className="w-full border border-[#dcd3cb] rounded-xl bg-white px-4 py-3 text-sm text-[#5A4030] placeholder:text-[#9A8A7D] outline-none transition focus:border-stone-700"
      />
    </div>
  );
}

export default Profile;
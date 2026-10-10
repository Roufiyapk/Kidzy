import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import api from "../api/api";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const response = await api.post("/Auth/register", {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password,
      });

      console.log("REGISTER RESPONSE:", response.data);

      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      notify("success", "Account created successfully.");
      setTimeout(() => navigate("/login"), 500);
    } catch (error) {
      console.error("REGISTER ERROR:", error);
      console.error("STATUS:", error.response?.status);
      console.error("BACKEND RESPONSE:", error.response?.data);

      const backendData = error.response?.data;
      let message = "Registration failed.";

      if (backendData?.errors) {
        if (Array.isArray(backendData.errors)) {
          message = backendData.errors.join(" ");
        } else if (typeof backendData.errors === "object") {
          message = Object.values(backendData.errors).flat().join(" ");
        }
      }

      if (backendData?.message) {
        message = backendData.message;
      }

      if (error.code === "ERR_NETWORK") {
        message =
          "Cannot connect to backend. Check API URL and backend server.";
      }

      notify("error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-[#F7F3EE] px-4 py-10">
        <div className="w-full max-w-xl rounded-[28px] border border-[#E7DED5] bg-white px-6 py-10 shadow-[0_24px_70px_rgba(90,64,48,0.12)] sm:px-10 lg:px-14">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8 text-center">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#5A4030]">KIDZY</p>
              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-[#8A7566]">Join the KIDZY family</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#3D2B20] sm:text-4xl">Create account</h1>
              <p className="mt-3 text-sm leading-6 text-[#8A7566]">Enter your details below to get started.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="register-name" className="mb-2 block text-sm font-medium text-[#5A4030]">Full name</label>
                <input id="register-name" type="text" name="name" autoComplete="name" placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-[#E7DED5] bg-[#FCFAF8] px-4 py-3.5 text-sm text-[#3D2B20] outline-none transition placeholder:text-[#A99A8D] focus:border-[#6B4F3A] focus:bg-white focus:ring-4 focus:ring-[#6B4F3A]/10" />
              </div>
              <div>
                <label htmlFor="register-email" className="mb-2 block text-sm font-medium text-[#5A4030]">Email address</label>
                <input id="register-email" type="email" name="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-[#E7DED5] bg-[#FCFAF8] px-4 py-3.5 text-sm text-[#3D2B20] outline-none transition placeholder:text-[#A99A8D] focus:border-[#6B4F3A] focus:bg-white focus:ring-4 focus:ring-[#6B4F3A]/10" />
              </div>
              <div>
                <label htmlFor="register-password" className="mb-2 block text-sm font-medium text-[#5A4030]">Password</label>
                <input id="register-password" type="password" name="password" autoComplete="new-password" placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-[#E7DED5] bg-[#FCFAF8] px-4 py-3.5 text-sm text-[#3D2B20] outline-none transition placeholder:text-[#A99A8D] focus:border-[#6B4F3A] focus:bg-white focus:ring-4 focus:ring-[#6B4F3A]/10" />
              </div>
              <div>
                <label htmlFor="register-confirm-password" className="mb-2 block text-sm font-medium text-[#5A4030]">Confirm password</label>
                <input id="register-confirm-password" type="password" name="confirmPassword" autoComplete="new-password" placeholder="Re-enter your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full rounded-xl border border-[#E7DED5] bg-[#FCFAF8] px-4 py-3.5 text-sm text-[#3D2B20] outline-none transition placeholder:text-[#A99A8D] focus:border-[#6B4F3A] focus:bg-white focus:ring-4 focus:ring-[#6B4F3A]/10" />
              </div>
              <button type="submit" disabled={loading} className="w-full rounded-xl bg-[#5A4030] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-[#6B4F3A] focus:outline-none focus:ring-4 focus:ring-[#6B4F3A]/20 disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? "Creating account..." : "Create account"}
              </button>
              <p className="pt-1 text-center text-sm text-[#8A7566]">
                Already have an account?{" "}
                <button type="button" onClick={() => navigate("/login")} className="font-semibold text-[#5A4030] underline-offset-4 transition hover:text-[#6B4F3A] hover:underline">Log in</button>
              </p>
            </form>
            <p className="mt-8 text-center text-[11px] tracking-wide text-[#B2A397]">A little place for all their big adventures.</p>
          </div>
        </div>
      </div>
      <ToastContainer position="bottom-center" autoClose={1800} hideProgressBar closeButton={false} newestOnTop={false} rtl={false} pauseOnFocusLoss draggable={false} pauseOnHover />
    </>
  );
}

export default Register;

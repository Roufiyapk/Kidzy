import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../api/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [, setLoginError] = useState("");

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

    setLoginError("");
    try {
      setLoading(true);

      const response = await api.post(
        "/Auth/login",
        {
          email: email
            .trim()
            .toLowerCase(),

          password: password,
        }
      );

      console.log(
        "LOGIN RESPONSE:",
        response.data
      );

      const responseData =
        response.data;

      const data =
        responseData?.data ??
        responseData?.Data ??
        responseData;

      console.log(
        "LOGIN DATA:",
        data
      );

      const token =
        data?.token ??
        data?.Token ??
        data?.accessToken ??
        data?.AccessToken ??
        responseData?.token ??
        responseData?.Token ??
        responseData?.accessToken ??
        responseData?.AccessToken ??
        null;

      console.log(
        "TOKEN:",
        token
      );

      let user =
        data?.user ??
        data?.User ??
        data?.userResponse ??
        data?.UserResponse ??
        null;

      if (
        !user &&
        data &&
        typeof data === "object" &&
        !Array.isArray(data)
      ) {
        const looksLikeUser =
          data?.id != null ||
          data?.Id != null ||
          data?.email != null ||
          data?.Email != null ||
          data?.name != null ||
          data?.Name != null;

        if (looksLikeUser) {
          user = data;
        }
      }

      console.log(
        "USER:",
        user
      );

      if (token) {
        localStorage.setItem(
          "token",
          String(token)
        );
      }

      if (user) {
        localStorage.setItem(
          "user",
          JSON.stringify(user)
        );
      }

      const savedUser =
        localStorage.getItem("user");

      console.log(
        "SAVED USER:",
        savedUser
      );

      const role =
        user?.role ??
        user?.Role ??
        data?.role ??
        data?.Role ??
        responseData?.role ??
        responseData?.Role ??
        "";

      console.log(
        "ROLE:",
        role
      );

      if (
        role &&
        role
          .toString()
          .toLowerCase() ===
          "admin"
      ) {

        localStorage.removeItem(
          "user"
        );

        if (user) {
          localStorage.setItem(
            "admin",
            JSON.stringify(user)
          );
        }

        window.dispatchEvent(
          new Event("authChanged")
        );

        window.dispatchEvent(
          new Event("userUpdated")
        );

        navigate("/admin");

        return;
      }

      localStorage.removeItem(
        "admin"
      );

      window.dispatchEvent(
        new Event("authChanged")
      );

      window.dispatchEvent(
        new Event("userUpdated")
      );

      navigate("/");

    } catch (error) {
      console.error(
        "LOGIN ERROR:",
        error
      );

      console.error(
        "STATUS:",
        error?.response?.status
      );

      console.error(
        "BACKEND RESPONSE:",
        error?.response?.data
      );

      const backendData =
        error?.response?.data;

      let message =
        "Login failed.";

      if (backendData?.errors) {
        if (
          Array.isArray(
            backendData.errors
          )
        ) {
          message =
            backendData.errors.join(
              " "
            );
        } else if (
          typeof backendData.errors ===
          "object"
        ) {
          message =
            Object.values(
              backendData.errors
            )
              .flat()
              .join(" ");
        }
      }

      if (
        backendData?.message ||
        backendData?.Message
      ) {
        message =
          backendData?.message ??
          backendData?.Message;
      }

      if (
        error?.code ===
        "ERR_NETWORK"
      ) {
        message =
          "Cannot connect to backend. Check API URL and backend server.";
      }

      setLoginError(message);
      notify("error", message);

      } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <ToastContainer />
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F7F3EE] px-4 py-12">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#E7DED5]/70 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-[#E7DED5]/60 blur-3xl" />

      <div className="relative grid w-full max-w-xl overflow-hidden rounded-[2rem] border border-[#E7DED5] bg-white shadow-[0_24px_80px_rgba(90,64,48,0.12)]">
        <div className="flex items-center justify-center px-6 py-10 sm:px-10 md:px-12 lg:px-16">
          <div className="w-full max-w-md">
            <div className="mb-9 md:hidden">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#5A4030]">KIDZY</p>
            </div>
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#8C7666]">Your account</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#5A4030] sm:text-4xl">Welcome back</h1>
              <p className="mt-3 text-sm leading-6 text-[#8C7666]">Enter your details below to sign in to your account.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="login-email" className="mb-2 block text-sm font-medium text-[#5A4030]">Email address</label>
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setLoginError("");
                  }}
                  className="w-full rounded-xl border border-[#E7DED5] bg-[#FCFAF8] px-4 py-3.5 text-sm text-[#5A4030] outline-none transition placeholder:text-[#B2A397] focus:border-[#6B4F3A] focus:bg-white focus:ring-4 focus:ring-[#E7DED5]/60"
                />
              </div>
              <div>
                <label htmlFor="login-password" className="mb-2 block text-sm font-medium text-[#5A4030]">Password</label>
                <input
                  id="login-password"
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setLoginError("");
                  }}
                  className="w-full rounded-xl border border-[#E7DED5] bg-[#FCFAF8] px-4 py-3.5 text-sm text-[#5A4030] outline-none transition placeholder:text-[#B2A397] focus:border-[#6B4F3A] focus:bg-white focus:ring-4 focus:ring-[#E7DED5]/60"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#5A4030] px-5 py-3.5 text-sm font-semibold text-white shadow-md shadow-[#5A4030]/15 transition duration-200 hover:bg-[#6B4F3A] focus:outline-none focus:ring-4 focus:ring-[#E7DED5] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Logging in..." : "Sign In"}
              </button>
              <p className="pt-2 text-center text-sm text-[#8C7666]">
                Don’t have an account?{" "}
                <span
                  onClick={() => navigate("/register")}
                  className="cursor-pointer font-semibold text-[#5A4030] underline decoration-[#E7DED5] decoration-2 underline-offset-4 transition hover:text-[#6B4F3A]"
                >
                  Create an account
                </span>
              </p>
            </form>
            <p className="mt-10 text-center text-[11px] tracking-wide text-[#B2A397]">A little place for all their big adventures.</p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default Login;
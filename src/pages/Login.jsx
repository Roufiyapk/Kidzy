import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";

import { setWishlist } from "../redux/wishlistSlice";
import api from "../api/api";

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [loginError, setLoginError] =
    useState("");

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },

    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid Email")
        .required("Required"),

      password: Yup.string()
        .required("Required"),
    }),

    onSubmit: async (values) => {
      try {
        const res = await api.get(
          "/users"
        );

        const users = res.data;

        const foundUser = users.find(
          (u) =>
            u.email?.trim().toLowerCase() ===
              values.email
                .trim()
                .toLowerCase() &&
            u.password?.trim() ===
              values.password.trim()
        );

        // INVALID LOGIN

        if (!foundUser) {
          setLoginError(
            "Invalid Credentials"
          );
          return;
        }

        // BLOCKED USER

        if (
          foundUser.blocked ||
          foundUser.isBlocked
        ) {
          setLoginError(
            "Your account is blocked"
          );
          return;
        }

        setLoginError("");

        // ADMIN LOGIN

        if (
          foundUser.role?.toLowerCase() ===
          "admin"
        ) {
          // Remove normal user session
          localStorage.removeItem(
            "user"
          );

          // Save admin session
          localStorage.setItem(
            "admin",
            JSON.stringify(foundUser)
          );

          toast.success(
            "Admin Login Successful"
          );

          // GO DIRECTLY TO ADMIN PAGE
          navigate("/admin");

          return;
        }

        // NORMAL USER LOGIN

        localStorage.removeItem(
          "admin"
        );

        localStorage.setItem(
          "user",
          JSON.stringify(foundUser)
        );

        // FETCH USER WISHLIST

        try {
          const wishlistResponse =
            await api.get(
              `/wishlist?userId=${foundUser.id}`
            );

          dispatch(
            setWishlist(
              wishlistResponse.data
            )
          );
        } catch (err) {
          console.error(
            "Wishlist fetch error:",
            err
          );

          dispatch(
            setWishlist([])
          );
        }

        // UPDATE NAVBAR

        window.dispatchEvent(
          new Event("userUpdated")
        );

        toast.success(
          "Login Successful"
        );

        // NORMAL USER GOES HOME

        navigate("/");
      } catch (err) {
        console.error(
          "Login error:",
          err
        );

        setLoginError(
          "Something went wrong"
        );
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">

      <div className="w-full max-w-sm bg-white border rounded-xl p-6">

        <h1 className="text-xl font-semibold text-center mb-6">
          Login
        </h1>

        <form
          onSubmit={
            formik.handleSubmit
          }
          className="space-y-4"
        >

          {/* EMAIL */}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={
              formik.values.email
            }
            onChange={(e) => {
              formik.handleChange(e);
              setLoginError("");
            }}
            onBlur={
              formik.handleBlur
            }
            className="w-full border rounded-md p-2 text-sm outline-none focus:border-black"
          />

          {formik.touched.email &&
            formik.errors.email && (
              <p className="text-red-500 text-xs">
                {formik.errors.email}
              </p>
            )}

          {/* PASSWORD */}

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={
              formik.values.password
            }
            onChange={(e) => {
              formik.handleChange(e);
              setLoginError("");
            }}
            onBlur={
              formik.handleBlur
            }
            className="w-full border rounded-md p-2 text-sm outline-none focus:border-black"
          />

          {formik.touched.password &&
            formik.errors.password && (
              <p className="text-red-500 text-xs">
                {formik.errors.password}
              </p>
            )}

          {/* LOGIN ERROR */}

          {loginError && (
            <p className="text-red-500 text-xs text-center">
              {loginError}
            </p>
          )}

          {/* LOGIN BUTTON */}

          <button
            type="submit"
            disabled={
              formik.isSubmitting
            }
            className="w-full bg-black text-white text-sm py-2 rounded-md hover:opacity-90 disabled:opacity-50"
          >
            {formik.isSubmitting
              ? "Logging in..."
              : "Login"}
          </button>

          {/* REGISTER */}

          <p className="text-center text-xs text-gray-500">
            No account?{" "}

            <span
              onClick={() =>
                navigate(
                  "/register"
                )
              }
              className="text-black cursor-pointer"
            >
              Register
            </span>
          </p>

        </form>

      </div>

    </div>
  );
}

export default Login;
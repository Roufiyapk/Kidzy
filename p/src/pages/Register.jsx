import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { setWishlist } from "../redux/wishlistSlice";
import { fetchWishlist } from "../api/wishlistApi";

function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),

    email: Yup.string()
      .email("Invalid email")
      .required("Email is required"),

    password: Yup.string()
      .min(4, "Minimum 4 characters")
      .required("Password is required"),

    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "Passwords must match")
      .required("Confirm password is required"),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },

    validationSchema,

    onSubmit: async (values) => {
      try {
        // 🔥 CHECK IF USER EXISTS (efficient way)
        const checkRes = await fetch(
          `http://localhost:3001/users?email=${values.email}`
        );

        const existingUsers = await checkRes.json();

        if (existingUsers.length > 0) {
          toast.error("User already exists");
          return;
        }

        // 🔥 CREATE USER
        const response = await fetch("http://localhost:3001/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: values.name,
            email: values.email,
            password: values.password,

            role: "user",
            blocked: false,
          }),
        });

        const data = await response.json();

        // 🔥 STORE LOGIN STATE
        localStorage.setItem("user", JSON.stringify(data));

        // 🔥 LOAD WISHLIST
        try {
          const userWishlist = await fetchWishlist(data.id);
          dispatch(setWishlist(userWishlist));
        } catch (err) {
          console.error("Error loading wishlist:", err);
        }

        // 🔥 SYNC UI
        window.dispatchEvent(new Event("userUpdated"));

        toast.success("Registration Successful");

        navigate("/");
      } catch (error) {
        console.log(error);
        toast.error("Registration Failed");
      }
    },
  });

  return (
    <div className="min-h-screen flex justify-center items-center bg-pink-50">
      <form
        onSubmit={formik.handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-lg w-[350px] flex flex-col gap-4"
      >
        <h1 className="text-2xl font-bold text-center">Register</h1>

        {/* NAME */}
        <div>
          <input
            type="text"
            name="name"
            placeholder="Enter Name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full border p-3 rounded-lg outline-none"
          />
          {formik.touched.name && formik.errors.name && (
            <p className="text-red-500 text-sm mt-1">
              {formik.errors.name}
            </p>
          )}
        </div>

        {/* EMAIL */}
        <div>
          <input
            type="email"
            name="email"
            placeholder="Enter Email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full border p-3 rounded-lg outline-none"
          />
          {formik.touched.email && formik.errors.email && (
            <p className="text-red-500 text-sm mt-1">
              {formik.errors.email}
            </p>
          )}
        </div>

        {/* PASSWORD */}
        <div>
          <input
            type="password"
            name="password"
            placeholder="Enter Password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full border p-3 rounded-lg outline-none"
          />
          {formik.touched.password && formik.errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {formik.errors.password}
            </p>
          )}
        </div>

        {/* CONFIRM PASSWORD */}
        <div>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full border p-3 rounded-lg outline-none"
          />
          {formik.touched.confirmPassword &&
            formik.errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.confirmPassword}
              </p>
            )}
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          className="bg-black hover:bg-gray-800 text-white py-3 rounded-lg"
        >
          Register
        </button>

        <p className="text-center text-sm">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-red-500 cursor-pointer"
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
}

export default Register;
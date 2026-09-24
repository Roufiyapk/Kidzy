import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";

import api from "../api/api";

function Register() {
const navigate = useNavigate();

const formik = useFormik({
initialValues: {
name: "",
email: "",
password: "",
confirmPassword: "",
},


validationSchema: Yup.object({
  name: Yup.string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters"),

  email: Yup.string()
    .email("Invalid Email")
    .required("Email is required"),

  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),

  confirmPassword: Yup.string()
    .oneOf(
      [Yup.ref("password")],
      "Passwords must match"
    )
    .required("Confirm password is required"),
}),

onSubmit: async (values, { resetForm }) => {
  try {
    // CHECK EXISTING USER
    const checkRes = await api.get(
      `/users?email=${encodeURIComponent(
        values.email.trim()
      )}`
    );

    const existingUsers = checkRes.data;

    if (
      existingUsers &&
      existingUsers.length > 0
    ) {
      toast.error(
        "Email already registered"
      );
      return;
    }

    // CREATE USER
    const response = await api.post(
      "/users",
      {
        name: values.name.trim(),
        email: values.email
          .trim()
          .toLowerCase(),
        password: values.password,
        role: "user",
        blocked: false,
      }
    );

    if (response.data) {
      toast.success(
        "Registration Successful"
      );

      resetForm();

      navigate("/login");
    }
  } catch (error) {
    console.error(
      "Registration error:",
      error
    );

    toast.error(
      "Something went wrong. Please try again."
    );
  }
},


});

return ( <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">


  <div className="w-full max-w-sm bg-white border rounded-xl p-6">

    <h1 className="text-xl font-semibold text-center mb-6">
      Create Account
    </h1>

    <form
      onSubmit={formik.handleSubmit}
      className="space-y-4"
    >

      {/* NAME */}

      <div>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formik.values.name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className="w-full border rounded-md p-2 text-sm outline-none focus:border-black"
        />

        {formik.touched.name &&
          formik.errors.name && (
            <p className="text-red-500 text-xs mt-1">
              {formik.errors.name}
            </p>
          )}
      </div>

      {/* EMAIL */}

      <div>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className="w-full border rounded-md p-2 text-sm outline-none focus:border-black"
        />

        {formik.touched.email &&
          formik.errors.email && (
            <p className="text-red-500 text-xs mt-1">
              {formik.errors.email}
            </p>
          )}
      </div>

      {/* PASSWORD */}

      <div>
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className="w-full border rounded-md p-2 text-sm outline-none focus:border-black"
        />

        {formik.touched.password &&
          formik.errors.password && (
            <p className="text-red-500 text-xs mt-1">
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
          value={
            formik.values.confirmPassword
          }
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className="w-full border rounded-md p-2 text-sm outline-none focus:border-black"
        />

        {formik.touched.confirmPassword &&
          formik.errors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">
              {
                formik.errors
                  .confirmPassword
              }
            </p>
          )}
      </div>

      {/* REGISTER BUTTON */}

      <button
        type="submit"
        className="w-full bg-black text-white text-sm py-2 rounded-md hover:opacity-90 transition"
      >
        Register
      </button>

      {/* LOGIN */}

      <p className="text-center text-xs text-gray-500">
        Already have an account?{" "}

        <span
          onClick={() =>
            navigate("/login")
          }
          className="text-black cursor-pointer font-medium hover:underline"
        >
          Login
        </span>
      </p>

    </form>

  </div>

</div>


);
}

export default Register;

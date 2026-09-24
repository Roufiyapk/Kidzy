import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./Home/Footer";
import ScrollToTop from "./components/ScrollToTop";

// USER PAGES

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProductPage from "./pages/ProductPage";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import SearchResults from "./pages/SearchResults";
import ProductDetails from "./pages/ProductDetails";
import NewArrival from "./pages/NewArrival";
import BestSellersPage from "./pages/BestSellersPage";
import AboutUs from "./pages/AboutUs";

// AUTH & ADMIN

import AuthRoute from "./routes/AuthRoute";
import ProtectedRoute from "./routes/ProtectedRoute";

import AdminProtectedRoute from "./admin/routes/AdminProtectedRoute";
import AdminLayout from "./admin/layout/AdminLayout";

import Dashboard from "./admin/pages/Dashboard";
import Products from "./admin/pages/Products";
import Users from "./admin/pages/Users";
import AdminOrders from "./admin/pages/Orders";
import AdminReviews from "./admin/pages/AdminReviews";

// TOAST

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <div className="bg-white min-h-screen">

      {/* TOAST CONTAINER */}

      <ToastContainer
        className="mt-[80px]"
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
      />

      {/* SCROLL TO TOP */}

      <ScrollToTop />

      <Routes>

        {/* HOME */}

        <Route
          path="/"
          element={
            <>
              <Navbar />
              <Home />
              <Footer />
            </>
          }
        />

        {/* CATEGORY / PRODUCTS */}

        <Route
          path="/products/:category"
          element={
            <>
              <Navbar />
              <ProductPage />
              <Footer />
            </>
          }
        />

        {/* SEARCH */}

        <Route
          path="/search/:query"
          element={
            <>
              <Navbar />
              <SearchResults />
              <Footer />
            </>
          }
        />

        {/* PRODUCT DETAILS */}

        <Route
          path="/product/:id"
          element={
            <>
              <Navbar />
              <ProductDetails />
              <Footer />
            </>
          }
        />

        {/* NEW ARRIVALS */}

        <Route
          path="/new"
          element={
            <>
              <Navbar />
              <NewArrival />
              <Footer />
            </>
          }
        />

        {/* BEST SELLERS */}

        <Route
          path="/bestsellers"
          element={
            <>
              <Navbar />
              <BestSellersPage />
              <Footer />
            </>
          }
        />

        {/* ABOUT US */}

        <Route
          path="/about"
          element={
            <>
              <Navbar />
              <AboutUs />
              <Footer />
            </>
          }
        />

        {/* LOGIN */}

        <Route
          path="/login"
          element={
            <AuthRoute>
              <Login />
            </AuthRoute>
          }
        />

        {/* REGISTER */}

        <Route
          path="/register"
          element={
            <AuthRoute>
              <Register />
            </AuthRoute>
          }
        />

        {/* PROFILE */}

        <Route
          path="/profile"
          element={
            <>
              <Navbar />

              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>

              <Footer />
            </>
          }
        />

        {/* CART */}

        <Route
          path="/cart"
          element={
            <>
              <Navbar />

              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>

              <Footer />
            </>
          }
        />

        {/* WISHLIST */}

        <Route
          path="/wishlist"
          element={
            <>
              <Navbar />

              <ProtectedRoute>
                <Wishlist />
              </ProtectedRoute>

              <Footer />
            </>
          }
        />

        {/* CHECKOUT */}

        <Route
          path="/checkout"
          element={
            <>
              <Navbar />

              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>

              <Footer />
            </>
          }
        />

        {/* ORDERS */}

        <Route
          path="/orders"
          element={
            <>
              <Navbar />

              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>

              <Footer />
            </>
          }
        />

        {/* MY ORDERS - ALIAS */}

        <Route
          path="/myorders"
          element={
            <>
              <Navbar />

              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>

              <Footer />
            </>
          }
        />

        {/* ADMIN ROUTES */}

        <Route element={<AdminProtectedRoute />}>

          <Route
            path="/admin"
            element={<AdminLayout />}
          >

            {/* ADMIN DASHBOARD */}

            <Route
              index
              element={<Dashboard />}
            />

            {/* ADMIN PRODUCTS */}

            <Route
              path="products"
              element={<Products />}
            />

            {/* ADMIN USERS */}

            <Route
              path="users"
              element={<Users />}
            />

            {/* ADMIN ORDERS */}

            <Route
              path="orders"
              element={<AdminOrders />}
            />

            {/* ADMIN REVIEWS */}

            <Route
              path="reviews"
              element={<AdminReviews />}
            />

          </Route>

        </Route>

      </Routes>
    </div>
  );
}

export default App;
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import ProductPage from "./pages/ProductPage";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";

import AuthRoute from "./routes/AuthRoute";
import ProtectedRoute from "./routes/ProtectedRoute";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import SearchResults from "./pages/SearchResults";
import ProductDetails from "./pages/ProductDetails";
import NewArrival from "./pages/NewArrival";

import Dashboard from "./admin/pages/Dashboard";

import AdminLayout from "./admin/layout/AdminLayout";

import AdminProtectedRoute from "./admin/routes/AdminProtectedRoute";

import Products from "./admin/pages/Products";
import Users from "./admin/pages/Users";
import AdminOrders from "./admin/pages/Orders";

import Profile from "./pages/Profile";
import Footer from "./Home/Footer";
import OrderSuccess from "./pages/OrderSuccess";


function App() {

  return (

    <div className="bg-[#f7f3ee] min-h-screen">

      <ToastContainer className="mt-[80px]" />

      <Routes>

        {/* HOME */}

        <Route
          path="/"
          element={
            <>
              <Navbar />
              <Home />
            </>
          }
        />

        {/* PRODUCTS */}

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

        {/* AUTH */}

        <Route
          path="/login"
          element={
            <AuthRoute>
              <Login />
            </AuthRoute>
          }
        />

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

        <Route
          path="/myorders"
          element={
            <>
              <Navbar />

              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            </>
          }
        />
        <Route path="/order-success" element={
          <>
            <Navbar />
            <OrderSuccess />
          </>

        } />

        {/* ADMIN */}

        <Route element={<AdminProtectedRoute />}>

          <Route
            path="/admin"
            element={<AdminLayout />}
          >

            <Route
              index
              element={<Dashboard />}
            />

            <Route
              path="products"
              element={<Products />}
            />

            <Route
              path="users"
              element={<Users />}
            />

            <Route
              path="orders"
              element={<AdminOrders />}
            />


           



          </Route>

        </Route>

      </Routes>

    </div>

  );
}

export default App;
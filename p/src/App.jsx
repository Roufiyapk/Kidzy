import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./Home/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProductPage from "./pages/ProductPage";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import OrderSuccess from "./pages/OrderSuccess";
import SearchResults from "./pages/SearchResults";
import ProductDetails from "./pages/ProductDetails";
import NewArrival from "./pages/NewArrival";
import BestSellersPage from "./pages/BestSellersPage"; // ഇവിടെ പേര് കൃത്യമാക്കി
import AboutUs from "./pages/AboutUs";

// Auth & Admin
import AuthRoute from "./routes/AuthRoute";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminProtectedRoute from "./admin/routes/AdminProtectedRoute";
import AdminLayout from "./admin/layout/AdminLayout";
import Dashboard from "./admin/pages/Dashboard";
import Products from "./admin/pages/Products";
import Users from "./admin/pages/Users";
import AdminOrders from "./admin/pages/Orders";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <div className="bg-[#f7f3ee] min-h-screen">
      <ToastContainer className="mt-[80px]" />
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<><Navbar /><Home /><Footer /></>} />
        <Route path="/products/:category" element={<><Navbar /><ProductPage /><Footer /></>} />
        <Route path="/search/:query" element={<><Navbar /><SearchResults /><Footer /></>} />
        <Route path="/product/:id" element={<><Navbar /><ProductDetails /><Footer /></>} />
        <Route path="/new" element={<><Navbar /><NewArrival /><Footer /></>} />
        <Route path="/bestsellers" element={<><Navbar /><BestSellersPage /><Footer /></>} />
        <Route path="/about" element={<><Navbar /><AboutUs /><Footer /></>} />
        
        {/* AUTH ROUTES */}
        <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
        <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />
        
        {/* PROTECTED USER ROUTES */}
        <Route path="/profile" element={<><Navbar /><ProtectedRoute><Profile /></ProtectedRoute><Footer /></>} />
        <Route path="/cart" element={<><Navbar /><ProtectedRoute><Cart /></ProtectedRoute><Footer /></>} />
        <Route path="/wishlist" element={<><Navbar /><ProtectedRoute><Wishlist /></ProtectedRoute><Footer /></>} />
        <Route path="/checkout" element={<><Navbar /><ProtectedRoute><Checkout /></ProtectedRoute><Footer /></>} />
        <Route path="/orders" element={<><Navbar /><ProtectedRoute><Orders /></ProtectedRoute><Footer /></>} />
        <Route path="/myorders" element={<><Navbar /><ProtectedRoute><Orders /></ProtectedRoute></>} />
        <Route path="/order-success" element={<><Navbar /><OrderSuccess /></>} />

        {/* ADMIN ROUTES */}
        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="users" element={<Users />} />
            <Route path="orders" element={<AdminOrders />} />
          </Route>
        </Route>
      </Routes>
    </div>
  );
}

export default App;
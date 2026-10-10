import {
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaEnvelope,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="bg-black text-[#FFF9F3] mt-16">
      <div className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-10">
        <div>
          <h2 className="text-2xl font-bold mb-3 text-[#FFF9F3]">
            Kidzy ✨
          </h2>

          <p className="text-[#D5C8BB] text-sm leading-6">
            Stylish, comfortable, and affordable products for kids. We focus
            on quality, comfort, and delightful designs that make childhood
            more colorful.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3 text-[#FFF9F3]">
            Quick Links
          </h3>

          <ul className="space-y-2 text-[#D5C8BB]">
            <li
              onClick={() => navigate("/")}
              className="hover:text-[#C9A982] transition-colors duration-200 cursor-pointer"
            >
              Home
            </li>

            <li
              onClick={() => navigate("/products")}
              className="hover:text-[#C9A982] transition-colors duration-200 cursor-pointer"
            >
              Shop
            </li>

            <li
              onClick={() => navigate("/wishlist")}
              className="hover:text-[#C9A982] transition-colors duration-200 cursor-pointer"
            >
              Wishlist
            </li>

            <li
              onClick={() => navigate("/cart")}
              className="hover:text-[#C9A982] transition-colors duration-200 cursor-pointer"
            >
              Cart
            </li>

            <li
              onClick={() => navigate("/myorders")}
              className="hover:text-[#C9A982] transition-colors duration-200 cursor-pointer"
            >
              Orders
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3 text-[#FFF9F3]">
            Contact Us
          </h3>

          <p className="text-[#D5C8BB] text-sm flex items-center gap-2">
            <FaEnvelope className="text-[#C9A982]" />
            support@kidzy.com
          </p>

          <div className="flex gap-4 mt-4 text-xl">
            <FaFacebook className="text-[#D5C8BB] hover:text-[#C9A982] transition-colors duration-200 cursor-pointer" />

            <FaInstagram className="text-[#D5C8BB] hover:text-[#C9A982] transition-colors duration-200 cursor-pointer" />

            <FaTwitter className="text-[#D5C8BB] hover:text-[#C9A982] transition-colors duration-200 cursor-pointer" />
          </div>
        </div>
      </div>

      <div className="border-t border-[#292929] text-center py-4 text-[#B9A99A] text-sm">
        © {new Date().getFullYear()} Kidzy. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
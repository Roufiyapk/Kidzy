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

    <footer className="bg-gray-900 text-white mt-16">

      <div className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-10">


        <div>

          <h2 className="text-2xl font-bold mb-3">

            KidsWear ✨

          </h2>

          <p className="text-gray-400 text-sm leading-6">

            Stylish, comfortable, and affordable clothing for kids.
            We focus on quality fabrics and happy designs that kids love.

          </p>

        </div>


        <div>

          <h3 className="text-lg font-semibold mb-3">

            Quick Links

          </h3>

          <ul className="space-y-2 text-gray-400">

            <li
              onClick={() => navigate("/")}
              className="hover:text-white cursor-pointer"
            >

              Home

            </li>

            <li
              onClick={() => navigate("/products")}
              className="hover:text-white cursor-pointer"
            >

              Shop

            </li>

            <li
              onClick={() => navigate("/wishlist")}
              className="hover:text-white cursor-pointer"
            >

              Wishlist

            </li>

            <li
              onClick={() => navigate("/cart")}
              className="hover:text-white cursor-pointer"
            >

              Cart

            </li>

            <li
              onClick={() => navigate("/myorders")}
              className="hover:text-white cursor-pointer"
            >

              Orders

            </li>

          </ul>

        </div>


        <div>

          <h3 className="text-lg font-semibold mb-3">

            Contact Us

          </h3>

          <p className="text-gray-400 text-sm flex items-center gap-2">

            <FaEnvelope />

            support@kidswear.com

          </p>

          <div className="flex gap-4 mt-4 text-xl">

            <FaFacebook className="hover:text-blue-500 cursor-pointer" />

            <FaInstagram className="hover:text-pink-500 cursor-pointer" />

            <FaTwitter className="hover:text-sky-400 cursor-pointer" />

          </div>

        </div>

      </div>


      <div className="border-t border-gray-800 text-center py-4 text-gray-500 text-sm">

        © {new Date().getFullYear()} KidsWear. All rights reserved.

      </div>

    </footer>
  );
}

export default Footer;
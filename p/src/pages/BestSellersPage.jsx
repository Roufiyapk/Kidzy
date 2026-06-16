import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHeart } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { addToWishlist, removeFromWishlist } from "../redux/wishlistSlice";
import { addWishlistItem, removeWishlistItem } from "../api/wishlistApi";

function BestSellersPage() {
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist.items || []);
  
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const res = await fetch("http://localhost:3001/products");
        const data = await res.json();
        setBestSellers(data.filter((item) => item.bestSeller === true));
      } catch (error) {
        console.error("Error fetching best sellers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBestSellers();
  }, []);

  const handleWishlist = (item, isInWishlist) => {
    if (!user) { 
      toast.info("Please login to add to wishlist");
      navigate("/login"); 
      return; 
    }
    
    if (isInWishlist) {
      dispatch(removeFromWishlist(item.id));
      removeWishlistItem(item.id, user.id);
      toast.success("Removed from wishlist");
    } else {
      dispatch(addToWishlist({ ...item, productId: item.id }));
      addWishlistItem({ ...item, productId: item.id, userId: user.id });
      toast.success("Added to wishlist");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="px-4 md:px-12 py-10 bg-[#f7f3ee] min-h-screen">
      <h1 className="text-3xl md:text-4xl font-bold text-stone-900 tracking-wide mb-8">
        Best Sellers
      </h1>
      
      {bestSellers.length === 0 ? (
        <p className="text-center text-gray-500">No best seller products found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {bestSellers.map((item) => {
            const isInWishlist = wishlistItems.some((w) => String(w.productId ?? w.id) === String(item.id));
            
            return (
              <div 
                key={item.id} 
                onClick={() => navigate(`/product/${item.id}`)}
                className="bg-white p-4 rounded-2xl shadow hover:shadow-lg transition-shadow cursor-pointer group"
              >
                <div className="relative h-60 flex items-center justify-center bg-gray-50 rounded-xl overflow-hidden">
                  <img src={item.image} alt={item.name} className="h-full object-contain group-hover:scale-105 transition-transform" />
                  <div 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      handleWishlist(item, isInWishlist); 
                    }}
                    className="absolute top-3 right-3 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
                  >
                    <FaHeart className={`text-xl ${isInWishlist ? "text-red-500" : "text-gray-300"}`} />
                  </div>
                </div>
                <h2 className="mt-4 font-semibold text-stone-800">{item.name}</h2>
                <p className="font-bold text-lg text-black">₹{item.price}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default BestSellersPage;
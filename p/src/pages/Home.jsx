import Banner from "../Home/Banner";
import CategoryPage from "../Home/CategoryPage";
import ProductPage from "./ProductPage";
import NewDrops from "../Home/NewDrops";
import BestSellers from "../Home/BestSellers";
import Footer from "../Home/Footer";

function Home() {

  return (

    <div className="bg-[#f7f3ee] min-h-screen">
      

      <Banner />
      <CategoryPage/>
      <BestSellers />

      <NewDrops />



    </div>

  );
}

export default Home;
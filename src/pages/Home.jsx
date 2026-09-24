import Banner from "../Home/Banner";
import CategoryPage from "../Home/CategoryPage";
import NewDrops from "../Home/NewDrops";
import BestSellers from "../Home/BestSellers";
import ParentReviews from "../Home/ParentReviews";
function Home() {
  return (
    <div className="bg-[#f7f3ee] min-h-screen">
      <Banner />

      <CategoryPage />

      <BestSellers />
      <ParentReviews />

      

      <NewDrops />
    </div>
  );
}

export default Home;
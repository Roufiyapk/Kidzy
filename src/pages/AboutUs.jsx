import {
  FaCamera,
  FaLightbulb,
  FaChild,
  FaPuzzlePiece,
  FaHeart,
  FaStar,
  FaShoppingBag,
  FaSmile,
  FaTruck,
  FaBookOpen,
} from "react-icons/fa";

function AboutUs() {
  return (
    <main className="min-h-screen bg-[#F7F3EE] text-[#5A4030]">

      {/* 
          HERO
      */}

      <section className="bg-[#F7F3EE] px-5 sm:px-8 md:px-14 py-16 sm:py-20">

        <div className="max-w-5xl mx-auto text-center">

          <p className="uppercase tracking-[0.25em] text-[10px] sm:text-xs font-bold text-[#8A7768]">
            About Kidzy
          </p>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-black mt-4">
            Little Things.
            <br />
            <span className="text-[#5A4030]">
              Big Smiles.
            </span>
          </h1>

          <div className="h-[3px] w-14 bg-[#6B4F3A] rounded-full mx-auto mt-6 mb-7" />

          <p className="max-w-3xl mx-auto text-[#5A4030] text-base sm:text-lg leading-relaxed">
            Kidzy is a place created for little personalities,
            growing imaginations and the families who make childhood
            special.
          </p>

          <p className="max-w-3xl mx-auto text-[#6B4F3A] text-sm sm:text-base leading-relaxed mt-4">
            From fashion and footwear to toys, books, accessories,
            school essentials and activities, we bring together the
            things kids love in one simple place.
          </p>

        </div>

      </section>


      {/* 
          OUR INSPIRATION
       */}

      <section className="bg-white px-5 sm:px-8 md:px-14 py-16 sm:py-20 border-t border-[#E7DED5]">

        <div className="max-w-7xl mx-auto">

          {/* HEADER */}

          <div className="text-center max-w-3xl mx-auto">

            <p className="text-lg sm:text-xl italic font-serif text-[#6B4F3A]">
              Where We Find
            </p>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mt-2">
              Our Inspiration
            </h2>

            <p className="text-[#5A4030] leading-relaxed mt-5 text-sm sm:text-base">
              We find inspiration in everyday childhood — the way
              children play, learn, explore, create and express their
              unique personalities.
            </p>

          </div>


          {/* INSPIRATION CARDS */}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-14">

            {/* CARD 1 */}

            <div className="text-center border border-[#E7DED5] rounded-2xl p-7 bg-white hover:shadow-md transition">

              <div className="w-20 h-20 mx-auto rounded-2xl bg-[#F7F3EE] flex items-center justify-center text-[#5A4030] text-2xl">
                <FaCamera />
              </div>

              <h3 className="font-bold text-lg mt-5">
                Everyday Childhood
              </h3>

              <p className="text-sm text-[#6B4F3A] leading-relaxed mt-2">
                The little moments, routines and adventures that make
                childhood memorable.
              </p>

            </div>


            {/* CARD 2 */}

            <div className="text-center border border-[#E7DED5] rounded-2xl p-7 bg-white hover:shadow-md transition">

              <div className="w-20 h-20 mx-auto rounded-2xl bg-[#F7F3EE] flex items-center justify-center text-[#5A4030] text-2xl">
                <FaLightbulb />
              </div>

              <h3 className="font-bold text-lg mt-5">
                Parent Insights
              </h3>

              <p className="text-sm text-[#6B4F3A] leading-relaxed mt-2">
                Understanding the everyday needs of parents and
                growing families.
              </p>

            </div>


            {/* CARD 3 */}

            <div className="text-center border border-[#E7DED5] rounded-2xl p-7 bg-white hover:shadow-md transition">

              <div className="w-20 h-20 mx-auto rounded-2xl bg-[#F7F3EE] flex items-center justify-center text-[#5A4030] text-2xl">
                <FaChild />
              </div>

              <h3 className="font-bold text-lg mt-5">
                Kids Themselves
              </h3>

              <p className="text-sm text-[#6B4F3A] leading-relaxed mt-2">
                Their favourites, curiosity, energy and wonderfully
                unique personalities.
              </p>

            </div>


            {/* CARD 4 */}

            <div className="text-center border border-[#E7DED5] rounded-2xl p-7 bg-white hover:shadow-md transition">

              <div className="w-20 h-20 mx-auto rounded-2xl bg-[#F7F3EE] flex items-center justify-center text-[#5A4030] text-2xl">
                <FaPuzzlePiece />
              </div>

              <h3 className="font-bold text-lg mt-5">
                Play & Imagination
              </h3>

              <p className="text-sm text-[#6B4F3A] leading-relaxed mt-2">
                The stories, games, creativity and imagination that
                make childhood special.
              </p>

            </div>

          </div>


          {/* DECORATIVE LINE */}

          <div className="flex justify-center mt-14">

            <div className="text-[#6B4F3A] text-3xl tracking-widest">
              〰〰
            </div>

          </div>

        </div>

      </section>


      {/* 
          OUR STORY
       */}

      <section className="bg-white px-5 sm:px-8 md:px-14 py-16 sm:py-20 border-t border-[#E7DED5]">

        <div className="max-w-6xl mx-auto">

          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* LEFT */}

            <div>

              <p className="uppercase tracking-[0.25em] text-[10px] sm:text-xs font-bold text-[#8A7768]">
                Our Story
              </p>

              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black leading-tight mt-3">
                Built around
                <br />
                <span className="text-[#5A4030]">
                  little moments
                </span>
              </h2>

              <div className="h-[3px] w-14 bg-[#6B4F3A] rounded-full mt-6 mb-6" />

              <p className="text-[#5A4030] leading-relaxed">
                Kidzy started with a simple idea: shopping for
                children should feel easy, enjoyable and full of
                discovery.
              </p>

              <p className="text-[#5A4030] leading-relaxed mt-5">
                Parents are always looking for things that fit into
                everyday family life — comfortable clothing, school
                essentials, fun toys, books and useful accessories.
              </p>

              <p className="text-[#5A4030] leading-relaxed mt-5">
                Kidzy brings these everyday needs together so families
                can discover, choose and shop from one place.
              </p>

            </div>


            {/* RIGHT */}

            <div className="grid grid-cols-2 gap-4">

              {/* ITEM 1 */}

              <div className="rounded-2xl border border-[#E7DED5] p-6 min-h-[180px] flex flex-col justify-between bg-white">

                <div className="w-11 h-11 rounded-xl bg-[#F7F3EE] flex items-center justify-center text-[#5A4030]">
                  <FaHeart />
                </div>

                <div>
                  <h3 className="font-bold text-lg">
                    Made with Care
                  </h3>

                  <p className="text-sm text-[#6B4F3A] mt-2">
                    Every little detail matters.
                  </p>
                </div>

              </div>


              {/* ITEM 2 */}

              <div className="rounded-2xl border border-[#E7DED5] p-6 min-h-[180px] flex flex-col justify-between bg-white">

                <div className="w-11 h-11 rounded-xl bg-[#F7F3EE] flex items-center justify-center text-[#6B4F3A]">
                  <FaSmile />
                </div>

                <div>
                  <h3 className="font-bold text-lg">
                    Made for Smiles
                  </h3>

                  <p className="text-sm text-[#6B4F3A] mt-2">
                    Shopping should feel joyful.
                  </p>
                </div>

              </div>


              {/* ITEM 3 */}

              <div className="rounded-2xl border border-[#E7DED5] p-6 min-h-[180px] flex flex-col justify-between bg-white">

                <div className="w-11 h-11 rounded-xl bg-[#F7F3EE] flex items-center justify-center text-[#6B4F3A]">
                  <FaStar />
                </div>

                <div>
                  <h3 className="font-bold text-lg">
                    Quality Matters
                  </h3>

                  <p className="text-sm text-[#6B4F3A] mt-2">
                    Thoughtfully selected products.
                  </p>
                </div>

              </div>


              {/* ITEM 4 */}

              <div className="rounded-2xl border border-[#E7DED5] p-6 min-h-[180px] flex flex-col justify-between bg-white">

                <div className="w-11 h-11 rounded-xl bg-[#F7F3EE] flex items-center justify-center text-[#6B4F3A]">
                  <FaShoppingBag />
                </div>

                <div>
                  <h3 className="font-bold text-lg">
                    One Happy Place
                  </h3>

                  <p className="text-sm text-[#6B4F3A] mt-2">
                    Discover more in one place.
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/*
          WHAT WE OFFER
       */}

      <section className="bg-white px-5 sm:px-8 md:px-14 py-16 sm:py-20 border-t border-[#E7DED5]">

        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-12">

            <p className="uppercase tracking-[0.25em] text-[10px] sm:text-xs font-bold text-[#8A7768]">
              What You Can Find
            </p>

            <h2 className="font-serif text-3xl sm:text-4xl font-black mt-3">
              Everything little ones need
            </h2>

            <p className="text-[#6B4F3A] max-w-2xl mx-auto mt-4 text-sm sm:text-base">
              Explore a growing collection made for everyday life,
              learning, play and special moments.
            </p>

          </div>


          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            {/* FASHION */}

            <div className="border border-[#E7DED5] rounded-2xl p-6 bg-white hover:shadow-md transition">

              <FaChild className="text-[#6B4F3A] text-2xl mb-4" />

              <h3 className="font-bold text-lg">
                Fashion
              </h3>

              <p className="text-sm text-[#6B4F3A] mt-2">
                Everyday outfits and special occasion styles.
              </p>

            </div>


            {/* TOYS */}

            <div className="border border-[#E7DED5] rounded-2xl p-6 bg-white hover:shadow-md transition">

              <FaPuzzlePiece className="text-[#6B4F3A] text-2xl mb-4" />

              <h3 className="font-bold text-lg">
                Toys
              </h3>

              <p className="text-sm text-[#6B4F3A] mt-2">
                Fun discoveries for curious little minds.
              </p>

            </div>


            {/* BOOKS */}

            <div className="border border-[#E7DED5] rounded-2xl p-6 bg-white hover:shadow-md transition">

              <FaBookOpen className="text-[#6B4F3A] text-2xl mb-4" />

              <h3 className="font-bold text-lg">
                Books
              </h3>

              <p className="text-sm text-[#6B4F3A] mt-2">
                Stories and activities that inspire imagination.
              </p>

            </div>


            {/* ESSENTIALS */}

            <div className="border border-[#E7DED5] rounded-2xl p-6 bg-white hover:shadow-md transition">

              <FaShoppingBag className="text-[#6B4F3A] text-2xl mb-4" />

              <h3 className="font-bold text-lg">
                Essentials
              </h3>

              <p className="text-sm text-[#6B4F3A] mt-2">
                Accessories, footwear and everyday essentials.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/*
          OUR PROMISE
      */}

      <section className="bg-white px-5 sm:px-8 md:px-14 py-16 sm:py-20 border-t border-[#E7DED5]">

        <div className="max-w-4xl mx-auto text-center">

          <div className="w-14 h-14 mx-auto rounded-full bg-[#F7F3EE] flex items-center justify-center text-[#5A4030] text-xl">
            <FaHeart />
          </div>

          <p className="uppercase tracking-[0.25em] text-[10px] font-bold text-[#8A7768] mt-6">
            Our Promise
          </p>

          <h2 className="font-serif text-3xl sm:text-4xl font-black mt-3">
            Childhood should feel like childhood
          </h2>

          <p className="text-[#5A4030] text-base sm:text-lg leading-relaxed max-w-3xl mx-auto mt-5">
            Colourful, playful, curious and full of little
            adventures. We want to make the shopping experience
            around childhood simple, enjoyable and memorable.
          </p>

          <div className="h-[2px] w-16 bg-[#6B4F3A] rounded-full mx-auto mt-8" />

        </div>

      </section>


      {/* 
          HIGHLIGHTS
     */}

      <section className="bg-[#F7F3EE] border-t border-[#E7DED5]">

        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4">

          {/* FAMILY FIRST */}

          <div className="py-8 px-5 text-center border-b md:border-b-0 md:border-r border-[#E7DED5]">

            <FaHeart className="mx-auto text-[#6B4F3A] mb-3" />

            <h3 className="font-bold text-lg">
              Family First
            </h3>

            <p className="text-xs text-[#6B4F3A] mt-1">
              Designed around family needs
            </p>

          </div>


          {/* QUALITY */}

          <div className="py-8 px-5 text-center border-b md:border-b-0 md:border-r border-[#E7DED5]">

            <FaStar className="mx-auto text-[#6B4F3A] mb-3" />

            <h3 className="font-bold text-lg">
              Quality Focused
            </h3>

            <p className="text-xs text-[#6B4F3A] mt-1">
              Carefully selected products
            </p>

          </div>


          {/* EASY SHOPPING */}

          <div className="py-8 px-5 text-center border-b md:border-b-0 md:border-r border-[#E7DED5]">

            <FaTruck className="mx-auto text-[#6B4F3A] mb-3" />

            <h3 className="font-bold text-lg">
              Easy Shopping
            </h3>

            <p className="text-xs text-[#6B4F3A] mt-1">
              Simple from browse to delivery
            </p>

          </div>


          {/* ONE HAPPY PLACE */}

          <div className="py-8 px-5 text-center">

            <FaShoppingBag className="mx-auto text-[#6B4F3A] mb-3" />

            <h3 className="font-bold text-lg">
              One Happy Place
            </h3>

            <p className="text-xs text-[#6B4F3A] mt-1">
              Many little things in one place
            </p>

          </div>

        </div>

      </section>


      {/*
          FINAL CTA
      */}

      <section className="bg-[#5A4030] text-white px-5 sm:px-8 md:px-14 py-16 sm:py-20">

        <div className="max-w-4xl mx-auto text-center">

          <FaHeart className="mx-auto text-[#E7DED5] text-2xl mb-5" />

          <p className="uppercase tracking-[0.25em] text-[10px] font-bold text-[#8A7768]">
            Welcome to Kidzy
          </p>

          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black mt-3">
            Made for little moments.
          </h2>

          <p className="text-[#E7DED5] max-w-2xl mx-auto leading-relaxed mt-5">
            Fashion, play, learning and everyday essentials —
            all brought together for little ones and their families.
          </p>

        </div>

      </section>

    </main>
  );
}

export default AboutUs;
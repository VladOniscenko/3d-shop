import Navbar from "./Navbar";
import Hero from "./Hero";
import HowItWorks from "./HowItWorks";
import MaterialsSection from "./MaterialsSection";
import RecentPrints from "./RecentPrints";
import Footer from "./Footer";

export default function Home() {
  return (
    <div className="site-shell font-sans text-gray-900 selection:bg-emerald-100">
      <Navbar />
      <main className="site-main px-2 sm:px-4 py-10 space-y-10">
        <Hero />
        <section className="site-section p-6 sm:p-8">
          <HowItWorks />
        </section>
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start pb-12">
          <div className="site-section p-6 sm:p-8">
            <MaterialsSection />
          </div>
          <div className="site-section p-6 sm:p-8">
            <RecentPrints />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

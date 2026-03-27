import Navbar from "./Navbar";
import Hero from "./Hero";
import HowItWorks from "./HowItWorks";
import MaterialsSection from "./MaterialsSection";
import RecentPrints from "./RecentPrints";
import Footer from "./Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans text-gray-900 selection:bg-emerald-100">
      <Navbar />
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-10 space-y-16">
        <Hero />
        <HowItWorks />
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start pb-20">
          <MaterialsSection />
          <RecentPrints />
        </section>
      </main>
      <Footer />
    </div>
  );
}

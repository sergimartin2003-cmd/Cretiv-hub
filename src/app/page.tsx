import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import ExploreSection from "@/components/ExploreSection";
import Collections from "@/components/Collections";
import Trending from "@/components/Trending";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import ProgressBar from "@/components/ProgressBar";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0d1117] relative">
      <ProgressBar />
      <Navbar />
      <Hero />
      <div className="section-divider my-0" />
      <Categories />
      <div className="section-divider my-0" />
      <ExploreSection />
      <div className="section-divider my-0" />
      <Collections />
      <div className="section-divider my-0" />
      <Trending />
      <div className="section-divider my-0" />
      <CTA />
      <Footer />
    </main>
  );
}

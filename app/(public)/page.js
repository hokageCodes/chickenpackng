import HeroSection from "@/components/sections/HeroSection";
import ProcessSection from "@/components/sections/OurProcessSection";
import TestimonialsCarousel from "@/components/sections/TestimonialsSection";
import FAQ from "@/components/sections/FAQSection";
import GallerySection from "@/components/sections/GallerySection";
import PopularProducts from "@/components/sections/PopularProducts";

export default function Home() {
  return (
    <>
      <HeroSection />
      <PopularProducts />
      <TestimonialsCarousel />
      <ProcessSection />
      <FAQ />
      <GallerySection />
    </>

  );
}

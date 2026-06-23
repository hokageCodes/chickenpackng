import HeroSection from "@/components/sections/HeroSection";
import PerksSection from "@/components/sections/PerksSection";
import ProcessSection from "@/components/sections/OurProcessSection";
import OriginSection from "@/components/sections/OurOriginSection";
import TestimonialsCarousel from "@/components/sections/TestimonialsSection";
import FAQ from "@/components/sections/FAQSection";
import GallerySection from "@/components/sections/GallerySection";
import CTASection from "@/components/sections/CTASection";
import PopularProducts from "@/components/sections/PopularProducts";

export default function Home() {
  return (
    <>
      <HeroSection />
      <PerksSection />
      <PopularProducts />
      <ProcessSection />
      <OriginSection />
      <TestimonialsCarousel />
      <FAQ />
      <GallerySection />
      <CTASection />
    </>

  );
}

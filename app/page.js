import Image from "next/image";
import styles from "./page.module.css";
import HeroSection from "@/components/sections/HeroSection";
import ProductSection from "@/components/sections/ProductsSection";
import ProcessSection from "@/components/sections/OurProcessSection";
import Testimonials from "@/components/sections/TestimonialsSection";
import FAQ from "@/components/sections/FAQSection";
import GallerySection from "@/components/sections/GallerySection";
import PopularProducts from "@/components/sections/PopularProducts";

export default function Home() {
  return (
    <>
      <HeroSection />
      <PopularProducts />
      <ProcessSection />
      <Testimonials />
      <FAQ />
      <GallerySection />
    </>

  );
}

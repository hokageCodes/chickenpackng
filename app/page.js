import Image from "next/image";
import styles from "./page.module.css";
import HeroSection from "@/components/sections/HeroSection";
import ProductSection from "@/components/sections/ProductsSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <ProductSection />
    </>

  );
}

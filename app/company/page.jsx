'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { FaCheckCircle } from 'react-icons/fa';

export default function ChickenPackCompanyPage() {
  return (
    <div className="bg-[#FEFBF6] text-[#3D3C42] text-base">
      {/* Hero Section */}
      <section className="relative h-[60vh] md:h-[55vh] w-full bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/assets/2.jpg')" }}>
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center px-4 text-center">
            <h1 className="text-3xl md:text-7xl font-bold text-white leading-tight max-w-5xl">
            Welcome To Our Coop
            </h1>
        </div>
        </section>

        <section className="py-10 px-6 md:px-16 text-center bg-[#FEFBF6]">
        <p className="max-w-2xl mx-auto text-lg text-[#000000]">
            Chicken Pack specializes in providing high-quality, fresh broiler meat and eggs to households,
            restaurants, and businesses. Our mission is to deliver fresh, healthy, and affordable poultry
            products while maintaining the highest standards of quality and hygiene.
        </p>
        </section>


        <section className="py-10 px-6 md:px-16 text-center bg-[#FEFBF6]">
        <p className="max-w-2xl mx-auto text-lg text-[#000000]">
            Chicken Pack specializes in providing high-quality, fresh broiler meat and eggs to households,
            restaurants, and businesses. Our mission is to deliver fresh, healthy, and affordable poultry
            products while maintaining the highest standards of quality and hygiene.
        </p>
        </section>


      {/* CEO Section */}
      <section className="bg-[#A6D1E6] py-12 px-6 md:px-16 text-center text-[#3D3C42]">
        <h2 className="text-2xl font-semibold mb-2">Philip Omoike</h2>
        <p className="text-lg font-medium mb-4">CEO of Chicken Pack</p>
        <h2 className="text-2xl font-semibold mb-2">Abiodun Young</h2>
        <p className="text-lg font-medium">CEO of Chicken Pack</p>
      </section>

      {/* Vision & Mission */}
      <section className="py-16 px-6 md:px-16 bg-white text-center">
        <h2 className="text-4xl font-bold text-[#7F5283] mb-8">Our Vision & Mission</h2>
        <div className="grid md:grid-cols-2 gap-12 text-left max-w-6xl mx-auto">
          <div>
            <h3 className="text-2xl font-semibold text-[#3D3C42] mb-2">Our Vision</h3>
            <p>
              To provide fresh, high-quality broiler meat and eggs to our community, ensuring affordability,
              convenience, and strict hygiene standards. We strive to become the most trusted poultry
              supplier by prioritizing customer satisfaction and sustainable farming partnerships.
            </p>
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-[#3D3C42] mb-2">Our Mission</h3>
            <p>
              To revolutionize poultry consumption in Nigeria by making nutritious, farm-fresh broiler meat
              and eggs accessible to every household and business, while setting industry standards for
              quality and service.
            </p>
          </div>
        </div>
      </section>

      {/* Popular Products */}
      <section className="py-16 px-6 md:px-16 bg-[#F8F8F8] text-center">
        <h2 className="text-4xl font-bold text-[#7F5283] mb-8">Popular Products</h2>
        <div className="flex flex-wrap justify-center gap-6 text-lg font-medium">
          {['Eggs', 'Full Chicken', 'Chicken Wings', 'Chicken Laps', 'Chicken Chest'].map((item) => (
            <div key={item} className="bg-white py-4 px-8 rounded-xl shadow text-[#3D3C42]">
              {item}
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-[#7F5283]">www.thechickenpack.com</p>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 px-6 md:px-16 text-center bg-white">
        <h2 className="text-4xl font-bold text-[#7F5283] mb-8">Why Choose Us?</h2>
        <p className="max-w-3xl mx-auto text-lg">
          Choose Chicken Pack for fresh broiler meat and eggs that redefine quality and convenience. We
          combine ethical sourcing, hygienic processing, and doorstep delivery to bring you farm-to-table
          freshness at unbeatable prices. Trusted by households and businesses alike, we’re not just a
          supplier—we’re your partner in serving meals that matter.
        </p>
      </section>

      {/* Production Steps */}
      <section className="py-16 px-6 md:px-16 bg-[#FAF6F0] text-center">
        <h2 className="text-4xl font-bold text-[#7F5283] mb-8">Production Steps</h2>
        <div className="grid md:grid-cols-3 gap-6 text-left max-w-6xl mx-auto">
          {[
            'Sourcing DOC: We partner with reputable hatcheries to procure healthy day-old chicks.',
            'Brooding: Ensure vaccination, proper feeding, and environment setup.',
            'Health Management: Regular checks for disease prevention.',
            'Growth & Monitoring: Feed, track, and ensure proper development.',
            'Processing & Storage: Humane slaughter, food-grade packaging.',
            'Cold Storage: Stored safely between -4°C and -1°C.'
          ].map((step, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow">
              <div className="flex items-start gap-3 mb-2 text-[#3D3C42]">
                <FaCheckCircle className="text-[#7F5283] mt-1" />
                <p>{step}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Meet Our Team */}
      <section className="py-16 px-6 md:px-16 bg-white text-center">
        <h2 className="text-4xl font-bold text-[#7F5283] mb-8">Meet Our Team</h2>
        <p className="max-w-3xl mx-auto text-lg">
          Behind every fresh cut of broiler meat and every tray of eggs is a team dedicated to excellence. Our
          passionate team—from poultry experts to delivery champions—works tirelessly to ensure the highest
          standards of hygiene, freshness, and customer care.
        </p>
        <p className="mt-4 text-[#7F5283] font-medium">Together, we’re raising the bar for quality in the poultry industry.</p>
      </section>
    </div>
  );
}

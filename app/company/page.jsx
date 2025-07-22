'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { FaCheckCircle } from 'react-icons/fa';

export default function ChickenPackCompanyPage() {
  return (
    <div className="bg-[#191919] text-[#3D3C42] text-base">
      {/* Hero Section */}
      <section className="relative h-[60vh] md:h-[7 5vh] w-full bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/assets/2.jpg')" }}>
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center px-4 text-center">
            <h1 className="text-3xl md:text-7xl font-bold text-white leading-tight max-w-5xl">
            Welcome To Our Coop
            </h1>
        </div>
        </section>

        <section className="py-10 px-6 md:px-16 text-center">
        <p className="max-w-2xl mx-auto text-lg text-gray-400">
            Chicken Pack specializes in providing high-quality, fresh broiler meat and eggs to households,
            restaurants, and businesses. Our mission is to deliver fresh, healthy, and affordable poultry
            products while maintaining the highest standards of quality and hygiene.
        </p>
        </section>

        <section className="py-24 px-4 md:px-16 relative">
  {/* Animated background elements */}
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#3498DB]/20 rounded-full blur-3xl animate-pulse"></div>
    <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-yellow-500 rounded-full blur-2xl animate-pulse delay-700"></div>
  </div>

  <div className="relative z-10 max-w-7xl mx-auto">
    {/* Header */}
    <div className="text-center mb-20">
      <div className="inline-block">
        <h2 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tight">
          THE MINDS
        </h2>
        <div className="h-2 bg-gradient-to-r from-[#3498DB] to-[#A6D1E6] rounded-full transform -skew-x-12"></div>
      </div>
      <p className="text-xl text-gray-300 mt-8 max-w-3xl mx-auto font-light">
        Behind every revolution are the visionaries who dare to challenge the status quo
      </p>
    </div>

    {/* Split Layout */}
    <div className="grid lg:grid-cols-2 gap-0 bg-white rounded-3xl overflow-hidden shadow-2xl">
      
      {/* Left Side - Philip */}
      <div className="relative bg-gradient-to-br from-[#3498DB] to-[#2980B9] p-12 text-white">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-start gap-6 mb-8">
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white/30 shadow-xl flex-shrink-0">
              <img
                src="/ceo1.jpg"
                alt="Philip Omoike"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-3xl font-bold mb-2">Philip Omoike</h3>
              <p className="text-blue-100 text-lg font-medium">Co-Founder & CEO</p>
              <div className="w-16 h-1 bg-white/50 mt-3 rounded-full"></div>
            </div>
          </div>

          <blockquote className="text-lg leading-relaxed mb-8 text-blue-50 italic">
            "Innovation isn't just about technology—it's about reimagining how we feed the world sustainably."
          </blockquote>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-blue-100">15+ years in AgriTech</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-blue-100">Food Systems Innovation</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-blue-100">Sustainable Agriculture Expert</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Abiodun */}
      <div className="relative bg-gradient-to-br from-[#A6D1E6] to-[#7FB3D3] p-12 text-[#2C3E50]">
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/20 rounded-full blur-xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-start gap-6 mb-8">
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white/50 shadow-xl flex-shrink-0">
              <img
                src="/ceo2.jpg"
                alt="Abiodun Young"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-3xl font-bold mb-2">Abiodun Young</h3>
              <p className="text-[#2980B9] text-lg font-medium">Co-Founder & CEO</p>
              <div className="w-16 h-1 bg-[#2C3E50]/30 mt-3 rounded-full"></div>
            </div>
          </div>

          <blockquote className="text-lg leading-relaxed mb-8 text-[#34495E] italic">
            "Excellence in execution transforms bold visions into market-changing realities."
          </blockquote>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-[#2C3E50] rounded-full"></div>
              <span className="text-[#34495E]">Supply Chain Mastery</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-[#2C3E50] rounded-full"></div>
              <span className="text-[#34495E]">Operations Excellence</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-[#2C3E50] rounded-full"></div>
              <span className="text-[#34495E]">Market Strategy Leader</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Bottom CTA */}
    <div className="text-center mt-16">
      <p className="text-gray-300 text-lg mb-6">Ready to join the revolution?</p>
      <button className="bg-gradient-to-r from-[#3498DB] to-[#A6D1E6] text-white px-10 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 hover:scale-105">
        Connect With Our Team
      </button>
    </div>
  </div>
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
